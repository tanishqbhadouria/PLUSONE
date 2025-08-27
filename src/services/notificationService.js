// Notification service for displaying messages
angular.module('notificationModule', [])
  .factory('NotificationService', function() {
    let notifications = [];
    let listeners = [];

    return {
      success: function(message) {
        const notification = {
          id: Date.now(),
          type: 'success',
          message: message,
          timestamp: new Date()
        };
        notifications.push(notification);
        this._notifyListeners(notification);
        return notification;
      },

      error: function(message) {
        const notification = {
          id: Date.now(),
          type: 'error',
          message: message,
          timestamp: new Date()
        };
        notifications.push(notification);
        this._notifyListeners(notification);
        return notification;
      },

      warning: function(message) {
        const notification = {
          id: Date.now(),
          type: 'warning',
          message: message,
          timestamp: new Date()
        };
        notifications.push(notification);
        this._notifyListeners(notification);
        return notification;
      },

      getAll: function() {
        return angular.copy(notifications);
      },

      clear: function() {
        notifications = [];
        this._notifyListeners({ type: 'clear' });
      },

      dismiss: function(id) {
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          notifications.splice(index, 1);
          this._notifyListeners({ type: 'dismiss', id: id });
        }
      },

      addListener: function(callback) {
        listeners.push(callback);
      },

      removeListener: function(callback) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },

      _notifyListeners: function(notification) {
        listeners.forEach(function(listener) {
          try {
            listener(notification);
          } catch (e) {
            console.error('Error in notification listener:', e);
          }
        });
      }
    };
  });
