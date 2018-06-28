'use strict';

/**
 * ListSlider
 */

const ListSlider = (function(fns) {

  class ListSlider extends ParentSlider {
    constructor({ wrapperElem, userOption = {}, userModule = {} }) {
      super();

      // dom
      this.wrapperElem = wrapperElem;
      this.contentBox = wrapperElem.querySelector('.content-group'); // TODO 다른데도 바꾸기.
      this.contentItems = wrapperElem.querySelectorAll('.content-group > li');
      this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');          

      // ui state data      
      this.maxIndex = this.contentItems && this.contentItems.length;      

      // option
      this.reqUrl = userOption.reqUrl;
      this.templateHTML = userOption.templateHTML;

      this.useStorage = userOption.useStorage || false;
      this.storageName = userOption.storageName;

      this.ITEM_COUNT_PER_GROUP = userOption.ITEM_COUNT_PER_GROUP || 1;

      // module
      this.userModule = userModule;
      this.oRequest = null;
      this.oStorage = null;
      this.oRenderer = null;
    }
  
    /* init */

    async init() {
      if (this._hasNoDOM()) {
        const json = await this.getJSON();
        this.render(json);
      }
      this.activeElements(0, true);
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
    _makeViewData(originData) {
      // 삭제예정) 그룹이 3개 이하 (1,2개)로는 동작이 고장나서 일단 갯수를 4개로 늘려놓음.
      let resultData = [...originData, ...originData];
      resultData = JSON.parse(JSON.stringify(resultData));
      // resultData.pop();
      // resultData.pop();
  
      const itemStartOrder = 0;
      const itemEndOrder = this.ITEM_COUNT_PER_GROUP - 1;
      const lastItemIndex = resultData.length - 1;
  
      resultData.forEach((data, i) => {
        const itemOrder = (i + this.ITEM_COUNT_PER_GROUP) % this.ITEM_COUNT_PER_GROUP;
        if (itemOrder === itemStartOrder) { resultData[i].isGroupStart = true; }
        if ((itemOrder === itemEndOrder) || (i === lastItemIndex)) { resultData[i].isGroupEnd = true; }
      });
  
      return resultData;
    }
    _setStateDataAfterRender() {
      this.contentItems = this.wrapperElem.querySelectorAll('.content-group > li');
      this.maxIndex = this.contentItems.length;
    }
  
    /* ui */
  
    activeElements(i, isForceActive = false) {
      const oldIndex = this.activeIndex;
      const newIndex = this._calcSlideIndex(i || 0);
      if (!isForceActive && (oldIndex == newIndex)) { return; }
  
      this.activeIndex = newIndex;      
      this._activeContent(oldIndex, newIndex);
    }
  
    /* event */
    
    registerEvents() {
      fns.setIndexToDom(this.contentItems);    
      this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
      this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));
    }
    _onClickDirectionBtn({ target }) {
      const oldIndex = this.activeIndex;
      const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;
  
      if (target && target.nodeName === 'A' || target.nodeName === 'I') {
        this._updateDirection();
        this.activeElements(newIndex);
      }
    }
  }

  return ListSlider;

})(fns);
