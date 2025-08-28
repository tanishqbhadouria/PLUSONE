// demo/simple-global-demo.spec.js
// Simple demonstration of global functions working without imports

describe('🎯 Simple Global Function Demo', function() {
  
  describe('Utility Functions (No Imports Needed!)', function() {
    it('should format currency globally', function() {
      // This works without require() or import - just like Karma!
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(999.99)).toBe('$999.99');
    });

    it('should validate emails globally', function() {
      // These functions are injected globally by our setup
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user@domain.org')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@')).toBe(false);
    });

    it('should generate unique IDs globally', function() {
      const id1 = generateId('test');
      const id2 = generateId('test');
      
      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2); // Should be unique
    });
  });

  describe('Test Helper Functions (No Imports Needed!)', function() {
    it('should create mock users globally', function() {
      // Test data factories available globally
      const user1 = createMockUser();
      const user2 = createMockUser({ name: 'Custom Name' });
      
      expect(user1.name).toBe('Test User');
      expect(user1.email).toBe('test@example.com');
      expect(user2.name).toBe('Custom Name');
    });

    it('should create multiple mock users globally', function() {
      const users = createMockUsers(3);
      
      expect(users).toHaveLength(3);
      expect(users[0].name).toBe('Test User 1');
      expect(users[1].name).toBe('Test User 2');
      expect(users[2].name).toBe('Test User 3');
    });

    it('should create test notifications globally', function() {
      const notification = createTestNotification('success', 'Test message');
      
      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Test message');
      expect(notification.id).toMatch(/^notification_\d+_[a-z0-9]+$/);
    });
  });

  describe('DOM Helper Functions (No Imports Needed!)', function() {
    it('should create DOM elements globally', function() {
      // DOM utilities work globally too
      const button = createElement('button', { 
        id: 'test-btn',
        class: 'btn-primary'
      }, 'Click Me');
      
      expect(button.tagName).toBe('BUTTON');
      expect(button.id).toBe('test-btn');
      expect(button.getAttribute('class')).toBe('btn-primary');
      expect(button.textContent).toBe('Click Me');
    });

    it('should find elements globally', function() {
      // This works with JSDOM
      const element = findElement('body');
      expect(element).toBeTruthy();
    });
  });

  describe('🎉 Migration Success Verification', function() {
    it('proves Karma-like behavior is working', function() {
      // This entire test file has ZERO imports/requires
      // Yet all these functions work - exactly like Karma!
      
      expect(typeof formatCurrency).toBe('function');
      expect(typeof validateEmail).toBe('function');
      expect(typeof generateId).toBe('function');
      expect(typeof createMockUser).toBe('function');
      expect(typeof createElement).toBe('function');
      
      console.log('✅ Karma-like global function injection is working perfectly!');
    });
  });
});
