'use strict';

/**
 * CustomSessionStorages
 */

class CustomSessionStorages extends ParentStorage {
  constructor() {
    super();
  }
  getData(key) {
    return sessionStorage.getItem(key);
  }
  setData(key, value) {
    sessionStorage.setItem(key, value);
  }
}


// async _getTemplateJSON({ storageType, storageKey, reqUrl, resErrorFn }) {
//   // 저장된 데이터를 찾아보고, 없으면 요청을 통해 받아옴
//   let data = null;
//   const hasStorageInfo = (storageType && storageKey);
//   const hasReqInfo = !!reqUrl;
  
//   if (hasStorageInfo) { 
//     data = this._getStorageData(storageType, storageKey);
//   }
//   if (!data && hasReqInfo) {
//     data = await this._getFetchData(reqUrl, resErrorFn);
//   }
//   return data;
// }
