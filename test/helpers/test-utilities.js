// test/helpers/test-utilities.js
// Global test utilities (like Karma patterns)

function expectToBeVisible(element) {
  expect(element.style.display).not.toBe('none');
  expect(element.style.visibility).not.toBe('hidden');
}

function expectToBeHidden(element) {
  const isHidden = element.style.display === 'none' || 
                   element.style.visibility === 'hidden' ||
                   element.hidden === true;
  expect(isHidden).toBe(true);
}

function expectToHaveClass(element, className) {
  expect(element.classList.contains(className)).toBe(true);
}

function createAngularTestSetup(moduleName) {
  let $controller, $scope, $rootScope, $compile, $q, $timeout;
  
  beforeEach(angular.mock.module(moduleName));
  
  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$compile_, _$q_, _$timeout_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    $timeout = _$timeout_;
  }));
  
  return {
    getController: () => $controller,
    getScope: () => $scope,
    getRootScope: () => $rootScope,
    getCompile: () => $compile,
    getQ: () => $q,
    getTimeout: () => $timeout
  };
}

function flushAndDigest($scope, $timeout) {
  try {
    $timeout.flush();
  } catch (e) {
    // No pending timeouts
  }
  $scope.$digest();
}

function expectPromiseToResolve(promise, expectedValue) {
  let result;
  promise.then(value => {
    result = value;
  });
  
  // Trigger digest cycle
  if (typeof angular !== 'undefined' && angular.mock) {
    try {
      angular.mock.inject(function($rootScope) {
        $rootScope.$apply();
      });
    } catch (e) {
      // Handle if not in Angular context
    }
  }
  
  expect(result).toEqual(expectedValue);
}

// Global test data factories
function createTestNotification(type = 'info', message = 'Test notification') {
  return {
    id: generateId('notification'),
    type: type,
    message: message,
    timestamp: new Date().toISOString()
  };
}

function createTestLogEntry(level = 'info', message = 'Test log') {
  return {
    id: generateId('log'),
    level: level,
    message: message,
    timestamp: new Date().toISOString(),
    data: {}
  };
}

// Make functions globally available (like in Karma)
if (typeof global !== 'undefined') {
  global.expectToBeVisible = expectToBeVisible;
  global.expectToBeHidden = expectToBeHidden;
  global.expectToHaveClass = expectToHaveClass;
  global.createAngularTestSetup = createAngularTestSetup;
  global.expectPromiseToResolve = expectPromiseToResolve;
  global.createTestNotification = createTestNotification;
  global.createTestLogEntry = createTestLogEntry;
}
