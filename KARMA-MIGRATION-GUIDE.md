# Karma File Injection vs Jest: Complete Migration Guide

## 🎯 Understanding Karma's File Injection Pattern

### How Karma Works
Karma uses a unique approach to load and execute JavaScript files that differs significantly from Node.js module systems:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      // 1. Dependencies loaded first
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      
      // 2. Utility files (no module.exports!)
      'src/utils/**/*.js',
      
      // 3. Application files
      'src/app.js',
      'src/services/**/*.js',
      'src/controllers/**/*.js',
      
      // 4. Test files last
      'test/**/*.spec.js'
    ]
  });
};
```

### Key Karma Behaviors

#### 1. **Global Script Execution**
```javascript
// In Karma: src/utils/helpers.js
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

// This function is automatically available globally!
// No exports, no imports needed
```

#### 2. **Sequential Loading**
- Files are loaded in **exact order** specified in `files` array
- Each file executes in the **browser's global scope**
- Functions/variables become **window properties**

#### 3. **Browser Environment**
- Real DOM available (`document`, `window`)
- All files share the same **global namespace**
- No module isolation

#### 4. **Test File Access**
```javascript
// In test files - NO IMPORTS NEEDED!
describe('My Test', function() {
  it('should use global functions', function() {
    // These just work because they're global!
    expect(formatCurrency(123.45)).toBe('$123.45');
    expect(validateEmail('test@test.com')).toBe(true);
  });
});
```

## 🔄 Jest vs Karma: Key Differences

| Aspect | Karma | Jest |
|--------|-------|------|
| **Environment** | Browser (real DOM) | Node.js (JSDOM) |
| **Module System** | Global scripts | CommonJS/ES6 modules |
| **File Loading** | Sequential, global scope | require() on-demand |
| **Function Access** | Automatic global | Must import/export |
| **DOM** | Real browser DOM | JSDOM simulation |

## 🚨 Migration Challenges & Solutions

### Challenge 1: Global Function Availability

**Karma Pattern:**
```javascript
// src/utils/helpers.js - NO exports!
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

// test/my-test.spec.js - NO imports!
describe('Test', function() {
  it('works', function() {
    expect(formatCurrency(100)).toBe('$100.00'); // ✅ Works!
  });
});
```

**Jest Default (BROKEN):**
```javascript
// Same files as above
describe('Test', function() {
  it('fails', function() {
    expect(formatCurrency(100)).toBe('$100.00'); // ❌ ReferenceError!
  });
});
```

**Our Solution:**
```javascript
// src/utils/helpers.js
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

// Make it globally available in Jest
if (typeof global !== 'undefined') {
  global.formatCurrency = formatCurrency;
}
```

### Challenge 2: File Loading Order

**Karma Pattern:**
```javascript
// karma.conf.js - Explicit order
files: [
  'src/utils/helpers.js',     // Loaded first
  'src/services/*.js',        // Then services
  'test/**/*.spec.js'         // Tests last
]
```

**Our Solution:**
```javascript
// jest.setup.js - Replicate loading order
require('./src/utils/helpers.js');        // Load first
require('./src/services/userService.js'); // Then services
// Tests auto-loaded by Jest
```

### Challenge 3: DOM Environment

**Karma:** Real browser DOM
**Jest:** JSDOM simulation

**Our Solution:**
```javascript
// jest.setup.js
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
```

## 📋 Migration Checklist

### ✅ What You Need to Keep in Mind

#### 1. **Identify Global Functions**
Look for files that:
- Have functions but NO `module.exports`
- Are referenced in tests without imports
- Contain utility/helper functions

```bash
# Find potential global function files
grep -r "function " src/ --include="*.js" | grep -v "module.exports"
```

#### 2. **Check Test Dependencies**
```javascript
// Bad signs in test files:
describe('Test', function() {
  it('might be using globals', function() {
    // If you see functions used without const/import:
    expect(someFunction()).toBe(true); // 🚨 Potential global!
  });
});
```

#### 3. **Examine karma.conf.js**
```javascript
// Pay attention to files array order:
files: [
  'lib/jquery.js',           // 3rd party first
  'src/app.js',             // App initialization
  'src/utils/**/*.js',      // Utilities (likely global!)
  'src/services/**/*.js',   // Services
  'test/**/*.spec.js'       // Tests
]
```

#### 4. **Look for DOM Dependencies**
```javascript
// Functions that use DOM directly:
function createElement(tag) {
  return document.createElement(tag); // 🚨 Needs DOM!
}
```

### ✅ Step-by-Step Migration Process

#### Step 1: Audit Current Setup
```bash
# 1. List all files in karma.conf.js files array
# 2. Check which files have no module.exports
# 3. Identify functions used in tests without imports
```

#### Step 2: Prepare Utility Files
```javascript
// For each global utility file:
// 1. Keep existing functions unchanged
// 2. Add global assignments at the end

// src/utils/helpers.js
function myUtility() { /* existing code */ }

// Add this at the end:
if (typeof global !== 'undefined') {
  global.myUtility = myUtility;
}
```

#### Step 3: Update jest.setup.js
```javascript
// jest.setup.js
// 1. Add polyfills
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Setup DOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// 3. Load utilities in Karma order
require('./src/utils/helpers.js');
require('./src/utils/dom-helpers.js');
// ... other files in order
```

#### Step 4: Test Migration
```javascript
// Create a test file to verify:
describe('Global Function Migration', function() {
  it('should have global utilities available', function() {
    expect(typeof myUtility).toBe('function');
    expect(myUtility()).toBeDefined();
  });
});
```

## 🎯 Advanced Karma Replication Patterns

### Pattern 1: Conditional Global Assignment
```javascript
// Utility file that works in both Karma and Jest
function myFunction() {
  return 'result';
}

// Karma: automatically global
// Jest: make it global explicitly
if (typeof module !== 'undefined' && module.exports) {
  // Jest/Node.js environment
  if (typeof global !== 'undefined') {
    global.myFunction = myFunction;
  }
} else {
  // Karma/Browser environment - already global
}
```

### Pattern 2: Dynamic File Loading
```javascript
// jest.files-injector.js (our implementation)
class FilesInjector {
  async loadKarmaFiles(patterns) {
    // Replicate Karma's file loading with glob patterns
    const files = this.expandGlobPatterns(patterns);
    return this.loadFilesInOrder(files);
  }
}
```

### Pattern 3: Test Helper Injection
```javascript
// test/helpers/test-utilities.js
function createMockUser() { /* ... */ }

// Make available globally (like Karma)
if (typeof global !== 'undefined') {
  global.createMockUser = createMockUser;
}

// Now works in tests without imports:
describe('User Tests', function() {
  it('should work', function() {
    const user = createMockUser(); // ✅ Available globally!
  });
});
```

## 🔍 Debugging Migration Issues

### Common Problems & Solutions

#### Problem: "Function is not defined"
```javascript
// Error: formatCurrency is not defined

// Solution: Check if global assignment is working
console.log('formatCurrency available:', typeof global.formatCurrency);

// Fix: Ensure utility file is loaded in jest.setup.js
require('./src/utils/helpers.js');
```

#### Problem: "Document is not defined"
```javascript
// Error: document is not defined

// Solution: Ensure JSDOM is setup
const { JSDOM } = require('jsdom');
global.document = new JSDOM().window.document;
```

#### Problem: Wrong execution order
```javascript
// Fix: Load files in same order as karma.conf.js
require('./src/utils/helpers.js');     // First
require('./src/services/service.js');  // Then dependencies
```

## 📊 Migration Success Metrics

### ✅ Signs of Successful Migration
- Tests pass without changing imports
- Global functions work in all test files
- No "is not defined" errors
- Same test patterns work as in Karma

### 🚨 Red Flags
- Need to add imports to existing tests
- Functions undefined in some tests
- DOM errors in utility functions
- Different behavior between Karma and Jest

## 🎉 Final Verification

```javascript
// Create this test to verify complete migration:
describe('Karma Migration Verification', function() {
  it('should replicate Karma behavior exactly', function() {
    // Test 1: Global utilities available
    expect(typeof formatCurrency).toBe('function');
    expect(typeof validateEmail).toBe('function');
    
    // Test 2: DOM helpers work
    expect(typeof createElement).toBe('function');
    const el = createElement('div');
    expect(el.tagName).toBe('DIV');
    
    // Test 3: Test helpers available
    expect(typeof createMockUser).toBe('function');
    const user = createMockUser();
    expect(user).toBeDefined();
    
    // Test 4: No imports needed (this test has no require/import statements)
    expect(true).toBe(true); // ✅ If this runs, migration succeeded!
  });
});
```

This comprehensive approach ensures your Jest setup behaves exactly like Karma, making migration seamless for your development team!
