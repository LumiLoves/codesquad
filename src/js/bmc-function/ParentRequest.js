'use strict';

/**
 * ParentRequest
 */

class ParentRequest {
  constructor() {
    if (new.target === ParentRequest) {
      throw new TypeError('ParentRequest 인스턴스를 직접 생성할 수 없음');
    }

    if (typeof this.getData !== 'function') {
      throw new Error('[getData] method 작성 필수');    
    }
  }
}
