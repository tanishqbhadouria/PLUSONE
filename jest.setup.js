// jest.setup.js - Enhanced with Dynamic Script Injection

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

// Create enhanced global setup
global.setupKarmaLikeEnvironment = async function() {
  if (!JSDOM) {
    console.log('ℹ️ Using basic global function setup (no JSDOM)');
    return null;
  }
  
  // Get current JSDOM instance
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  // Create dynamic script injector
  const DynamicScriptInjector = require('./jest.dynamic-script-injector');
  const injector = new DynamicScriptInjector(dom);
  
  // Define Karma-like files configuration
  const karmaFiles = [
    // Core utilities (non-module functions)
    'src/utils/**/*.js',
    
    // AngularJS application files
    'src/app.js',
    'src/services/**/*.js', 
    'src/controllers/**/*.js',
    'src/directives/**/*.js',
    'src/filters/**/*.js',
    
    // Test helpers
    'test/helpers/**/*.js'
  ];
  
  try {
    // Load all files in Karma-like order
    const results = await injector.loadKarmaFiles(karmaFiles);
    
    // Make JSDOM window globally available
    global.window = dom.window;
    global.document = dom.window.document;
    global.angular = dom.window.angular;
    
    // Make injector available for individual tests
    global.scriptInjector = injector;
    
    console.log('🎯 Karma-like environment ready!');
    console.log(`📁 Loaded ${results.filter(r => r.status === 'success').length} files`);
    
    return injector;
  } catch (error) {
    console.error('❌ Failed to setup Karma-like environment:', error);
    throw error;
  }
};

// 3. Manual file loading (backward compatibility)
require('./src/app.js');
require('./src/services/userService.js');
require('./src/services/notificationService.js');
require('./src/services/loggerService.js');
require('./src/controllers/userManagementController.js');
require('./src/controllers/dashboardController.js');

// 4. Global test utilities (like Karma)
global.loadScript = function(filePath) {
  if (global.scriptInjector) {
    return global.scriptInjector.injectScriptFile(filePath);
  } else {
    // Fallback to require
    return Promise.resolve(require(filePath));
  }
};

global.isGloballyAvailable = function(functionName) {
  if (global.scriptInjector) {
    return typeof global.scriptInjector.window[functionName] === 'function';
  }
  return typeof global[functionName] !== 'undefined';
};

// 5. Auto-initialize Karma-like environment
(async function() {
  try {
    // Setup minimal DOM if needed
    if (!global.document) {
      global.document = {
        createElement: () => ({
          setAttribute: () => {},
          textContent: '',
          style: {},
          classList: { contains: () => false },
          hidden: false
        }),
        querySelector: () => null,
        querySelectorAll: () => []
      };
      global.Event = function() {};
    }
    
    // Manually load global utilities first (since file injection is complex)
    require('./src/utils/helpers.js');
    require('./src/utils/dom-helpers.js');
    require('./test/helpers/test-utilities.js');
    
    console.log('✅ Global utilities loaded successfully');
  } catch (error) {
    console.log('ℹ️ Some utility files not found (this is normal for basic setups)');
    console.log('Error details:', error.message);
  }
})();

// 6. Add basic Karma-like environment detection
global.isKarmaLikeEnvironment = function() {
  return typeof global.formatCurrency === 'function' && 
         typeof global.validateEmail === 'function';
};
