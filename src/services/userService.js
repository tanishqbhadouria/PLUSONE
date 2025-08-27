// User service for managing user data
angular.module('userModule', [])
  .factory('UserService', ['$q', function($q) {
    let users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
    ];

    return {
      getAllUsers: function() {
        const deferred = $q.defer();
        // Simulate async operation
        setTimeout(function() {
          deferred.resolve(angular.copy(users));
        }, 10);
        return deferred.promise;
      },

      getUserById: function(id) {
        const deferred = $q.defer();
        setTimeout(function() {
          const user = users.find(u => u.id === id);
          if (user) {
            deferred.resolve(angular.copy(user));
          } else {
            deferred.reject('User not found');
          }
        }, 10);
        return deferred.promise;
      },

      createUser: function(userData) {
        const deferred = $q.defer();
        setTimeout(function() {
          if (!userData.name || !userData.email) {
            deferred.reject('Name and email are required');
            return;
          }
          
          const newUser = {
            id: Math.max(...users.map(u => u.id)) + 1,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user'
          };
          users.push(newUser);
          deferred.resolve(angular.copy(newUser));
        }, 10);
        return deferred.promise;
      },

      updateUser: function(id, userData) {
        const deferred = $q.defer();
        setTimeout(function() {
          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex === -1) {
            deferred.reject('User not found');
            return;
          }
          
          users[userIndex] = { ...users[userIndex], ...userData };
          deferred.resolve(angular.copy(users[userIndex]));
        }, 10);
        return deferred.promise;
      },

      deleteUser: function(id) {
        const deferred = $q.defer();
        setTimeout(function() {
          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex === -1) {
            deferred.reject('User not found');
            return;
          }
          
          users.splice(userIndex, 1);
          deferred.resolve();
        }, 10);
        return deferred.promise;
      }
    };
  }]);
