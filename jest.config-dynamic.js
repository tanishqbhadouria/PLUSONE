module.exports = {
  // Use the Jasmine test runner for compatibility
  testRunner: 'jest-jasmine2',
  
  // Use jsdom to simulate a browser-like environment
  testEnvironment: 'jsdom',

  // Setup file with dynamic script injection
  setupFilesAfterEnv: ['<rootDir>/jest.setup-dynamic.js'],
  
  // Additional Jest configuration for dynamic injection
  testEnvironmentOptions: {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  },
  
  // Enable verbose output to see script loading
  verbose: false,
  
  // Allow longer timeouts for script injection
  testTimeout: 10000
};
