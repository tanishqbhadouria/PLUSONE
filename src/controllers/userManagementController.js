// User management controller that depends on multiple services
angular.module('userManagementModule', ['userModule', 'notificationModule', 'loggerModule', 'utils'])
  .controller('UserManagementController', [
    'UserService', 
    'NotificationService', 
    'LoggerService', 
    'IdGenerator',
    function(UserService, NotificationService, LoggerService, IdGenerator) {
      const vm = this;
      
      vm.users = [];
      vm.selectedUser = null;
      vm.loading = false;
      vm.error = null;
      vm.newUser = {};
      vm.editMode = false;

      // Initialize
      vm.init = function() {
        LoggerService.info('UserManagementController initialized');
        vm.loadUsers();
      };

      vm.loadUsers = function() {
        vm.loading = true;
        vm.error = null;
        LoggerService.debug('Loading users...');

        UserService.getAllUsers()
          .then(function(users) {
            vm.users = users;
            LoggerService.info('Users loaded successfully', { count: users.length });
            NotificationService.success('Users loaded successfully');
          })
          .catch(function(error) {
            vm.error = error;
            LoggerService.error('Failed to load users', error);
            NotificationService.error('Failed to load users: ' + error);
          })
          .finally(function() {
            vm.loading = false;
          });
      };

      vm.selectUser = function(user) {
        vm.selectedUser = angular.copy(user);
        vm.editMode = false;
        LoggerService.debug('User selected', { userId: user.id });
      };

      vm.startEdit = function() {
        if (!vm.selectedUser) {
          NotificationService.warning('Please select a user to edit');
          return;
        }
        vm.editMode = true;
        LoggerService.debug('Edit mode started for user', { userId: vm.selectedUser.id });
      };

      vm.cancelEdit = function() {
        vm.editMode = false;
        vm.newUser = {};
        LoggerService.debug('Edit cancelled');
      };

      vm.saveUser = function() {
        if (!vm.selectedUser) return;

        vm.loading = true;
        LoggerService.debug('Saving user', vm.selectedUser);

        UserService.updateUser(vm.selectedUser.id, vm.selectedUser)
          .then(function(updatedUser) {
            const index = vm.users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              vm.users[index] = updatedUser;
            }
            vm.editMode = false;
            LoggerService.info('User updated successfully', { userId: updatedUser.id });
            NotificationService.success('User updated successfully');
          })
          .catch(function(error) {
            LoggerService.error('Failed to update user', error);
            NotificationService.error('Failed to update user: ' + error);
          })
          .finally(function() {
            vm.loading = false;
          });
      };

      vm.createUser = function() {
        if (!vm.newUser.name || !vm.newUser.email) {
          NotificationService.warning('Name and email are required');
          return;
        }

        vm.loading = true;
        LoggerService.debug('Creating new user', vm.newUser);

        UserService.createUser(vm.newUser)
          .then(function(newUser) {
            vm.users.push(newUser);
            vm.newUser = {};
            LoggerService.info('User created successfully', { userId: newUser.id });
            NotificationService.success('User created successfully');
          })
          .catch(function(error) {
            LoggerService.error('Failed to create user', error);
            NotificationService.error('Failed to create user: ' + error);
          })
          .finally(function() {
            vm.loading = false;
          });
      };

      vm.deleteUser = function(userId) {
        if (!userId) return;

        vm.loading = true;
        LoggerService.debug('Deleting user', { userId: userId });

        UserService.deleteUser(userId)
          .then(function() {
            vm.users = vm.users.filter(u => u.id !== userId);
            if (vm.selectedUser && vm.selectedUser.id === userId) {
              vm.selectedUser = null;
              vm.editMode = false;
            }
            LoggerService.info('User deleted successfully', { userId: userId });
            NotificationService.success('User deleted successfully');
          })
          .catch(function(error) {
            LoggerService.error('Failed to delete user', error);
            NotificationService.error('Failed to delete user: ' + error);
          })
          .finally(function() {
            vm.loading = false;
          });
      };

      vm.getUserStats = function() {
        const adminCount = vm.users.filter(u => u.role === 'admin').length;
        const userCount = vm.users.filter(u => u.role === 'user').length;
        
        return {
          total: vm.users.length,
          admins: adminCount,
          users: userCount
        };
      };

      // Auto-initialize
      vm.init();
    }
  ]);
