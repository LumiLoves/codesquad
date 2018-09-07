/**
 * CustomSessionStorages
 */

import ParentStorage from './core/ParentStorage.js';

export default class CustomSessionStorages extends ParentStorage {
  constructor() {
    super();
  }
  getData(key, useParse = false) {
    const data = sessionStorage.getItem(key);
    return (useParse)? JSON.parse(data) : data;
  }
  setData(key, value, useStringify = false) {
    if (useStringify) { value = JSON.stringify(value); }
    sessionStorage.setItem(key, value);
  }
  isExpiredData(savedTime, savingDuration) {
    return super.isExpiredData(savedTime, savingDuration);
  }
}
