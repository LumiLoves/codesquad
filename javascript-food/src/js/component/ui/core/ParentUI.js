/**
 * ParentUI
 */

import CustomLocalStorage from './../../storage/CustomLocalStorage.js';
import TemplateRenderer from './../../renderer/TemplateRenderer.js';
import HttpError from './../../http/HttpError.js';
import ParentStorage from './../../storage/core/ParentStorage.js'

export default class ParentUI {
  constructor() {
    // 상속용도로만 사용하는 클래스로 유도함
    if (new.target === ParentUI) {
      throw new TypeError('ParentUI 인스턴스를 직접 생성할 수 없음');
    }

    // default class 지정
    this.DefaultStorage = CustomLocalStorage;
    this.DefaultRenderer = TemplateRenderer;

    // instance type 지정
    this.HttpErrorType = HttpError;
    this.StorageType = ParentStorage;
    
    // 필수 메서드 (자식 클래스가 무조건 선언해야 하는 메서드) 
    if (typeof this.init !== 'function') {
      throw new Error('[init] method 작성 필수');    
    }
  }

  // 옵션 메서드 (자식 클래스가 선언가능한 메서드)

  /* ui */
  activeElements() {
    // ui 활성화를 위해 다른 메서드들을 호출함
    throw new Error('[activeElements] method 미작성');
  }

  /* event */
  registerEvents() {
    // dom에 event 바인딩
    throw new Error('[registerEvents] method 미작성');
  }
}