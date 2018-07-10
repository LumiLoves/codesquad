'use strict';

/**
 * ParentStorage
 */

class ParentStorage {
  constructor() {
    if (new.target === ParentStorage) {
      throw new TypeError('ParentStorage 인스턴스를 직접 생성할 수 없음');
    }

    if (typeof this.getData !== 'function') {
      throw new Error('[getData] method 작성 필수');    
    }
    if (typeof this.setData !== 'function') {
      throw new Error('[setData] method 작성 필수');    
    }
  }
}