'use strict';

/**
 * ListSlider
 */

const ListSlider = (function(helpers) {

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
      this.oStorage = userModule.Storage || this.DefaultStorage;
      this.oRenderer = this.DefaultRenderer;
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
      helpers.attachIndexToDom(this.contentItems);    
      this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
      this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));
    }
    _onClickDirectionBtn({ target }) {
      const dirctionBtn = target.closest('.direction-btn');
      if (!dirctionBtn) { return; }
      const oldIndex = this.activeIndex;
      const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;
      this._updateDirection();
      this.activeElements(newIndex);
    }
  }

  return ListSlider;

})(helpers);
