'use strict';

/**
 * CustomLocalStorage
 */

class CustomLocalStorage extends ParentStorage {
  constructor() {
    super();
  }
  getData(key, useParse = false) {
    const data = localStorage.getItem(key);
    return (useParse)? JSON.parse(data) : data; 
  }
  setData(key, value, useStringify = false) {
    if (useStringify) { value = JSON.stringify(value); }
    localStorage.setItem(key, value);
  }
  isExpiredData(savedTime, savingDuration) {
    return super._isExpiredData(savedTime, savingDuration);
  }
}

