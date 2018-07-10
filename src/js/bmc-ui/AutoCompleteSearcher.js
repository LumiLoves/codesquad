'use strict';

/**
 * AutoCompleteSearcher 
 */

const AutoCompleteSearcher = (function(helpers) {

  class AutoCompleteSearcher extends ParentUI {
    constructor({ wrapperElem, userOption = {}, userModule = {} }) {
      super();

      // dom
      this.form = wrapperElem;
      this.input = wrapperElem.querySelector('input[name="search-keyword"]');
      this.submitBtn = wrapperElem.querySelector('button[type="submit"]');
      this.resultBox = wrapperElem.querySelector('.search-result-box');

      // ui state data
      this.searchedKeyword = '';
      this.lastResultIndex = null;
      this.activeResultItemIndex = null;
      this.STORAGE_SEARCH = 'autocomplete_${keyword}';

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

    init() {
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

    async getSearchData(keyword) {
      const storageData = this._getStorageData(keyword);
      if (storageData) { return storageData; }

      const json = await this._getRequestData(keyword);
      const isValidData = this._checkValidResponse(json);    
      return (isValidData)? json : false;
    }
    _getStorageData(keyword) {
      this._checkStorageModule();
      const stoargeName = this.STORAGE_SEARCH.replace('${keyword}', keyword);
      const storageData = this.oStorage.checkData(stoargeName);
      return storageData;
    }
    async _getRequestData(keyword) {
      const reqUrl = this.reqUrl.replace('${query}', keyword);    
      let json = null;

      try {
        json = await helpers.getFetchData({ url: reqUrl });
      } catch (err) {
        if (err instanceof HttpError && err.response.status === 404) {
          console.error(`Error_${err.response.status} : 잘못된 주소로 요청되었습니다.`);
        } else {
          throw err; // 정의되지 않은 에러는 rethrow
        }
      }
      return json;
    }
    renderResult(keyword, json) {
      // json 구조 : [ 'keyword', [["오리고기"], ["오징어"], ...] ]     
      const searchList = json[1]; // API의 약속된 응답 데이터 구조를 따름
      const viewData = this._makeResultViewData(keyword, searchList);

      this._checkRendererModule();
      this.oRenderer.renderDOM({
        templateHTML: this.templateHTML,
        data: viewData,
        appendFn: (resultHTML) => { this.resultBox.innerHTML = resultHTML; }
      });
    }
    _checkValidResponse(json) {
      return (json.error === 'not found item')? false : true;
    }
    _makeResultViewData(keyword, searchList) {
      // searchList 구조 : [ ["오리고기"], ["오징어"], ... ] 
      return searchList.map((searchItem, i) => {
        const resultTxt = searchItem[0];
        const obj = {};

        obj.index = i;
        obj.value = resultTxt;
        obj.valueWithHTML = resultTxt.replace(keyword, `<em>${keyword}</em>`);
        return obj;
      });
    }
    
    /* UI */

    // script dom
    // _checkScriptDOM() { }
    // _injectScriptDOM() { }

    resetToOriginalStatus() {
      this.searchedKeyword = '';
      this.lastResultIndex = null;
      this.activeResultItemIndex = null;
      this.closeResultBox();
      this.emptyResultBox();
    }

    // keyword
    _isValidKeyword(newKeyword) {
      // 같은 키워드일 때
      if (newKeyword === this.searchedKeyword) { return false; }
      // 빈 값일 때
      if (newKeyword === '') {
        this.resetToOriginalStatus();
        return false;
      }
      // (추후 추가 예정) 옵션 선택 중일 때
      // if (this.input.dataset.choice) { return false; }
      return true;
    }
    _updateKeyword(keyword) {
      this.searchedKeyword = keyword;
    }

    // result box
    _checkOpenedResultBox() {
      return this.resultBox.classList.contains('open');
    }
    openResultBox() {
      const isOpenedResultBox = this._checkOpenedResultBox();
      !isOpenedResultBox && this.resultBox.classList.add('open');
    }
    closeResultBox() {
      const isOpenedResultBox = this._checkOpenedResultBox();    
      isOpenedResultBox && this.resultBox.classList.remove('open');
    }
    emptyResultBox() {
      this.resultBox.innerHTML = '';
    }
    
    // result item
    activeResultItem(index) {
      const newIndex = Number(index);
      const newTarget = this.resultBox.querySelectorAll('a')[newIndex];
      const hasActiveItem = (this.activeResultItemIndex !== null);

      if (hasActiveItem) { this.inactiveResultItem(); }
      this.activeResultItemIndex = newIndex;
      newTarget.classList.add('on');
    }
    inactiveResultItem(index) {
      const oldIndex = Number(index) || this.activeResultItemIndex;
      const oldTarget = this.resultBox.querySelectorAll('a')[oldIndex];

      this.activeResultItemIndex = null;
      oldTarget.classList.remove('on');
    }
    _findToActiveResultItem() {
      return this.resultBox.querySelector('.on');
    }

    // form
    // _showOriginKeywordOnInputElem() {}
    submitForm() {
      console.log('폼데이터를 서버에 전송. 페이지 요청.'); // (실제 기능이 없으므로 이렇게 대체)
    }

    /* Event */

    registerEvents() {
      this.form.addEventListener('submit', (e) => e.preventDefault());
      // this.form.addEventListener('submit', this.submitForm.bind(this));

      // this.input.addEventListener('focus', this._onFocusInput.bind(this));
      this.input.addEventListener('blur', this._onBlurInput.bind(this));
      
      this.input.addEventListener('keydown', this._onKeydownFunctionKey.bind(this)); // 누르는 동안 계속 트리거
      this.input.addEventListener('keyup', this._onKeyupFunctionKey.bind(this)); // 띌 때 한번만 발생
      this.input.addEventListener('input', this._onInputVisibleKey.bind(this)); // 문자 내용이 변경될 때

      this.resultBox.addEventListener('mouseover', this._onMouseoverResultBox.bind(this));
      this.resultBox.addEventListener('mouseleave', this._onMouseleaveResultBox.bind(this));
    }
    /*
    _onFocusInput() {
      const hasScriptDOM = this._checkScriptDOM();
      if (hasScriptDOM) { return; }
      this._injectScriptDOM();
      this._onLoadScript();
    }
    _onLoadScript() {
      this.input.removeEventListener('focus', this._onFocusInput);
    }
    */
    _onBlurInput() {
      this.resetToOriginalStatus();
    }

    _handleArrowUpKey(e) {
      e.preventDefault(); // 커서이동이 앞으로 가는 동작을 막기 위함. (ux개선)

      const currentIndex = this.activeResultItemIndex;
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
      const currentIndex = this.activeResultItemIndex;
      const isLastItem = (currentIndex === this.lastResultIndex);
      let nextIndex = null;

      if (isLastItem) {
        this.inactiveResultItem();
        return;
      }
      nextIndex = (currentIndex === null)? 0 : currentIndex + 1;
      this.activeResultItem(nextIndex);
    }
    _handleEnterKey() {
      const activeResultItem = this._findToActiveResultItem();

      if (activeResultItem) {
        this.input.value = activeResultItem.dataset.value;   
        this.resetToOriginalStatus();
      } else {
        this.submitForm();
      }
      this.closeResultBox();
    }

    _onKeydownFunctionKey(e) {
      const KEY_ARROW_UP = 38;
      const KEY_ARROW_DOWN = 40;
      const keyCode = e.keyCode;
      const hasNoSearchResult = !this.lastResultIndex;

      if (hasNoSearchResult) { return; }
      if (keyCode === KEY_ARROW_UP) { this._handleArrowUpKey(e); return; }
      if (keyCode === KEY_ARROW_DOWN) { this._handleArrowDownKey(); return; }
    }
    _onKeyupFunctionKey(e) {
      const KEY_ENTER = 13;
      const keyCode = e.keyCode;
      const hasNoKeyword = (e.target.value === '');

      if (hasNoKeyword) { return; }
      if (keyCode === KEY_ENTER) { this._handleEnterKey(); return; }
    }
    async _onInputVisibleKey({ target: { value: keyword } }) {
      if (!this._isValidKeyword(keyword)) { return; }

      const resJSON = await this.getSearchData(keyword); 
      if (!resJSON) {
        this.closeResultBox();
        return;
      }

      this.searchedKeyword = keyword;
      this.lastResultIndex = resJSON[1].length - 1;    
      this.emptyResultBox();
      this.renderResult(keyword, resJSON);
      this.openResultBox();
    }
    _onMouseleaveResultBox({ target }) {
      if (target.nodeName !== 'UL') { return; }
      this.inactiveResultItem();
    }
    _onMouseoverResultBox({ target }) {
      if (target.nodeName !== 'A') { return; }
      const newIndex = target.dataset.index;
      this.activeResultItem(newIndex);
    }
  }

  return AutoCompleteSearcher;

})(helpers);
