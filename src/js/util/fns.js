'use strict';

/**
 * Fns
 */

const fns = {
  setIndexToDom(nodeList, selector) {
    const selectorFlag = selector? 'hasSelector' : 'noSelector';
    const handler = {
      noSelector(elem, i) {
        elem.index = i;        
      },
      hasSelector(elem, i) {
        elem.querySelector(selector).index = i;
      }
    }[selectorFlag];

    nodeList.forEach(handler);
  },
  getStorageData(type, key) {
    return window[storageType].getItem(storageKey);
  },
  async getFetchData(reqUrl, resErrorFn) {
    let res = null;
    res = await fetch(reqUrl).catch((data) => {
      (typeof resErrorFn === 'function') && resErrorFn(data);
    });
    res = await res.json();
    return res;
  }
};