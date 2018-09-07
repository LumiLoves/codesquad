/**
 * ListSlider
 */

import ParentSlider from './ParentSlider.js';
import { getFetchData } from './../../utility/helpers.js';

export default class ListSlider extends ParentSlider {
  constructor({ wrapperElem, userOption = {}, userModule = {} }) {
    super();

    // dom
    this.wrapperElem = wrapperElem;
    this.contentBox = wrapperElem.querySelector('.content-group');
    this.contentItems = wrapperElem.querySelectorAll('.content-group > li');
    this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');          

    // ui state data
    this.activeIndex = 0;
    this.maxIndex = this.contentItems && this.contentItems.length;      
    this.isMoving = false;

    // option
    Object.assign(this, {
      // request
      reqUrl: undefined,
      // storage
      useStorage: false,
      STORAGE_NAME: 'defaultSliderStorage',
      STORAGE_DURATION_TIME: 21600000, // 6시간(ms)
      // render
      templateHTML: undefined,
      // ui
      ITEM_COUNT_PER_GROUP: 1
    }, userOption);
    this.STORAGE_NAME_RESPONSE_DATA = this.STORAGE_NAME + '_responseData';

    // module
    this.oStorage = userModule.Storage || this.DefaultStorage;
    this.oRenderer = this.DefaultRenderer;
  }

  /* init */

  async init() {
    if (this._hasNoDOM()) {
      const json = await this.getSliderData();
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

  /* storage */

  _getStoredResponseData() {
    this._checkStorageModule();
    const storageName = this.STORAGE_NAME_RESPONSE_DATA;
    const storageData = this.oStorage.getData(storageName, true);
    if (!storageData) { return false; }

    const savedTime = storageData.savedTime;
    const isValid = !this.oStorage.isExpiredData(savedTime, this.STORAGE_DURATION_TIME)
    return (isValid)? storageData.value : false;
  }
  _storeResponseData(resData) {
    this._checkStorageModule();
    const currentTime = +new Date();
    const storageName = this.STORAGE_NAME_RESPONSE_DATA;
    const storageData = {
      'savedTime': currentTime,
      'value': resData
    };
    this.oStorage.setData(storageName, storageData, true);
  }

  /* render */

  async getSliderData() {
    if (this.useStorage) {
      const storageData = this._getStoredResponseData();
      if (storageData) { return storageData; }  
    }

    const json = await this._requestSliderData();
    if (json) { this._storeResponseData(json); }
    return json;
  }
  async _requestSliderData() {
    let json = null;

    try {
      json = await getFetchData({ url: this.reqUrl });
    } catch (err) {
      if (err instanceof this.HttpErrorType && err.response.status === 404) {
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
    this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.directionBtnBox.addEventListener('click', (e) => this._onClickDirectionBtn(e));

    [ 'transitionend', 'animationend' ].forEach((eventName) => {
      this.contentBox.addEventListener(eventName, (e) => this._onCssAnimationsEnd(e));
    });
  }
  _onClickDirectionBtn({ target }) {
    const isDirectionBtn = target.closest('.direction-btn');
    if (!isDirectionBtn || this.isMoving) { return; }

    const oldIndex = this.activeIndex;
    const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;

    this.isMoving = true;
    this._updateDirection(oldIndex, newIndex);
    this.activeElements(newIndex);
  }
  _onCssAnimationsEnd({ target }) {
    const isCurrentItem = target.classList.contains('current');
    if (!isCurrentItem) { return; }

    this.isMoving = false;
  }
}