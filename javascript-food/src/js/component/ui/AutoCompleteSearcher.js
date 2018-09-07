/**
 * AutoCompleteSearcher 
 */

import ParentUI from './core/ParentUI.js';
import { getJSONPData, debounceEventListener } from './../../utility/helpers.js';

export default class AutoCompleteSearcher extends ParentUI {
  constructor({ wrapperElem, userOption = {}, userModule = {} }) {
    super();

    // dom
    if (!wrapperElem) { throw new Error('wrapperElem은 필수 옵션입니다.'); }
    this.searchBox = wrapperElem;
    this.form = wrapperElem.querySelector('.search-form-box');
    this.input = wrapperElem.querySelector('.search-input');
    this.submitBtn = wrapperElem.querySelector('button[type="submit"]');
    this.recentList = wrapperElem.querySelector('.search-list-box.recent');
    this.resultList = wrapperElem.querySelector('.search-list-box.result');

    // ui state data
    this.tempKeyword = '';
    this.currentKeyword = '';

    this.lastRecentIndex = null;
    this.activeRecentIndex = null;

    this.lastResultIndex = null;
    this.activeResultIndex = null;      

    this.mouseHoverOverTheList = false;

    // option
    Object.assign(this, {
      // request
      reqUrl: undefined,
      // storage
      useStorage: false,
      STORAGE_NAME: 'defaultSearchStorage',
      MAX_RECENT_SEARCH_KEYWORDS: 5,
      STORAGE_DURATION_TIME: 21600000, // 6시간(ms)
      // render
      templateHTMLResultList: undefined,
      templateHTMLRecentList: undefined,
      // etc
      debounceTime: 220 // ms단위
    }, userOption);
    this.STORAGE_NAME_RECENT_SEARCH = `${this.STORAGE_NAME}__search-recent-keywords`;
    this.STORAGE_NAME_SEARCH_RESPONSE_DATA = `${this.STORAGE_NAME}__search-result-resdata__\$\{keyword\}`;
  
    // module
    this.oStorage = userModule.Storage || this.DefaultStorage;
    this.oRenderer = this.DefaultRenderer;

    // static data
    this.errorMsg = { 'NOT_FOUNT_ITEM': 'not found item' };
  }

  /* init */

  init(afterInitFn) {
    this.registerEvents();
    afterInitFn && afterInitFn();
  }
  _checkStorageModule() {
    const isFunction = (toString.call(this.oStorage) === '[object Function]');

    if (isFunction) { 
      this.oStorage = new this.oStorage();
      
      const inheritParentStorage = (this.oStorage instanceof this.StorageType);
      if (!inheritParentStorage) { throw new TypeError('Storage가 ParentStorage를 상속받지 않았습니다.'); }
    }
  }
  _checkRendererModule() {
    const isFunction = (toString.call(this.oRenderer) === '[object Function]');
    if (isFunction) { this.oRenderer = new this.oRenderer(); }
  }

  /* storage */

  // response data storage
  _getStoredResponseData(keyword) {
    this._checkStorageModule();
    const storageName = this.STORAGE_NAME_SEARCH_RESPONSE_DATA.replace('${keyword}', keyword);
    const storageData = this.oStorage.getData(storageName, true);

    if (!storageData) { return false; }
    const savedTime = storageData.savedTime;
    const isValid = !this.oStorage.isExpiredData(savedTime, this.STORAGE_DURATION_TIME);
    return (isValid)? storageData.value : false;
  }
  _storeResponseData(keyword, resData) {
    this._checkStorageModule();
    const currentTime = +new Date();
    const storageName = this.STORAGE_NAME_SEARCH_RESPONSE_DATA.replace('${keyword}', keyword);
    const storageData = {
      'savedTime': currentTime,
      'value': resData
    };
    this.oStorage.setData(storageName, storageData, true);
  }

  // recent keyword storage
  _getRecentKeywords() {
    this._checkStorageModule();
    const keywords = this.oStorage.getData(this.STORAGE_NAME_RECENT_SEARCH, true);
    return (keywords)? keywords : [];
  }
  _storeRecentKeyword(newKeyword) {
    this._checkStorageModule();
    let keywords = this._getRecentKeywords();

    // 이미 저장되어 있던 키워드를 지우고 맨 앞으로 옮김
    keywords = this._removeRecentData(newKeyword, false);
    keywords.unshift(newKeyword);
    // 노출되는 키워드의 최대 갯수만 저장
    keywords = keywords.slice(0, this.MAX_RECENT_SEARCH_KEYWORDS);

    this.oStorage.setData(this.STORAGE_NAME_RECENT_SEARCH, keywords, true);
  }
  _removeRecentData(keywordForDelete, needToStore = true) {
    this._checkStorageModule();
    let keywords = this._getRecentKeywords();
    const indexForDelete = keywords.indexOf(keywordForDelete);

    if (indexForDelete > -1) { keywords.splice(indexForDelete, 1); }
    if (needToStore) {
      this.oStorage.setData(this.STORAGE_NAME_RECENT_SEARCH, keywords, true);
    } else {
      return keywords;
    }
  }

  /* request */

  async getSearchData(keyword) {
    if (this.useStorage) {
      const storageData = this._getStoredResponseData(keyword);
      if (storageData) { return storageData; }
    }

    const json = await this._requestSearchData(keyword);
    const isValidData = this._checkValidResponse(json);
    if (!isValidData) { return; }

    this._storeResponseData(keyword, json);
    return json;
  }
  async _requestSearchData(keyword) {
    const reqUrl = this.reqUrl.replace('${keyword}', keyword);    
    let json = null;

    try {
      // wiki API interface
      // => [ 'keyword', [...lists], [...descriptions], [...links] ]
      json = await getJSONPData(reqUrl);
      json = json[1];
    } catch (err) {
      if (err instanceof this.HttpErrorType && err.response.status === 404) {
        console.error(`Error_${err.response.status} : 잘못된 주소로 요청되었습니다.`);
      } else {
        throw err; // 정의되지 않은 에러는 rethrow
      }
    }
    return json;
  }
  _checkValidResponse(json) {
    const hasNoData = !json;
    const isValidArray = Array.isArray(json) && json.length;
    const isValidObject = (toString.call(json) === '[object Object]') && !!Object.keys(json).length;
    const hasNoContent = !isValidArray && !isValidObject;
    return (hasNoData || hasNoContent)? false : true;
  }

  /* render */

  renderResultList(keyword, searchList) {
    this._checkRendererModule();

    const viewData = this._makeResultViewData(keyword, searchList);
    this.oRenderer.renderDOM({
      templateHTML: this.templateHTMLResultList,
      data: viewData,
      appendFn: (resultHTML) => { this.resultList.innerHTML = resultHTML; }
    });
  }
  _makeResultViewData(keyword, searchList) {
    return searchList.map((searchItem, i) => {
      const keywordRegExp = new RegExp('('+ keyword +')', 'gi');
      const obj = {};
      obj.index = i;
      obj.value = searchItem;
      obj.valueWithHTML = searchItem.replace(keywordRegExp, '<em>$1</em>');
      return obj;
    });
  }

  renderRecentList(lists) {
    this._checkRendererModule();
    if (!lists.length) { return; }

    const viewData = this._makeRecentViewData(lists);
    this.oRenderer.renderDOM({
      templateHTML: this.templateHTMLRecentList,
      data: viewData,
      appendFn: (resultHTML) => { this.recentList.innerHTML = resultHTML; }
    });
  }
  _makeRecentViewData(lists) {
    return lists.map((list, i) => {
      const obj = {};
      obj.index = i;
      obj.value = list;
      return obj;
    });
  }
  
  /* UI */

  _resetToOriginalStatus() {
    this.currentKeyword = '';
    
    this.lastRecentIndex = null;
    this.activeRecentIndex = null;

    this.lastResultIndex = null;
    this.activeResultIndex = null;

    this.recentList.innerHTML = '';
    this.resultList.innerHTML = '';

    this.closeResultList();
    this.closeRecentList();
  }

  // keyword, input
  _isValidKeyword(keyword) {
    const newKeyword = keyword.trim();

    // 같은 키워드일 때
    if (newKeyword === this.currentKeyword) { return false; }
    // (추후 추가 예정) 옵션 선택 중일 때
    // if (this.input.dataset.choice) { return false; }
    return true;
  }
  _showSelectedKeyword(keyword) {
    this.input.value = keyword;
  }

  // recent list
  openRecentList() {
    const recentKeywords = this._getRecentKeywords();
    const isOpen = this._checkOpenedRecentList();

    if (!recentKeywords.length) { 
      isOpen && this.closeRecentList();
      return;
    }
    this.lastRecentIndex = recentKeywords.length - 1;
    this.renderRecentList(recentKeywords);
    !isOpen && this.recentList.classList.add('open');
  }
  closeRecentList() {
    const isOpen = this._checkOpenedRecentList();    
    isOpen && this.recentList.classList.remove('open');
  }
  _checkOpenedRecentList() {
    return this.recentList.classList.contains('open');
  }

  // recent item
  activeRecentItem(index) {
    const newIndex = Number(index);
    const newTargetElem = this.recentList.querySelectorAll('.search-list-item')[newIndex];
    const hasActiveItem = (this.activeRecentIndex !== null);

    if (hasActiveItem) { this.inactiveRecentItem(); }
    this.activeRecentIndex = newIndex;
    newTargetElem.classList.add('on');
  }
  inactiveRecentItem(index) {
    if (this.activeRecentIndex === null) { return; }
    const oldIndex = Number(index) || this.activeRecentIndex;
    const oldTargetElem = this.recentList.querySelectorAll('.search-list-item')[oldIndex];

    this.activeRecentIndex = null;
    oldTargetElem.classList.remove('on');
  }

  // result list
  openResultList() {
    const isOpen = this._checkOpenedResultList();
    !isOpen && this.resultList.classList.add('open');
  }
  closeResultList() {
    const isOpen = this._checkOpenedResultList();
    isOpen && this.resultList.classList.remove('open');
  }
  _checkOpenedResultList() {
    return this.resultList.classList.contains('open');
  }

  // result item
  activeResultItem(index) {
    const newIndex = Number(index);
    const newTargetElem = this.resultList.querySelectorAll('.search-list-item')[newIndex];
    const hasActiveItem = (this.activeResultIndex !== null);

    if (hasActiveItem) { this.inactiveResultItem(); }
    this.activeResultIndex = newIndex;
    newTargetElem.classList.add('on');
  }
  inactiveResultItem(index) {
    if (this.activeResultIndex === null) { return; }
    const oldIndex = Number(index) || this.activeResultIndex;
    const oldTargetElem = this.resultList.querySelectorAll('.search-list-item')[oldIndex];

    this.activeResultIndex = null;
    oldTargetElem.classList.remove('on');
  }
  _findToActiveResultItem() {
    return this.resultList.querySelector('.on');
  }

  // form
  submitForm(keyword) {
    console.log('폼데이터를 서버에 전송. 페이지 요청.'); // (실제 기능이 없으므로 이렇게 대체)
  }

  /* Event */

  registerEvents() {
    this.form.addEventListener('submit', (e) => e.preventDefault());
    this.input.addEventListener('focus', (e) => this._onFocusInput(e));
    this.input.addEventListener('blur', (e) => this._onBlurInput(e));

    // 문자 내용이 변경될 때
    if (this.debounceTime) {
      this.debounceEventListener = debounceEventListener({
        listenerFn: this._onInputVisibleKey.bind(this),
        delayTime: this.debounceTime
      });
      this.input.addEventListener('input', this.debounceEventListener);
    } else {
      this.input.addEventListener('input', (e) => this._onInputVisibleKey(e));
    }

    this.input.addEventListener('keydown', (e) => this._onKeydownArrowKey(e)); // 누르는 동안 계속 트리거
    this.input.addEventListener('keyup', (e) => this._onKeyupEnterKey(e)); // 띌 때 한번만 발생

    this.recentList.addEventListener('mouseover', (e) => this._onMouseoverRecentList(e));
    this.recentList.addEventListener('mouseleave', (e) => this._onMouseleaveRecentList(e));
    this.recentList.addEventListener('click', (e) => e.preventDefault());
    this.recentList.addEventListener('click', (e) => this._onClickRecentList(e));

    this.resultList.addEventListener('mouseover', (e) => this._onMouseoverResultList(e));
    this.resultList.addEventListener('mouseleave', (e) => this._onMouseleaveResultList(e));
    this.resultList.addEventListener('click', (e) => e.preventDefault());
    this.resultList.addEventListener('click', (e) => this._onClickResultList(e));
  }

  // focus,blur - input
  _onFocusInput({ target }) {
    const isEmptyValue = (target.value.trim() === '');
    isEmptyValue && this.openRecentList();
  }
  _onBlurInput() {
    !this.mouseHoverOverTheList && this._resetToOriginalStatus();
  }

  // input - visible keys
  async _onInputVisibleKey({ target: { value: keyword } }) {
    if (keyword === '') {
      this._resetToOriginalStatus();
      this.openRecentList();
      return;
    }
    if (!this._isValidKeyword(keyword)) { return; }

    this.closeRecentList();
    await this._handleVisibleKey(keyword);
  }
  async _handleVisibleKey(keyword) {
    const searchList = await this.getSearchData(keyword);
    if (!searchList) {
      this.closeResultList();
      return;
    }

    this.currentKeyword = keyword;
    this.lastResultIndex = searchList.length - 1;
    this.renderResultList(keyword, searchList);
    this.openResultList();
  }

  // keydown - arrow keys
  _onKeydownArrowKey(e) {
    const KEY_ARROW_UP = 38;
    const KEY_ARROW_DOWN = 40;
    const keyCode = e.keyCode;
    const hasNoSearchResult = !this.lastResultIndex;

    if (hasNoSearchResult) { return; }
    if (keyCode === KEY_ARROW_UP) { this._handleArrowUpKey(e); return; }
    if (keyCode === KEY_ARROW_DOWN) { this._handleArrowDownKey(); return; }
  }
  _handleArrowUpKey(e) {
    e.preventDefault(); // 커서이동이 앞으로 가는 동작을 막기 위함. (ux개선)

    const currentIndex = this.activeResultIndex;
    const isFirstItem = (currentIndex === 0);
    let nextIndex = null;

    if (isFirstItem) {
      this.inactiveResultItem();
      return;
    }
    nextIndex = (currentIndex === null)? this.lastResultIndex : currentIndex - 1;
    this.activeResultItem(nextIndex);
  }
  _handleArrowDownKey() {
    const currentIndex = this.activeResultIndex;
    const isLastItem = (currentIndex === this.lastResultIndex);
    let nextIndex = null;

    if (isLastItem) {
      this.inactiveResultItem();
      return;
    }
    nextIndex = (currentIndex === null)? 0 : currentIndex + 1;
    this.activeResultItem(nextIndex);
  }

  // keyup - enter key
  _onKeyupEnterKey(e) {
    const keyCode = e.keyCode;
    const KEY_ENTER = 13;
    const currentKeyword = e.target.value.trim();
    const hasNoKeyword = (currentKeyword === '');

    if (hasNoKeyword) { return; }
    if (keyCode === KEY_ENTER) {
      this._handleEnterKey(currentKeyword);
    }
  }
  _handleEnterKey(currentKeyword) {
    const activeItem = this._findToActiveResultItem();
    const hitEnterKeyWithActiveItem = !!activeItem;

    if (hitEnterKeyWithActiveItem) {
      const selectedKeyword = activeItem.dataset.value;
      this._showSelectedKeyword(selectedKeyword);
      this._resetToOriginalStatus();
    } else {
      this._storeRecentKeyword(currentKeyword);
      this.submitForm(currentKeyword);
      this.closeResultList();
    }
  }

  // mouse - recent list
  _onMouseoverRecentList({ target }) {
    if (!target.classList.contains('search-list-item')) { return; }
    const newIndex = target.dataset.index;
    !this.mouseHoverOverTheList && (this.mouseHoverOverTheList = true);
    this.activeRecentItem(newIndex);
  }
  _onMouseleaveRecentList({ target }) {
    if (target !== this.recentList) { return; }
    this.mouseHoverOverTheList = false;
    this.inactiveRecentItem();
  }
  _onClickRecentList({ target }) {
    if (target.classList.contains('search-list-item')) {
      const selectedKeyword = target.dataset.value;
      this._showSelectedKeyword(selectedKeyword);
      this._resetToOriginalStatus();
      return;
    }
    if (target.classList.contains('delete-btn')) {
      const keywordForDelete = target.closest('.search-list-item').dataset.value;
      this._removeRecentData(keywordForDelete);
      this.openRecentList();
    }
  }

  // mouse - result list
  _onMouseoverResultList({ target }) {
    if (!target.classList.contains('search-list-item')) { return; }
    const newIndex = target.dataset.index;
    !this.mouseHoverOverTheList && (this.mouseHoverOverTheList = true);
    this.activeResultItem(newIndex);
  }
  _onMouseleaveResultList({ target }) {
    // 마우스 이동해서 나갈 때 -> 안닫히고 && inactive
    // 목록이 닫혀서 나갈 때 -> 닫히고,리셋 && 플래그 false바꿔주기
    // event 순서 : blur -> click -> mouseleave
    if (target !== this.resultList) { return; }
    this.mouseHoverOverTheList = false;
    this.inactiveResultItem();
  }
  _onClickResultList({ target }) {
    const listElem = target.closest('.search-list-item');
    if (!listElem) { return; }
    const selectedKeyword = listElem.dataset.value;

    this._showSelectedKeyword(selectedKeyword);
    this._resetToOriginalStatus();
  }
}