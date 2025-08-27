// Dashboard controller that aggregates data from multiple services
angular.module('dashboardModule', ['userModule', 'notificationModule', 'loggerModule'])
  .controller('DashboardController', [
    'UserService',
    'NotificationService', 
    'LoggerService',
    '$interval',
    function(UserService, NotificationService, LoggerService, $interval) {
      const vm = this;
      
      vm.stats = {
        totalUsers: 0,
        totalNotifications: 0,
        totalLogs: 0,
        lastUpdated: null
      };
      
      vm.recentLogs = [];
      vm.recentNotifications = [];
      vm.autoRefresh = false;
      vm.refreshInterval = null;

      vm.init = function() {
        LoggerService.info('DashboardController initialized');
        vm.refreshData();
        vm.setupNotificationListener();
      };

      vm.refreshData = function() {
        LoggerService.debug('Refreshing dashboard data');
        
        // Get user count
        UserService.getAllUsers()
          .then(function(users) {
            vm.stats.totalUsers = users.length;
            vm.updateLastRefreshed();
          })
          .catch(function(error) {
            LoggerService.error('Failed to load users for dashboard', error);
          });

        // Get notification count
        vm.stats.totalNotifications = NotificationService.getAll().length;
        vm.recentNotifications = NotificationService.getAll().slice(-5);

        // Get log count
        vm.stats.totalLogs = LoggerService.getLogs().length;
        vm.recentLogs = LoggerService.getLogs().slice(-10);

        vm.updateLastRefreshed();
      };

      vm.updateLastRefreshed = function() {
        vm.stats.lastUpdated = new Date();
      };

      vm.setupNotificationListener = function() {
        NotificationService.addListener(function(notification) {
          vm.refreshData();
          LoggerService.debug('Dashboard updated due to notification', notification);
        });
      };

      vm.toggleAutoRefresh = function() {
        vm.autoRefresh = !vm.autoRefresh;
        
        if (vm.autoRefresh) {
          vm.refreshInterval = $interval(function() {
            vm.refreshData();
            LoggerService.debug('Auto-refresh triggered');
          }, 30000); // Refresh every 30 seconds
          
          NotificationService.success('Auto-refresh enabled');
          LoggerService.info('Dashboard auto-refresh enabled');
        } else {
          if (vm.refreshInterval) {
            $interval.cancel(vm.refreshInterval);
            vm.refreshInterval = null;
          }
          
          NotificationService.success('Auto-refresh disabled');
          LoggerService.info('Dashboard auto-refresh disabled');
        }
      };

      vm.clearAllNotifications = function() {
        NotificationService.clear();
        LoggerService.info('All notifications cleared from dashboard');
      };

      vm.clearAllLogs = function() {
        LoggerService.clearLogs();
        vm.refreshData();
        NotificationService.success('All logs cleared');
        LoggerService.info('All logs cleared from dashboard');
      };

      vm.getLogSummary = function() {
        const logs = LoggerService.getLogs();
        const summary = {
          debug: 0,
          info: 0,
          warn: 0,
          error: 0
        };

        logs.forEach(function(log) {
          if (summary.hasOwnProperty(log.level)) {
            summary[log.level]++;
          }
        });

        return summary;
      };

      vm.getNotificationSummary = function() {
        const notifications = NotificationService.getAll();
        const summary = {
          success: 0,
          error: 0,
          warning: 0
        };

        notifications.forEach(function(notification) {
          if (summary.hasOwnProperty(notification.type)) {
            summary[notification.type]++;
          }
        });

        return summary;
      };

      // Cleanup on destroy
      vm.$onDestroy = function() {
        if (vm.refreshInterval) {
          $interval.cancel(vm.refreshInterval);
        }
        LoggerService.info('DashboardController destroyed');
      };

      // Auto-initialize
      vm.init();
    }
  ]);
