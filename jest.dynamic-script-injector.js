// jest.dynamic-script-injector.js
// Advanced JSDOM script injection that mimics Karma's behavior exactly

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class DynamicScriptInjector {
  constructor(jsdom) {
    this.dom = jsdom;
    this.window = jsdom.window;
    this.document = jsdom.window.document;
    this.loadedScripts = [];
  }

  /**
   * Inject script content directly into JSDOM's script tag (like Karma does)
   * This executes the script in the global context automatically
   */
  injectScriptContent(scriptContent, fileName = 'injected-script.js') {
    return new Promise((resolve, reject) => {
      try {
        // Create script tag in JSDOM
        const scriptElement = this.document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.textContent = scriptContent;
        
        // Add error handling
        scriptElement.onerror = (error) => {
          console.error(`❌ Failed to inject script ${fileName}:`, error);
          reject(error);
        };

        // Add success handling
        scriptElement.onload = () => {
          console.log(`✅ Injected script: ${fileName}`);
          this.loadedScripts.push(fileName);
          resolve(fileName);
        };

        // Inject into DOM - this executes the script!
        this.document.head.appendChild(scriptElement);
        
        // For inline scripts, onload doesn't fire, so resolve immediately
        if (scriptContent.trim()) {
          console.log(`✅ Injected inline script: ${fileName}`);
          this.loadedScripts.push(fileName);
          resolve(fileName);
        }
      } catch (error) {
        console.error(`❌ Script injection error for ${fileName}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Load script file and inject it into JSDOM (like Karma's file loading)
   */
  async injectScriptFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      
      // Check if already loaded
      if (this.loadedScripts.includes(absolutePath)) {
        console.log(`ℹ️ Script already loaded: ${filePath}`);
        return true;
      }
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const scriptContent = fs.readFileSync(absolutePath, 'utf8');
      
      // Wrap in IIFE to simulate browser script loading
      const wrappedScript = `
        (function() {
          // File: ${filePath}
          ${scriptContent}
        })();
      `;

      const result = await this.injectScriptContent(wrappedScript, filePath);
      
      // Track loaded script after successful injection
      if (result) {
        this.loadedScripts.push(absolutePath);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to load script file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Load multiple files using glob patterns (like Karma's files config)
   */
  async loadKarmaFiles(filePatterns) {
    const results = [];
    
    for (const pattern of filePatterns) {
      try {
        const files = glob.sync(pattern);
        console.log(`📁 Pattern "${pattern}" matched ${files.length} files`);
        
        for (const file of files) {
          try {
            await this.injectScriptFile(file);
            results.push({ file, status: 'success' });
          } catch (error) {
            console.warn(`⚠️ Failed to load ${file}:`, error.message);
            results.push({ file, status: 'error', error: error.message });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Pattern "${pattern}" failed:`, error.message);
        results.push({ pattern, status: 'pattern-error', error: error.message });
      }
    }

    return results;
  }

  /**
   * Add external script URL (like Karma's CDN loading)
   */
  async injectExternalScript(url) {
    return new Promise((resolve, reject) => {
      const scriptElement = this.document.createElement('script');
      scriptElement.src = url;
      scriptElement.type = 'text/javascript';
      
      scriptElement.onload = () => {
        console.log(`✅ Loaded external script: ${url}`);
        this.loadedScripts.push(url);
        resolve(url);
      };
      
      scriptElement.onerror = (error) => {
        console.error(`❌ Failed to load external script ${url}:`, error);
        reject(error);
      };

      this.document.head.appendChild(scriptElement);
    });
  }

  /**
   * Get list of loaded scripts
   */
  getLoadedScripts() {
    return [...this.loadedScripts];
  }

  /**
   * Check what global functions are available after script injection
   */
  getGlobalFunctions() {
    const globals = {};
    const globalObj = this.window;
    
    for (const key in globalObj) {
      if (typeof globalObj[key] === 'function' && 
          !key.startsWith('_') && 
          key !== 'constructor') {
        globals[key] = typeof globalObj[key];
      }
    }
    
    return globals;
  }

  /**
   * Get list of successfully loaded scripts
   */
  getLoadedScripts() {
    return [...this.loadedScripts];
  }

  /**
   * Execute JavaScript code in the JSDOM context
   */
  executeInContext(code) {
    try {
      // First try to execute in the window context where scripts are loaded
      try {
        const result = this.window.eval(code);
        return result;
      } catch (windowError) {
        // If that fails, try to use a comprehensive context with all available functions
        const contextVars = {};
        
        // Copy all window properties to context
        for (const key in this.window) {
          try {
            const value = this.window[key];
            if (typeof value === 'function') {
              contextVars[key] = value;
            }
          } catch (e) {
            // Skip properties that can't be accessed
          }
        }
        
        // Copy global properties to context as well
        for (const key in global) {
          try {
            if (typeof global[key] === 'function' && !contextVars[key]) {
              contextVars[key] = global[key];
            }
          } catch (e) {
            // Skip properties that can't be accessed
          }
        }
        
        // Create the execution context with all available functions
        const contextKeys = Object.keys(contextVars);
        const contextValues = contextKeys.map(key => contextVars[key]);
        
        // Execute with full context
        const func = new Function(...contextKeys, `return (${code})`);
        const result = func(...contextValues);
        
        return result;
      }
    } catch (error) {
      console.error('❌ Context execution error:', error);
      throw error;
    }
  }

  /**
   * Get functions that are available in the window context
   */
  getWindowFunctions() {
    const functions = {};
    const win = this.window;
    
    // Get all function properties from window
    for (const key in win) {
      try {
        if (typeof win[key] === 'function' && 
            !key.startsWith('_') && 
            key !== 'constructor' &&
            !['alert', 'confirm', 'prompt', 'open', 'close', 'stop', 'focus', 'blur'].includes(key)) {
          functions[key] = win[key];
        }
      } catch (e) {
        // Skip properties that can't be accessed
      }
    }
    
    return functions;
  }

  /**
   * Create a Karma-like files configuration and load all scripts
   */
  async setupKarmaEnvironment(config = {}) {
    const defaultConfig = {
      files: [
        // Default file patterns
        'src/utils/**/*.js',
        'src/app.js',
        'src/services/**/*.js',
        'src/controllers/**/*.js',
        'test/helpers/**/*.js'
      ],
      served: true,
      included: true
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    console.log('🚀 Setting up Karma-like environment...');
    console.log('📁 File patterns:', finalConfig.files);

    const results = await this.loadKarmaFiles(finalConfig.files);
    
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Loaded ${successful} files successfully`);
    if (failed > 0) {
      console.log(`⚠️ Failed to load ${failed} files`);
    }

    const globals = this.getGlobalFunctions();
    console.log(`🌐 Global functions available: ${Object.keys(globals).length}`);
    
    return {
      results,
      successful,
      failed,
      globals,
      loadedScripts: this.getLoadedScripts()
    };
  }
}

module.exports = DynamicScriptInjector;
