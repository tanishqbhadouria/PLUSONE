// src/utils/dom-helpers.js
// DOM manipulation utilities (globally available)

function createElement(tag, attributes = {}, textContent = '') {
  const element = document.createElement(tag);
  
  Object.keys(attributes).forEach(attr => {
    element.setAttribute(attr, attributes[attr]);
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

function findElement(selector) {
  return document.querySelector(selector);
}

function findElementByText(text, tag = '*') {
  const elements = document.querySelectorAll(tag);
  return Array.from(elements).find(el => el.textContent.includes(text));
}

function triggerEvent(element, eventType, eventData = {}) {
  const event = new Event(eventType, { bubbles: true });
  Object.assign(event, eventData);
  element.dispatchEvent(event);
}

function simulateClick(element) {
  triggerEvent(element, 'click');
}

function simulateKeyPress(element, key) {
  const event = new KeyboardEvent('keypress', { key });
  element.dispatchEvent(event);
}

// Angular-specific DOM helpers
function compileAndDigest(template, scope, $compile) {
  const element = $compile(template)(scope);
  scope.$digest();
  return element;
}

function createAngularElement(template, scope, $compile) {
  return angular.element(compileAndDigest(template, scope, $compile)[0]);
}

// Make functions globally available (like in Karma)
if (typeof global !== 'undefined') {
  global.createElement = createElement;
  global.findElement = findElement;
  global.findElementByText = findElementByText;
  global.triggerEvent = triggerEvent;
  global.compileAndDigest = compileAndDigest;
  global.createAngularElement = createAngularElement;
}
