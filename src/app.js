// A simple service that could be mocked
angular.module('utils', [])
  .factory('IdGenerator', function() {
    let nextId = 1;
    return {
      getNext: function() {
        return nextId++;
      }
    };
  });

// The main application module - now includes all dependencies
angular.module('todoApp', [
  'utils',
  'userModule',
  'notificationModule', 
  'loggerModule',
  'userManagementModule',
  'dashboardModule'
])
  .controller('TodoController', ['IdGenerator', function(IdGenerator) {
    const vm = this;
    vm.todos = [
      { id: IdGenerator.getNext(), text: 'Learn AngularJS', done: true },
      { id: IdGenerator.getNext(), text: 'Build an AngularJS app', done: false }
    ];

    vm.addTodo = function() {
      if (!vm.todoText) return;
      vm.todos.push({
        id: IdGenerator.getNext(),
        text: vm.todoText,
        done: false
      });
      vm.todoText = '';
    };

    vm.remaining = function() {
      return vm.todos.filter(todo => !todo.done).length;
    };
  }]);
