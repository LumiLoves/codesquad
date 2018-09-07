/**
 * ParentStorage
 */

export default class ParentStorage {
  constructor() {
    if (new.target === ParentStorage) {
      throw new TypeError('ParentStorage 인스턴스를 직접 생성할 수 없음');
    }

    // 필수 메서드
    if (typeof this.getData !== 'function') {
      throw new Error('[getData] method 작성 필수');    
    }
    if (typeof this.setData !== 'function') {
      throw new Error('[setData] method 작성 필수');    
    }
  }

  // (인스턴스에서 호출할 수 없음. 상속받는 자식클래스에서 super를 통해 사용한다.)
  isExpiredData(savedTime, savingDuration) {
    const currentTime = +new Date();
    const gap = currentTime - savedTime;
    return gap >= savingDuration;
  }
}