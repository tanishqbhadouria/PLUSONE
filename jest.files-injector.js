// jest.files-injector.js
// Replicates Karma's files injection pattern using JSDOM

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class FilesInjector {
  constructor(dom) {
    this.dom = dom;
    this.window = dom.window;
    this.document = dom.window.document;
    this.loadedFiles = new Set();
  }

  // Replicate Karma's files config
  static karmaFilesConfig = [
    // Utility files (non-module functions)
    'src/utils/**/*.js',
    
    // AngularJS app and modules
    'src/app.js',
    'src/services/**/*.js',
    'src/controllers/**/*.js',
    'src/directives/**/*.js',
    'src/filters/**/*.js',
    
    // Third-party libraries (if not using npm)
    'lib/**/*.js',
    
    // Test utilities
    'test/helpers/**/*.js'
  ];

  // Load file content and inject as script
  injectScript(filePath, options = {}) {
    const {
      async = false,
      defer = false,
      type = 'text/javascript',
      onload = null,
      onerror = null
    } = options;

    return new Promise((resolve, reject) => {
      try {
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Create script element
        const script = this.document.createElement('script');
        script.type = type;
        script.async = async;
        script.defer = defer;
        
        // Add content to script
        script.textContent = content;
        
        // Add event handlers
        if (onload) {
          script.onload = onload;
        }
        if (onerror) {
          script.onerror = onerror;
        }
        
        // Inject into document head
        this.document.head.appendChild(script);
        
        // Mark as loaded
        this.loadedFiles.add(filePath);
        
        console.log(`✅ Injected: ${path.basename(filePath)}`);
        resolve(filePath);
      } catch (error) {
        console.error(`❌ Failed to inject: ${filePath}`, error.message);
        reject(error);
      }
    });
  }

  // Load multiple files in order (like Karma)
  async injectFiles(filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        await this.injectScript(filePath);
        results.push({ file: filePath, status: 'success' });
      } catch (error) {
        results.push({ file: filePath, status: 'error', error });
      }
    }
    
    return results;
  }

  // Glob pattern support (like Karma)
  expandGlobPatterns(patterns) {
    const glob = require('glob');
    const allFiles = [];
    
    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { 
        ignore: ['**/*.spec.js', '**/*.test.js', '**/node_modules/**']
      });
      allFiles.push(...files);
    });
    
    // Remove duplicates and sort
    return [...new Set(allFiles)].sort();
  }

  // Karma-like file loading
  async loadKarmaFiles(customPatterns = null) {
    const patterns = customPatterns || FilesInjector.karmaFilesConfig;
    const files = this.expandGlobPatterns(patterns);
    
    console.log('📁 Loading files in Karma-like order:');
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    
    return await this.injectFiles(files);
  }

  // Check if function is available globally
  isGloballyAvailable(functionName) {
    return typeof this.window[functionName] === 'function';
  }

  // List all global functions added
  getGlobalFunctions() {
    const globals = {};
    
    for (const key in this.window) {
      if (typeof this.window[key] === 'function' && 
          !key.startsWith('_') && 
          key !== 'Function') {
        globals[key] = this.window[key];
      }
    }
    
    return globals;
  }

  // Debug: Show loaded files
  getLoadedFiles() {
    return Array.from(this.loadedFiles);
  }
}

module.exports = FilesInjector;
