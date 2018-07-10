'use strict';

/**
 * CustomLocalStorage
 */

class CustomLocalStorage extends ParentStorage {
  constructor() {
    super();
  }
  getData(key) {
    return localStorage.getItem(key);
  }
  setData(key, value) {
    localStorage.setItem(key, value);
  }
}

