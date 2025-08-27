module.exports = {
  // This is the key setting to use the Jasmine runner
  testRunner: 'jest-jasmine2',
  
  // Use jsdom to simulate a browser-like environment in Node.js
  testEnvironment: 'jsdom',

  // A list of paths to modules that run code to configure the testing framework
  // before each test file is executed. This is where we load our dependencies.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
