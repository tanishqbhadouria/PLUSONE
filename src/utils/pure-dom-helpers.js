// src/utils/pure-dom-helpers.js  
// Pure DOM utilities - NO manual global assignments!
// These will be made global through JSDOM script injection

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
  return event;
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

// Note: No manual global assignments!
// These functions will be automatically available globally
// through JSDOM script injection - just like Karma!
