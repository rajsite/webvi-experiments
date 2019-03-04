(function () {
    'use strict';
  
    window.setAttributeOnSelectedElements = function (selector, attributeName, attributeValue) {
      const elements = document.querySelectorAll(selector);
  
      if (elements.length <= 0) {
        throw new Error(`There should be one or more elements targetted by selector ${selector} instead found ${selector.length}`);
      }
  
      for(const i = 0; i < elements.length; i++) {
        elements[i].setAttribute(attributeName, attributeValue);
      }
    };
  }());
  