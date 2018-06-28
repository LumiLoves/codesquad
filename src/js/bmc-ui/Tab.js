'use strict';

/**
 * Tab
 */

const Tab = (function(fns) {

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

      this.ITEM_NUMBER_PER_GROUP = userOption.ITEM_NUMBER_PER_GROUP || 1;

      // module
      this.userModule = userModule;
      this.oRequest = null;
      this.oStorage = null;
      this.oRenderer = null;
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
    _checkRequestModule() {
      if (!this.oRequest) {
        const TargetClass = this.userModule.Request || this.DefaultRequest;
        this.oRequest = new TargetClass();
      }
    }
    _checkStorageModule() {
      if (!this.oStorage) {
        const TargetClass = this.userModule.Storage || this.DefaultStorage;
        this.oStorage = new TargetClass();
      }
    }
    _checkRendererModule() {
      if (!this.oRenderer) {
        this.oRenderer = new this.DefaultRenderer();
      }
    }

    /* render */

    async getJSON() {
      this._checkRequestModule();
      const json = await this.oRequest.getData({ url: this.reqUrl });      
      return json;
    }
    render(json) {
      const viewData = this._makeViewData(json);

      this._checkRendererModule();
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
      return data.reduce((accumulator, currentObject) => {
        const ITEM_START_ORDER = 0;
        const ITEM_END_ORDER = this.ITEM_NUMBER_PER_GROUP - 1;

        currentObject.items[ITEM_START_ORDER].isGroupStart = true;
        currentObject.items[ITEM_END_ORDER].isGroupEnd = true;
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
      fns.setIndexToDom(this.btnItems, 'a');
      this.btnBox.addEventListener('click', (e) => e.preventDefault());
      this.btnBox.addEventListener('click', this._onClickBtn.bind(this));
    }
    _onClickBtn({ target }) {
      if (target && target.nodeName === 'A') { this.activeElements(target.index); }
    }
  }

  return Tab;

})(fns);
