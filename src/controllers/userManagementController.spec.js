describe('UserManagementController', function() {
  let $controller, $rootScope, $q;
  let UserService, NotificationService, LoggerService, IdGenerator;
  let userManagementController;

  beforeEach(angular.mock.module('userManagementModule'));
  beforeEach(angular.mock.module('userModule'));
  beforeEach(angular.mock.module('notificationModule'));
  beforeEach(angular.mock.module('loggerModule'));
  beforeEach(angular.mock.module('utils'));

  beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$q_, _UserService_, _NotificationService_, _LoggerService_, _IdGenerator_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    UserService = _UserService_;
    NotificationService = _NotificationService_;
    LoggerService = _LoggerService_;
    IdGenerator = _IdGenerator_;

    // Clear services before each test
    NotificationService.clear();
    LoggerService.clearLogs();
  }));

  beforeEach(function() {
    // Mock UserService methods
    spyOn(UserService, 'getAllUsers').and.returnValue($q.resolve([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
    ]));
    
    spyOn(UserService, 'createUser').and.callFake(function(userData) {
      const newUser = { id: 3, ...userData, role: userData.role || 'user' };
      return $q.resolve(newUser);
    });
    
    spyOn(UserService, 'updateUser').and.callFake(function(id, userData) {
      return $q.resolve({ id: id, ...userData });
    });
    
    spyOn(UserService, 'deleteUser').and.returnValue($q.resolve());

    // Spy on other services
    spyOn(NotificationService, 'success');
    spyOn(NotificationService, 'error');
    spyOn(NotificationService, 'warning');
    spyOn(LoggerService, 'info');
    spyOn(LoggerService, 'debug');
    spyOn(LoggerService, 'error');

    userManagementController = $controller('UserManagementController');
    $rootScope.$apply();
  });

  describe('initialization', function() {
    it('should initialize controller', function() {
      expect(userManagementController).toBeDefined();
      expect(LoggerService.info).toHaveBeenCalledWith('UserManagementController initialized');
    });

    it('should load users on initialization', function() {
      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(userManagementController.users.length).toBe(2);
      expect(userManagementController.users[0].name).toBe('John Doe');
    });

    it('should set loading to false after initialization', function() {
      expect(userManagementController.loading).toBe(false);
    });
  });

  describe('loadUsers', function() {
    beforeEach(function() {
      // Reset spies
      UserService.getAllUsers.calls.reset();
      NotificationService.success.calls.reset();
      LoggerService.info.calls.reset();
    });

    it('should load users successfully', function() {
      userManagementController.loadUsers();
      $rootScope.$apply();

      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(userManagementController.users.length).toBe(2);
      expect(NotificationService.success).toHaveBeenCalledWith('Users loaded successfully');
      expect(LoggerService.info).toHaveBeenCalledWith('Users loaded successfully', { count: 2 });
    });

    it('should handle load users error', function() {
      UserService.getAllUsers.and.returnValue($q.reject('Load error'));
      
      userManagementController.loadUsers();
      $rootScope.$apply();

      expect(userManagementController.error).toBe('Load error');
      expect(NotificationService.error).toHaveBeenCalledWith('Failed to load users: Load error');
      expect(LoggerService.error).toHaveBeenCalledWith('Failed to load users', 'Load error');
    });

    it('should set loading state correctly', function() {
      userManagementController.loadUsers();
      expect(userManagementController.loading).toBe(true);
      
      $rootScope.$apply();
      expect(userManagementController.loading).toBe(false);
    });
  });

  describe('selectUser', function() {
    it('should select a user', function() {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' };
      
      userManagementController.selectUser(user);
      
      expect(userManagementController.selectedUser).toEqual(user);
      expect(userManagementController.editMode).toBe(false);
      expect(LoggerService.debug).toHaveBeenCalledWith('User selected', { userId: 1 });
    });

    it('should create a copy of the selected user', function() {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' };
      
      userManagementController.selectUser(user);
      userManagementController.selectedUser.name = 'Modified';
      
      expect(user.name).toBe('John Doe');
    });
  });

  describe('startEdit', function() {
    it('should start edit mode when user is selected', function() {
      userManagementController.selectedUser = { id: 1, name: 'John Doe' };
      
      userManagementController.startEdit();
      
      expect(userManagementController.editMode).toBe(true);
      expect(LoggerService.debug).toHaveBeenCalledWith('Edit mode started for user', { userId: 1 });
    });

    it('should show warning when no user is selected', function() {
      userManagementController.selectedUser = null;
      
      userManagementController.startEdit();
      
      expect(userManagementController.editMode).toBe(false);
      expect(NotificationService.warning).toHaveBeenCalledWith('Please select a user to edit');
    });
  });

  describe('cancelEdit', function() {
    it('should cancel edit mode', function() {
      userManagementController.editMode = true;
      userManagementController.newUser = { name: 'Test' };
      
      userManagementController.cancelEdit();
      
      expect(userManagementController.editMode).toBe(false);
      expect(userManagementController.newUser).toEqual({});
      expect(LoggerService.debug).toHaveBeenCalledWith('Edit cancelled');
    });
  });

  describe('saveUser', function() {
    beforeEach(function() {
      userManagementController.selectedUser = { id: 1, name: 'John Updated', email: 'john@example.com' };
      userManagementController.users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ];
    });

    it('should save user successfully', function() {
      UserService.updateUser.and.returnValue($q.resolve({ id: 1, name: 'John Updated', email: 'john@example.com', role: 'admin' }));
      
      userManagementController.saveUser();
      $rootScope.$apply();

      expect(UserService.updateUser).toHaveBeenCalledWith(1, userManagementController.selectedUser);
      expect(userManagementController.users[0].name).toBe('John Updated');
      expect(userManagementController.editMode).toBe(false);
      expect(NotificationService.success).toHaveBeenCalledWith('User updated successfully');
    });

    it('should handle save user error', function() {
      UserService.updateUser.and.returnValue($q.reject('Update error'));
      
      userManagementController.saveUser();
      $rootScope.$apply();

      expect(NotificationService.error).toHaveBeenCalledWith('Failed to update user: Update error');
      expect(LoggerService.error).toHaveBeenCalledWith('Failed to update user', 'Update error');
    });

    it('should do nothing when no user is selected', function() {
      userManagementController.selectedUser = null;
      
      userManagementController.saveUser();
      
      expect(UserService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('createUser', function() {
    it('should create user successfully', function() {
      userManagementController.newUser = { name: 'New User', email: 'new@example.com' };
      
      userManagementController.createUser();
      $rootScope.$apply();

      expect(UserService.createUser).toHaveBeenCalledWith({ name: 'New User', email: 'new@example.com' });
      expect(userManagementController.users.length).toBe(3);
      expect(userManagementController.newUser).toEqual({});
      expect(NotificationService.success).toHaveBeenCalledWith('User created successfully');
    });

    it('should show warning when name is missing', function() {
      userManagementController.newUser = { email: 'new@example.com' };
      
      userManagementController.createUser();
      
      expect(UserService.createUser).not.toHaveBeenCalled();
      expect(NotificationService.warning).toHaveBeenCalledWith('Name and email are required');
    });

    it('should show warning when email is missing', function() {
      userManagementController.newUser = { name: 'New User' };
      
      userManagementController.createUser();
      
      expect(UserService.createUser).not.toHaveBeenCalled();
      expect(NotificationService.warning).toHaveBeenCalledWith('Name and email are required');
    });

    it('should handle create user error', function() {
      userManagementController.newUser = { name: 'New User', email: 'new@example.com' };
      UserService.createUser.and.returnValue($q.reject('Create error'));
      
      userManagementController.createUser();
      $rootScope.$apply();

      expect(NotificationService.error).toHaveBeenCalledWith('Failed to create user: Create error');
      expect(LoggerService.error).toHaveBeenCalledWith('Failed to create user', 'Create error');
    });
  });

  describe('deleteUser', function() {
    beforeEach(function() {
      userManagementController.users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ];
    });

    it('should delete user successfully', function() {
      userManagementController.deleteUser(1);
      $rootScope.$apply();

      expect(UserService.deleteUser).toHaveBeenCalledWith(1);
      expect(userManagementController.users.length).toBe(1);
      expect(userManagementController.users[0].id).toBe(2);
      expect(NotificationService.success).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should clear selected user if deleted user was selected', function() {
      userManagementController.selectedUser = { id: 1, name: 'John Doe' };
      userManagementController.editMode = true;
      
      userManagementController.deleteUser(1);
      $rootScope.$apply();

      expect(userManagementController.selectedUser).toBe(null);
      expect(userManagementController.editMode).toBe(false);
    });

    it('should handle delete user error', function() {
      UserService.deleteUser.and.returnValue($q.reject('Delete error'));
      
      userManagementController.deleteUser(1);
      $rootScope.$apply();

      expect(NotificationService.error).toHaveBeenCalledWith('Failed to delete user: Delete error');
      expect(LoggerService.error).toHaveBeenCalledWith('Failed to delete user', 'Delete error');
    });

    it('should do nothing when no userId provided', function() {
      userManagementController.deleteUser();
      
      expect(UserService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', function() {
    beforeEach(function() {
      userManagementController.users = [
        { id: 1, name: 'John Doe', role: 'admin' },
        { id: 2, name: 'Jane Smith', role: 'user' },
        { id: 3, name: 'Bob Johnson', role: 'user' },
        { id: 4, name: 'Alice Brown', role: 'admin' }
      ];
    });

    it('should return correct user statistics', function() {
      const stats = userManagementController.getUserStats();
      
      expect(stats.total).toBe(4);
      expect(stats.admins).toBe(2);
      expect(stats.users).toBe(2);
    });

    it('should return zero stats for empty users array', function() {
      userManagementController.users = [];
      const stats = userManagementController.getUserStats();
      
      expect(stats.total).toBe(0);
      expect(stats.admins).toBe(0);
      expect(stats.users).toBe(0);
    });
  });
});
