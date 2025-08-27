describe('NotificationService', function() {
  let NotificationService;

  beforeEach(angular.mock.module('notificationModule'));

  beforeEach(angular.mock.inject(function(_NotificationService_) {
    NotificationService = _NotificationService_;
  }));

  beforeEach(function() {
    // Clear notifications before each test
    NotificationService.clear();
  });

  describe('success notifications', function() {
    it('should create a success notification', function() {
      const notification = NotificationService.success('Test success message');
      
      expect(notification).toBeDefined();
      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Test success message');
      expect(notification.id).toBeDefined();
      expect(notification.timestamp).toBeDefined();
    });

    it('should add success notification to the list', function() {
      NotificationService.success('Test message');
      const notifications = NotificationService.getAll();
      
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('success');
    });
  });

  describe('error notifications', function() {
    it('should create an error notification', function() {
      const notification = NotificationService.error('Test error message');
      
      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Test error message');
    });
  });

  describe('warning notifications', function() {
    it('should create a warning notification', function() {
      const notification = NotificationService.warning('Test warning message');
      
      expect(notification.type).toBe('warning');
      expect(notification.message).toBe('Test warning message');
    });
  });

  describe('getAll', function() {
    it('should return all notifications', function() {
      NotificationService.success('Success 1');
      NotificationService.error('Error 1');
      NotificationService.warning('Warning 1');
      
      const notifications = NotificationService.getAll();
      expect(notifications.length).toBe(3);
    });

    it('should return a copy of notifications array', function() {
      NotificationService.success('Test message');
      const notifications = NotificationService.getAll();
      notifications[0].message = 'Modified message';
      
      const notificationsAgain = NotificationService.getAll();
      expect(notificationsAgain[0].message).toBe('Test message');
    });
  });

  describe('clear', function() {
    it('should clear all notifications', function() {
      NotificationService.success('Success 1');
      NotificationService.error('Error 1');
      
      expect(NotificationService.getAll().length).toBe(2);
      
      NotificationService.clear();
      
      expect(NotificationService.getAll().length).toBe(0);
    });
  });

  describe('dismiss', function() {
    it('should dismiss a specific notification', function() {
      const notification1 = NotificationService.success('Success 1');
      const notification2 = NotificationService.error('Error 1');
      
      expect(NotificationService.getAll().length).toBe(2);
      
      NotificationService.dismiss(notification1.id);
      
      const remaining = NotificationService.getAll();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(notification2.id);
    });

    it('should do nothing when dismissing non-existent notification', function() {
      NotificationService.success('Test message');
      
      expect(NotificationService.getAll().length).toBe(1);
      
      NotificationService.dismiss(999999);
      
      expect(NotificationService.getAll().length).toBe(1);
    });
  });

  describe('listeners', function() {
    it('should notify listeners when notifications are added', function() {
      let listenerCalled = false;
      let receivedNotification = null;
      
      const listener = function(notification) {
        listenerCalled = true;
        receivedNotification = notification;
      };
      
      NotificationService.addListener(listener);
      NotificationService.success('Test message');
      
      expect(listenerCalled).toBe(true);
      expect(receivedNotification.type).toBe('success');
      expect(receivedNotification.message).toBe('Test message');
    });

    it('should notify listeners when notifications are cleared', function() {
      let clearCalled = false;
      
      const listener = function(notification) {
        if (notification.type === 'clear') {
          clearCalled = true;
        }
      };
      
      NotificationService.addListener(listener);
      NotificationService.clear();
      
      expect(clearCalled).toBe(true);
    });

    it('should notify listeners when notifications are dismissed', function() {
      let dismissCalled = false;
      let dismissedId = null;
      
      const listener = function(notification) {
        if (notification.type === 'dismiss') {
          dismissCalled = true;
          dismissedId = notification.id;
        }
      };
      
      const notification = NotificationService.success('Test message');
      NotificationService.addListener(listener);
      NotificationService.dismiss(notification.id);
      
      expect(dismissCalled).toBe(true);
      expect(dismissedId).toBe(notification.id);
    });

    it('should remove listeners', function() {
      let listenerCalled = false;
      
      const listener = function() {
        listenerCalled = true;
      };
      
      NotificationService.addListener(listener);
      NotificationService.removeListener(listener);
      NotificationService.success('Test message');
      
      expect(listenerCalled).toBe(false);
    });

    it('should handle errors in listeners gracefully', function() {
      const errorListener = function() {
        throw new Error('Listener error');
      };
      
      spyOn(console, 'error');
      
      NotificationService.addListener(errorListener);
      
      expect(function() {
        NotificationService.success('Test message');
      }).not.toThrow();
      
      expect(console.error).toHaveBeenCalled();
    });
  });
});
