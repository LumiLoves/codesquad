/**
 * ListSlider
 */

import ParentSlider from './ParentSlider.js';
import { getFetchData, attachIndexToDom } from './../../utility/helpers.js';

export default class ListSlider extends ParentSlider {
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
    Object.assign(this, {
      // request
      reqUrl: undefined,
      // storage
      useStorage: false,
      storageName: 'listSliderResponseData',
      // render
      templateHTML: undefined,
      // ui
      ITEM_COUNT_PER_GROUP: 1
    }, userOption);

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
      json = await getFetchData({ url: this.reqUrl });
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
    const groupCount = Math.ceil(viewData.length / this.ITEM_COUNT_PER_GROUP);
    const groupStyle = (groupCount > 2)? 'default' : (groupCount === 2)? 'two' : 'one'; 

    this.oRenderer.renderDOM({
      templateHTML: this.templateHTML,        
      data: viewData,
      appendFn: (resultHTML) => { 
        this.contentBox.dataset.groupStyle = groupStyle;
        this.contentBox.innerHTML = resultHTML; 
      }
    });
    this._setStateDataAfterRender();
  }
  _hasNoDOM() {
    return !this.contentItems.length;
  }
  _makeViewData(resultData) {
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
  _activeContent(oldIndex, newIndex) {
    super.activeContent(oldIndex, newIndex);
  }

  _isPrevBtn(target) {
    return super.isPrevBtn(target);
  }

  _updateDirection(oldIndex, newIndex) {
    super.updateDirection(oldIndex, newIndex);
  }

  /* event */
  
  registerEvents() {
    attachIndexToDom(this.contentItems);    
    this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));
  }
  _onClickDirectionBtn({ target }) {
    const dirctionBtn = target.closest('.direction-btn');
    if (!dirctionBtn) { return; }

    const oldIndex = this.activeIndex;
    const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;
    this._updateDirection(oldIndex, newIndex);
    this.activeElements(newIndex);
  }
}