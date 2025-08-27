describe('TodoController', function() {
  let $controller;
  let todoController;

  // Load the 'todoApp' module before each test
  beforeEach(angular.mock.module('todoApp'));

  // Inject the $controller service
  beforeEach(angular.mock.inject(function(_$controller_) {
    $controller = _$controller_;
    // Instantiate the controller
    todoController = $controller('TodoController');
  }));

  it('should be defined', function() {
    expect(todoController).toBeDefined();
  });

  it('should have 2 todos initially', function() {
    expect(todoController.todos.length).toBe(2);
  });

  it('should have 1 remaining todo initially', function() {
    expect(todoController.remaining()).toBe(1);
  });

  it('should add a new todo to the list', function() {
    // Arrange
    todoController.todoText = 'Test a new todo';
    
    // Act
    todoController.addTodo();

    // Assert
    expect(todoController.todos.length).toBe(3);
    expect(todoController.todos[2].text).toBe('Test a new todo');
    expect(todoController.todos[2].done).toBe(false);
  });

  it('should not add an empty todo', function() {
    // Arrange
    todoController.todoText = '';

    // Act
    todoController.addTodo();

    // Assert
    expect(todoController.todos.length).toBe(2);
  });
});
