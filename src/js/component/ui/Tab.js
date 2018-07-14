'use strict';

/**
 * Tab
 */

const Tab = (function(helpers) {

  class Tab extends ParentUI {
    constructor({ wrapperElem, userOption = {}, userModule = {} }) {
      super();

      // dom
      this.wrapperElem = wrapperElem;
      this.contentBox = wrapperElem.querySelector('.tab-content-group-box');
      this.contentItems = wrapperElem.querySelectorAll('.tab-content-group-box > li');
      this.btnBox = wrapperElem.querySelector('.tab-btn-box');
      this.btnItems = wrapperElem.querySelectorAll('.tab-btn-box > li');

      // ui state data
      this.activeIndex = 0;

      // option
      this.reqUrl = userOption.reqUrl;
      this.templateHTML = userOption.templateHTML;

      this.useStorage = userOption.useStorage || false;
      this.storageName = userOption.storageName;

      // module
      this.oStorage = userModule.Storage || this.DefaultStorage;
      this.oRenderer = this.DefaultRenderer;
    }

    /* init */

    async init() { // 생성 시 호출할 내부 메서드를 모아놓는 곳
      const randomIndex = this._getRandomIndex();

      if (this._hasNoDOM()) {
        const json = await this.getJSON(); 
        this.render(json);
      }
      this.activeElements(randomIndex, true);
      this.registerEvents();
    }
    _checkStorageModule() {
      if (toString.call(this.oStorage) !== '[object Object]') {
        this.oStorage = new this.oStorage();
      }
    }
    _checkRendererModule() {
      if (toString.call(this.oRenderer) !== '[object Object]') {
        this.oRenderer = new this.oRenderer();
      }
    }

    /* render */

    async getJSON() {
      let json = null;
      try {
        json = await helpers.getFetchData({ url: this.reqUrl });      
      } catch (err) {
        if (err instanceof HttpError && err.response.status === 404) {
          console.error(`Error_${err.response.status} : 잘못된 주소로 요청되었습니다.`);
        } else {
          throw err; // 정의되지 않은 에러는 rethrow
        }
      }
      return json;
    }
    render(json) {
      this._checkRendererModule();
      const viewData = this._makeViewData(json);
  
      this.oRenderer.renderDOM({
        templateHTML: this.templateHTML,
        data: viewData,
        appendFn: (resultHTML) => { this.contentBox.innerHTML = resultHTML; }
      });
      this._setStateDataAfterRender();
    }
    _hasNoDOM() {
      return !this.contentItems.length;
    }
    _makeViewData(data) {
      // 서버 응답데이터 구조: [ { category_id: '..', name: '..', items: [ {..}, {..}, ... ] }, {..}, ... ]
      return data.reduce((accumulator, currentObject) => {
        const lastItemIndex = currentObject.items.length - 1;

        currentObject.items[0].isGroupStart = true;
        currentObject.items[lastItemIndex].isGroupEnd = true;
        return accumulator.concat(currentObject.items);
      }, []);
    }
    _setStateDataAfterRender() {
      this.contentItems = this.wrapperElem.querySelectorAll('.tab-content-group-box > li');
      this.maxIndex = this.contentItems.length;
    }

    /* ui */

    activeElements(newIndex, isForceActive = false) {
      const oldIndex = this.activeIndex;
      if (!isForceActive && (oldIndex == newIndex)) { return; }

      this.activeIndex = newIndex;      
      this._activeBtn(oldIndex, newIndex);
      this._activeContent(oldIndex, newIndex);
    }
    _activeBtn(oldIndex, newIndex = 0) {
      // const index = newIndex || 0;

      this.btnItems.item(oldIndex).classList.remove('on');
      this.btnItems.item(newIndex).classList.add('on');
    }
    _activeContent(oldIndex, newIndex = 0) {
      // const index = newIndex || 0;

      this.contentItems.item(oldIndex).classList.remove('on');
      this.contentItems.item(newIndex).classList.add('on');      
    }
    _getRandomIndex() {
      const min = 0;
      const max = this.btnItems.length - 1;
      return min + Math.floor(Math.random() * (max + 1));
    }

    /* event */

    registerEvents() {
      helpers.setIndexToDom(this.btnItems, '.tab-btn');
      this.btnBox.addEventListener('click', (e) => e.preventDefault());
      this.btnBox.addEventListener('click', this._onClickBtn.bind(this));
    }
    _onClickBtn({ target }) {
      if (!target.classList.contains('tab-btn')) { return; }
      this.activeElements(target.index);
    }
  }

  return Tab;

})(helpers);
