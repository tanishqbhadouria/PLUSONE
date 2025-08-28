// src/utils/helpers.js
// Non-module utility functions that become globally available (like in Karma)

// Global helper functions (no exports needed!)
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, wait) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
}

// Global test utilities
function createMockUser(overrides = {}) {
  return Object.assign({
    id: generateId('user'),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date().toISOString()
  }, overrides);
}

function createMockUsers(count = 3) {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      id: generateId(`user_${index}`),
      name: `Test User ${index + 1}`,
      email: `test${index + 1}@example.com`
    })
  );
}

// Angular-specific helpers
function createMockScope($rootScope, data = {}) {
  const $scope = $rootScope.$new();
  Object.assign($scope, data);
  return $scope;
}

// Make functions globally available (like in Karma)
if (typeof global !== 'undefined') {
  global.formatCurrency = formatCurrency;
  global.validateEmail = validateEmail;
  global.generateId = generateId;
  global.debounce = debounce;
  global.throttle = throttle;
  global.deepClone = deepClone;
  global.createMockUser = createMockUser;
  global.createMockUsers = createMockUsers;
  global.createMockScope = createMockScope;
}

// These functions are now globally available in JSDOM
// No need to import/export them in tests!
