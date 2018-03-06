'use strict';

/**
 * Util
 */

if (!window.LUMI) window.LUMI = {};

LUMI.util = {
  array: {
    trim(arr) {
      if (!util.type.isArray(arr)) { return false; }

      if (arr[0] === ' ') { arr.shift(); }
      if (arr[arr.length - 1] === ' ') { arr.pop(); }
      if (arr[0] === ' ' || arr[arr.length - 1] === ' ') { this.trim(arr); }

      return arr;
    }
  },
  type: {
    isString(data) {
      return toString.call(data) === '[object String]';
    },
    isArray(data) {
      return (Array.isArray !== undefined)? 
        Array.isArray(data) : (toString.call(data) === '[object Array]');
    },
    isObject(data) {
      return toString.call(data) === '[object Object]';
    }
  },
  dom: {
    setIndex(nodeList, selector) {
      const hasSelector = selector? 'hasSelector' : 'noSelector';
      const handler = {
        noSelector(elem, i) {
          elem.index = i;        
        },
        hasSelector(elem, i) {
          elem.querySelector(selector).index = i;
        }
      }[hasSelector];

      nodeList.forEach(handler);
    }
  },
  number: {
    random(min, max) {
      return min + Math.floor(Math.random() * (max + 1));
    }
  }
};
