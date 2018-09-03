/**
 * Tab
 */

import ParentUI from './core/ParentUI.js';
import { getFetchData, attachIndexToDom } from './../../utility/helpers.js';

export default class Tab extends ParentUI {
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
    Object.assign(this, {
      // request
      reqUrl: undefined,
      // storage
      useStorage: false,
      STORAGE_NAME: 'defaultTabStorage',
      STORAGE_DURATION_TIME: 21600000, // 6시간(ms)
      // render
      templateHTML: undefined
    }, userOption);
    this.STORAGE_NAME_RESPONSE_DATA = this.STORAGE_NAME + '_responseData';

    // module
    this.oStorage = userModule.Storage || this.DefaultStorage;
    this.oRenderer = this.DefaultRenderer;
  }

  /* init */

  async init() { // 생성 시 호출할 내부 메서드를 모아놓는 곳
    const randomIndex = this._getRandomIndex();

    if (this._hasNoDOM()) {
      const json = await this.getTabData(); 
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

  async getTabData() {
    if (this.useStorage) {
      const storageData = this._getStoredResponseData();
      if (storageData) { return storageData; }  
    }

    const json = await this._requestTabData();
    if (json) { this._storeResponseData(json); }
    return json;
  }
  async _requestTabData() {
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

    this.btnItems[oldIndex].classList.remove('on');
    this.btnItems[newIndex].classList.add('on');
  }
  _activeContent(oldIndex, newIndex = 0) {
    // const index = newIndex || 0;

    this.contentItems[oldIndex].classList.remove('on');
    this.contentItems[newIndex].classList.add('on');      
  }
  _getRandomIndex() {
    const min = 0;
    const max = this.btnItems.length - 1;
    return min + Math.floor(Math.random() * (max + 1));
  }

  /* event */

  registerEvents() {
    attachIndexToDom(this.btnItems, '.tab-btn');
    this.btnBox.addEventListener('click', (e) => e.preventDefault());
    this.btnBox.addEventListener('click', this._onClickBtn.bind(this));
  }
  _onClickBtn({ target }) {
    if (!target.classList.contains('tab-btn')) { return; }
    this.activeElements(target.index);
  }
}
