// jest.setup.js - Enhanced with Dynamic Script Injection via JSDOM

// 1. Add polyfills for JSDOM compatibility
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Load Angular and Angular Mocks first
require('angular');
require('angular-mocks');

// 3. Setup JSDOM with dynamic script injection
const { JSDOM } = require('jsdom');
const DynamicScriptInjector = require('./jest.dynamic-script-injector');

// Create JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
});

// Make JSDOM window/document globally available
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Create dynamic script injector
const scriptInjector = new DynamicScriptInjector(dom);
global.scriptInjector = scriptInjector;

// 4. Setup Karma-like environment with dynamic script injection
global.setupKarmaLikeEnvironment = async function() {
  try {
    console.log('🚀 Setting up Karma-like environment with dynamic script injection...');
    
    // Define file patterns like karma.conf.js
    const karmaConfig = {
      files: [
        // Pure utility files (no manual global assignments needed!)
        'src/utils/pure-*.js',
        
        // Application files
        'src/app.js',
        'src/services/**/*.js',
        'src/controllers/**/*.js',
        
        // Test helpers
        'test/helpers/**/*.js'
      ]
    };

    // Load all scripts using dynamic injection
    const result = await scriptInjector.setupKarmaEnvironment(karmaConfig);
    
    // Make Angular available
    global.angular = dom.window.angular;
    
    console.log('✅ Dynamic script injection complete!');
    console.log(`📁 Scripts loaded: ${result.successful}`);
    console.log(`🌐 Global functions: ${Object.keys(result.globals).length}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to setup Karma-like environment:', error);
    return null;
  }
};

// 5. Fallback manual loading for existing files
const manuallyLoadExistingFiles = () => {
  try {
    require('./src/app.js');
    require('./src/services/userService.js');
    require('./src/services/notificationService.js');
    require('./src/services/loggerService.js');
    require('./src/controllers/userManagementController.js');
    require('./src/controllers/dashboardController.js');
    
    // Legacy utilities with manual global assignments
    require('./src/utils/helpers.js');
    require('./src/utils/dom-helpers.js');
    require('./test/helpers/test-utilities.js');
    
    console.log('✅ Fallback: manually loaded existing files');
  } catch (error) {
    console.log('ℹ️ Some files not found (normal for basic setups)');
  }
};

// 6. Auto-initialize environment with better error handling
(async function() {
  try {
    console.log('🚀 Initializing dynamic script injection...');
    
    // Try dynamic script injection first
    const result = await global.setupKarmaLikeEnvironment();
    
    if (result && result.successful > 0) {
      console.log(`✅ Dynamic injection successful: ${result.successful} files loaded`);
      
      // Make JSDOM functions accessible globally (like Karma)
      const jsdomWindow = global.window;
      const globalFunctions = global.scriptInjector.getGlobalFunctions();
      
      // Bridge JSDOM window functions to global scope
      Object.keys(globalFunctions).forEach(name => {
        if (typeof jsdomWindow[name] === 'function') {
          global[name] = jsdomWindow[name].bind(jsdomWindow);
        }
      });
      
      console.log(`🌐 Bridged ${Object.keys(globalFunctions).length} functions to global scope`);
    } else {
      console.log('ℹ️ Dynamic injection returned no results, falling back...');
      manuallyLoadExistingFiles();
    }
  } catch (error) {
    console.log('ℹ️ Dynamic injection failed, using manual loading:', error.message);
    manuallyLoadExistingFiles();
  }
})();

// 7. Global utilities for dynamic loading (like Karma)
global.loadScript = function(filePath) {
  if (global.scriptInjector) {
    return global.scriptInjector.injectScriptFile(filePath);
  } else {
    return Promise.resolve(require(filePath));
  }
};

global.executeInContext = function(code) {
  if (global.scriptInjector) {
    return global.scriptInjector.executeInContext(code);
  } else {
    return eval(code);
  }
};

global.isKarmaLikeEnvironment = function() {
  return typeof global.formatCurrency === 'function' && 
         typeof global.validateEmail === 'function';
};
