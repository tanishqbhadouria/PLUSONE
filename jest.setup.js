// jest.setup.js

// 1. Load Angular. This makes the `angular` object available globally in the JSDOM environment.
require('angular');

// 2. Load Angular Mocks. This makes `angular.mock.module` and `angular.mock.inject` available.
require('angular-mocks');

// 3. Load our application code. This defines our modules so the tests can find them.
require('./src/app.js');

// 4. Load service modules
require('./src/services/userService.js');
require('./src/services/notificationService.js');
require('./src/services/loggerService.js');

// 5. Load controller modules
require('./src/controllers/userManagementController.js');
require('./src/controllers/dashboardController.js');
