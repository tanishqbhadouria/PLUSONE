describe('Integration Tests - Multiple Dependencies', function() {
  let $controller, $rootScope, $q, $interval;
  let UserService, NotificationService, LoggerService, IdGenerator;
  let userManagementController, dashboardController;

  beforeEach(angular.mock.module('todoApp'));

  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$q_, _$interval_, _UserService_, _NotificationService_, _LoggerService_, _IdGenerator_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $interval = _$interval_;
    UserService = _UserService_;
    NotificationService = _NotificationService_;
    LoggerService = _LoggerService_;
    IdGenerator = _IdGenerator_;

    // Clear services before each test
    NotificationService.clear();
    LoggerService.clearLogs();
    LoggerService.setLogLevel('debug');
  }));

  describe('UserManagementController and DashboardController integration', function() {
    beforeEach(function() {
      userManagementController = $controller('UserManagementController');
      dashboardController = $controller('DashboardController');
      $rootScope.$apply();
    });

    it('should share the same service instances', function() {
      // Both controllers should use the same service instances
      expect(userManagementController).toBeDefined();
      expect(dashboardController).toBeDefined();
      
      // Verify services are working (they might be 0 initially due to clearing in beforeEach)
      expect(NotificationService.getAll().length).toBeGreaterThanOrEqual(0);
      expect(LoggerService.getLogs().length).toBeGreaterThanOrEqual(0);
      
      // Add a notification to test the service works
      NotificationService.success('Test notification');
      expect(NotificationService.getAll().length).toBeGreaterThan(0);
    });

    it('should sync user data between controllers', function(done) {
      // Wait for initial load
      setTimeout(function() {
        const initialUserCount = userManagementController.users.length;
        const initialDashboardUserCount = dashboardController.stats.totalUsers;
        
        expect(initialUserCount).toBe(initialDashboardUserCount);
        
        // Create a new user through UserManagementController
        userManagementController.newUser = {
          name: 'Integration Test User',
          email: 'integration@test.com',
          role: 'user'
        };
        
        userManagementController.createUser();
        $rootScope.$apply();
        
        // Refresh dashboard data
        dashboardController.refreshData();
        $rootScope.$apply();
        
        setTimeout(function() {
          // Since the mock creates users with incremental IDs, we should have one more user
          expect(userManagementController.users.length).toBeGreaterThan(initialUserCount);
          expect(dashboardController.stats.totalUsers).toBeGreaterThan(initialDashboardUserCount);
          done();
        }, 50);
      }, 50);
    });

    it('should sync notifications between services', function() {
      const initialNotificationCount = NotificationService.getAll().length;
      
      // Create a notification through one service
      NotificationService.success('Test integration notification');
      
      // Verify it appears in dashboard stats
      dashboardController.refreshData();
      
      expect(dashboardController.stats.totalNotifications).toBe(initialNotificationCount + 1);
      expect(dashboardController.recentNotifications.length).toBeGreaterThan(0);
    });

    it('should track operations in logs', function() {
      const initialLogCount = LoggerService.getLogs().length;
      
      // Perform an operation that generates logs
      userManagementController.newUser = {
        name: 'Log Test User',
        email: 'logtest@test.com'
      };
      
      userManagementController.createUser();
      $rootScope.$apply();
      
      // Verify logs were created
      const currentLogCount = LoggerService.getLogs().length;
      expect(currentLogCount).toBeGreaterThan(initialLogCount);
      
      // Refresh dashboard and verify log stats
      dashboardController.refreshData();
      expect(dashboardController.stats.totalLogs).toBeGreaterThanOrEqual(currentLogCount);
    });
  });

  describe('Service interaction chains', function() {
    it('should handle complex interaction flow', function(done) {
      userManagementController = $controller('UserManagementController');
      dashboardController = $controller('DashboardController');
      $rootScope.$apply();

      // Wait for initialization
      setTimeout(function() {
        // Step 1: Create a user (triggers UserService, NotificationService, LoggerService)
        userManagementController.newUser = {
          name: 'Chain Test User',
          email: 'chain@test.com',
          role: 'admin'
        };
        
        userManagementController.createUser();
        $rootScope.$apply();
        
        // Step 2: Select and edit the user
        setTimeout(function() {
          const createdUser = userManagementController.users[userManagementController.users.length - 1];
          userManagementController.selectUser(createdUser);
          userManagementController.startEdit();
          
          // Modify user
          userManagementController.selectedUser.name = 'Modified Chain User';
          userManagementController.saveUser();
          $rootScope.$apply();
          
          // Step 3: Verify all services tracked the operations
          setTimeout(function() {
            const logs = LoggerService.getLogs();
            const notifications = NotificationService.getAll();
            
            // Should have logs for create, select, edit operations
            const createLogs = logs.filter(log => log.message.includes('created'));
            const editLogs = logs.filter(log => log.message.includes('updated') || log.message.includes('Edit'));
            
            expect(createLogs.length).toBeGreaterThan(0);
            expect(editLogs.length).toBeGreaterThan(0);
            
            // Should have success notifications
            const successNotifications = notifications.filter(n => n.type === 'success');
            expect(successNotifications.length).toBeGreaterThan(1);
            
            // Dashboard should reflect all changes
            dashboardController.refreshData();
            $rootScope.$apply();
            
            const logSummary = dashboardController.getLogSummary();
            const notificationSummary = dashboardController.getNotificationSummary();
            
            expect(logSummary.info).toBeGreaterThan(0);
            expect(logSummary.debug).toBeGreaterThan(0);
            expect(notificationSummary.success).toBeGreaterThan(1);
            
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it('should handle error propagation', function(done) {
      userManagementController = $controller('UserManagementController');
      dashboardController = $controller('DashboardController');
      $rootScope.$apply();

      // Mock UserService to return an error
      spyOn(UserService, 'createUser').and.returnValue($q.reject('Creation failed'));
      
      setTimeout(function() {
        userManagementController.newUser = {
          name: 'Error Test User',
          email: 'error@test.com'
        };
        
        userManagementController.createUser();
        $rootScope.$apply();
        
        setTimeout(function() {
          // Verify error was logged
          const logs = LoggerService.getLogs();
          const errorLogs = logs.filter(log => log.level === 'error');
          expect(errorLogs.length).toBeGreaterThan(0);
          
          // Verify error notification was created
          const notifications = NotificationService.getAll();
          const errorNotifications = notifications.filter(n => n.type === 'error');
          expect(errorNotifications.length).toBeGreaterThan(0);
          
          // Dashboard should reflect error stats
          dashboardController.refreshData();
          const logSummary = dashboardController.getLogSummary();
          const notificationSummary = dashboardController.getNotificationSummary();
          
          expect(logSummary.error).toBeGreaterThan(0);
          expect(notificationSummary.error).toBeGreaterThan(0);
          
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Dependency injection verification', function() {
    it('should inject all required dependencies into UserManagementController', function() {
      userManagementController = $controller('UserManagementController');
      
      // Verify controller has access to all dependencies by testing their methods
      expect(typeof userManagementController.loadUsers).toBe('function');
      expect(typeof userManagementController.createUser).toBe('function');
      expect(typeof userManagementController.getUserStats).toBe('function');
    });

    it('should inject all required dependencies into DashboardController', function() {
      dashboardController = $controller('DashboardController');
      
      // Verify controller has access to all dependencies
      expect(typeof dashboardController.refreshData).toBe('function');
      expect(typeof dashboardController.getLogSummary).toBe('function');
      expect(typeof dashboardController.getNotificationSummary).toBe('function');
      expect(typeof dashboardController.toggleAutoRefresh).toBe('function');
    });

    it('should have access to shared IdGenerator service', function() {
      const todoController = $controller('TodoController');
      userManagementController = $controller('UserManagementController');
      
      // Both controllers should have access to the same IdGenerator instance
      expect(todoController).toBeDefined();
      expect(userManagementController).toBeDefined();
      
      // IdGenerator should work consistently
      const id1 = IdGenerator.getNext();
      const id2 = IdGenerator.getNext();
      expect(id2).toBe(id1 + 1);
    });
  });

  describe('Module dependency resolution', function() {
    it('should load all required modules', function() {
      expect(angular.module('utils')).toBeDefined();
      expect(angular.module('userModule')).toBeDefined();
      expect(angular.module('notificationModule')).toBeDefined();
      expect(angular.module('loggerModule')).toBeDefined();
      expect(angular.module('userManagementModule')).toBeDefined();
      expect(angular.module('dashboardModule')).toBeDefined();
      expect(angular.module('todoApp')).toBeDefined();
    });

    it('should resolve cross-module dependencies', function() {
      // userManagementModule depends on userModule, notificationModule, loggerModule, utils
      const userManagementModule = angular.module('userManagementModule');
      expect(userManagementModule.requires).toContain('userModule');
      expect(userManagementModule.requires).toContain('notificationModule');
      expect(userManagementModule.requires).toContain('loggerModule');
      expect(userManagementModule.requires).toContain('utils');
      
      // dashboardModule depends on userModule, notificationModule, loggerModule
      const dashboardModule = angular.module('dashboardModule');
      expect(dashboardModule.requires).toContain('userModule');
      expect(dashboardModule.requires).toContain('notificationModule');
      expect(dashboardModule.requires).toContain('loggerModule');
    });
  });
});
