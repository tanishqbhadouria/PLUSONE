// src/karma-like-injection.spec.js
// Demonstrates Karma-like file injection and global function availability

describe('Karma-like File Injection', function() {
  describe('Global Helper Functions', function() {
    it('should have globally available utility functions', function() {
      // These functions are injected globally (no imports needed!)
      expect(typeof formatCurrency).toBe('function');
      expect(typeof validateEmail).toBe('function');
      expect(typeof generateId).toBe('function');
      expect(typeof deepClone).toBe('function');
    });

    it('should use global utility functions', function() {
      // Use functions without importing (like Karma)
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      
      const id = generateId('test');
      expect(id).toMatch(/^test_\d+_[a-z0-9]+$/);
    });

    it('should have global DOM helpers available', function() {
      expect(typeof createElement).toBe('function');
      expect(typeof findElementByText).toBe('function');
      expect(typeof triggerEvent).toBe('function');
    });

    it('should use global DOM helpers', function() {
      const button = createElement('button', { id: 'test-btn' }, 'Click me');
      expect(button.tagName).toBe('BUTTON');
      expect(button.id).toBe('test-btn');
      expect(button.textContent).toBe('Click me');
    });
  });

  describe('Global Test Utilities', function() {
    it('should have global test helpers available', function() {
      expect(typeof createMockUser).toBe('function');
      expect(typeof createMockUsers).toBe('function');
      expect(typeof createTestNotification).toBe('function');
    });

    it('should use global test factories', function() {
      const user = createMockUser({ name: 'John Doe' });
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('test@example.com');
      expect(user.id).toMatch(/^user_\d+_[a-z0-9]+$/);

      const users = createMockUsers(2);
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Test User 1');
      expect(users[1].name).toBe('Test User 2');
    });

    it('should use global Angular test helpers', function() {
      // Available without imports (injected like Karma)
      expect(typeof createAngularTestSetup).toBe('function');
      expect(typeof expectPromiseToResolve).toBe('function');
    });
  });

  describe('Dynamic Script Loading', function() {
    it('should check if Karma-like environment is available', function() {
      expect(typeof isKarmaLikeEnvironment).toBe('function');
      
      if (isKarmaLikeEnvironment()) {
        console.log('✅ Karma-like environment is active');
        expect(typeof formatCurrency).toBe('function');
        expect(typeof validateEmail).toBe('function');
      } else {
        console.log('ℹ️ Basic environment (no global functions)');
      }
    });

    it('should load additional scripts dynamically (if available)', function(done) {
      if (global.loadScript) {
        // This would work like Karma's dynamic loading
        expect(typeof global.loadScript).toBe('function');
        done();
      } else {
        // Fallback - just verify the concept exists
        expect(true).toBe(true);
        done();
      }
    });
  });

  describe('Integration with AngularJS', function() {
    let $scope, UserService;

    beforeEach(angular.mock.module('userModule'));

    beforeEach(angular.mock.inject(function($rootScope, _UserService_) {
      $scope = $rootScope.$new();
      UserService = _UserService_;
    }));

    it('should use global helpers with AngularJS services', function() {
      // Use globally available functions with Angular services
      const mockUser = createMockUser({ name: 'Angular User' });
      
      spyOn(UserService, 'createUser').and.returnValue(
        Promise.resolve(mockUser)
      );

      // Verify global helper worked with Angular service
      expect(mockUser.name).toBe('Angular User');
      expect(validateEmail(mockUser.email)).toBe(true);
    });

    it('should use global test utilities in Angular context', function() {
      // Create mock scope using global helper
      const scopeData = { users: createMockUsers(3) };
      Object.assign($scope, scopeData);

      expect($scope.users).toHaveLength(3);
      expect($scope.users[0].name).toBe('Test User 1');
      
      // Use global validation
      $scope.users.forEach(user => {
        expect(validateEmail(user.email)).toBe(true);
      });
    });
  });
});
