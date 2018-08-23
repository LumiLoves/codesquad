/**
 * AutoCompleteSearcher.test.js
 */

import ParentUI from './../../../../src/js/component/ui/core/ParentUI.js';
import AutoCompleteSearcher from './../../../../src/js/component/ui/AutoCompleteSearcher.js';
import templateRecentList from './../../../../src/template/auto-complete-searcher__recent-list.js';
import templateResultList from './../../../../src/template/auto-complete-searcher__result-list.js';
const { expect } = chai;

const makeSearchBoxDOM = () => {
  const templateElem = document.createElement('template');
  const templateSearchBox = `
    <div class="search-box">
      <form class="search-form-box" action="/" method="get">
        <label for="search-input" class="blind">검색</label>
        <input type="text" id="search-input" class="search-input" name="search-keyword" autocomplete="off" />
        <button type="submit"><span>검색</span></button>
      </form>

      <div class="search-list-box-wrapper">
        <ul class="search-list-box recent"></ul>
        <ul class="search-list-box result"></ul>
      </div>
    </div>`;
  templateElem.innerHTML = templateSearchBox;
  return templateElem.content.childNodes[1];
};

// default 데이터를 가지고 있음
// 필수데이터 주입안받으면 에러남
// 옵션 데이터를 주입받으면 그 데이터를 가지고 있음
// ParentUI의 구조에 맞게 필수메서드, 옵션메서드, 구조가 잘 생성되었는지 확인. (undefined가 아닌지 확인)

// 메서드 실행시 필수 파라미터가 없으면 expect.to.throw(Error); 아니면 예상되는 return
// 주요 목적에 대한 테스트

describe('[UI Component] AutoCompleteSearcher', () => {
  let oSearcher;

  beforeEach(() => {
    const testParam = {
      wrapperElem: makeSearchBoxDOM(),
      userOption: {
        reqUrl: '/',
        STORAGE_NAME: 'testSearchStorage',
        templateHTMLResultList: templateResultList,
        templateHTMLRecentList: templateRecentList
      }
    };
    oSearcher = new AutoCompleteSearcher(testParam);
    oSearcher.init();
  });

  /**
   * Create
   */
  describe('# Create', () => {
    it('ParentUI를 상속받은 인스턴스가 만들어지고, 주입한 옵션값이 인스턴스 속성으로 설정된다.', () => {
      // given
      let oSearcher = null;
      const param = {
        wrapperElem: makeSearchBoxDOM(),
        userOption: {
          reqUrl: '/',
          templateHTMLRecentList: templateRecentList,
          templateHTMLResultList: templateResultList          
        }
      };

      // when
      oSearcher = new AutoCompleteSearcher(param);
      // then
      expect(oSearcher instanceof ParentUI, 'ParentUI를 상속받아야 한다.').to.be.true;
      expect(oSearcher instanceof AutoCompleteSearcher, 'AutoCompleteSearcher의 인스턴스여야 한다.').to.be.true;
      expect(oSearcher, '인스턴스에 주입한 옵션값이 bind된다.').to.include(param.userOption);
    });

    it('필수 옵션을 주입하지 않을 경우, 에러가 발생한다.', () => {
      // given
      let oSearcher = null;
      let hasError = false;

      try {
        // when
        oSearcher = new AutoCompleteSearcher();
      } catch (err) {
        hasError = true;  
      }
      // then
      expect(hasError).to.be.true;
    });

    it('wrapperElem을 주입하면, 정해진 selector로 wrapperElem의 자식 element들이 인스턴스 속성으로 설정된다.', () => {
      // given
      const elemNames = [ 'searchBox', 'form', 'input', 'submitBtn', 'recentList', 'resultList' ];

      // when (beforeEach에서 instance 생성)
      // then
      elemNames.forEach((elemName) => {
        const isElement = (oSearcher[elemName] instanceof Element);
        const errorMsg = `${elemName}가 없음`;
        expect(isElement, errorMsg).to.be.true;
      });
    });

    it('UI State Data를 가지고 있다.', () => {
      // given 
      const uiStateData = {
        tempKeyword: '',
        currentKeyword: '',
        lastRecentIndex: null,
        activeRecentIndex: null,
        lastResultIndex: null,
        activeResultIndex: null,      
        mouseHoverOverTheList: false
      };

      // when (beforeEach에서 instance 생성)
      // then
      expect(oSearcher).to.include(uiStateData);
    });
  });

  /**
   * Initialize
   */
  describe('# Initialize', () => {
    it('init() - registerEvents 함수를 실행한다.', () => {
      // given
      const spyRegisterEvents = sinon.spy(oSearcher, 'registerEvents');

      // when
      oSearcher.init();
      // then
      expect(spyRegisterEvents.calledOnce);
    });

    it('init() - callback함수가 있을 경우 실행한다.', () => {
      // given
      const spyInitAfter = sinon.spy();

      // when, then
      oSearcher.init();
      expect(spyInitAfter.notCalled);
      // when, then
      oSearcher.init(spyInitAfter);
      expect(spyInitAfter.calledOnce);
    });
  });

  /**
   * Storage
   */
  describe('# Storage', () => {
    let fakeStorageSpace;

    beforeEach(() => {
      fakeStorageSpace = {};

      // 브라우저 내장 스토리지를 사용하므로 대체 객체 만듦
      oSearcher.oStorage = {
        getData(key) {
          return fakeStorageSpace[key];
        },
        setData(key, value) {
          fakeStorageSpace[key] = value;
        },
        isExpiredData(savedTime, savingDuration) {
          const currentTime = +new Date();
          const gap = currentTime - savedTime;
          return gap >= savingDuration;
        }
      };

      sinon.stub(oSearcher, '_checkStorageModule').callsFake(() => undefined);
    });

    context('storage에서 검색 응답데이터를', () => {
      // given (공통)
      const DUMMY_KEYWORD = '테스트용 검색어';
      const DUMMY_DATA = '테스트용 데이터';
  
      it('가져올 때, 저장된 값이 없으면 false가 반환된다. ', () => {
        // given
        let result;

        // when
        result = oSearcher._getStoredResponseData(DUMMY_KEYWORD);
        // then
        expect(result).to.be.false;
      });
      
      it('저장하고 가져올 때, 저장한 값이 반환된다.', () => {
        // given
        let storedResData;
        // when
        oSearcher._storeResponseData(DUMMY_KEYWORD, DUMMY_DATA);
        storedResData = oSearcher._getStoredResponseData(DUMMY_KEYWORD);
        // then
        expect(storedResData).to.equal(DUMMY_DATA);
      });

      it('저장하고 가져올 때, 저장된 값이 있으나 유효기간이 지난 경우 false가 반환된다.', () => {
        // given
        let storedResData;
        oSearcher.STORAGE_DURATION_TIME = 0;
        
        // when
        oSearcher._storeResponseData(DUMMY_KEYWORD, DUMMY_DATA);
        storedResData = oSearcher._getStoredResponseData(DUMMY_KEYWORD);
        // then
        expect(storedResData).to.be.false;
      });
    });

    context('storage에서 최근 검색어를', () => {
      // given (공통)
      const DUMMY_KEYWORD_ARR = [ '최근검색어_01', '최근검색어_02', '최근검색어_03' ];

      it('가져올 때, 저장된 검색어가 없으면 빈 배열이 반환된다. ', () => {
        // given
        let storedRecentKeywords;

        // when
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords).to.be.an('array');
        expect(storedRecentKeywords.length).to.equal(0);
      });

      it('저장하고 가져올 때, 저장한 검색어가 들어간 배열이 반환된다. ', () => {
        // given
        const NEW_KEYWORD = DUMMY_KEYWORD_ARR[0];
        let storedRecentKeywords;

        // when
        oSearcher._storeRecentKeyword(NEW_KEYWORD);
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords).to.be.an('array');
        expect(storedRecentKeywords.length).to.equal(1);
        expect(storedRecentKeywords.indexOf(NEW_KEYWORD) > -1).to.be.true;
      });

      it('저장할 때, 배열의 맨 앞으로만 추가된다.', () => {
        // given
        const expectedKeywords = [...DUMMY_KEYWORD_ARR].reverse();
        let storedRecentKeywords;

        // when
        DUMMY_KEYWORD_ARR.forEach((elem) => oSearcher._storeRecentKeyword(elem));
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords.length).to.equal(DUMMY_KEYWORD_ARR.length);
        expect(storedRecentKeywords).to.deep.equal(expectedKeywords);
      });

      it('저장할 때, 이미 저장된 검색어가 있으면 기존 위치에서 삭제 후 맨 앞으로 저장된다.', () => {
        // given
        const KEYWORD_ALREADY_EXIST = DUMMY_KEYWORD_ARR[0];
        let storedRecentKeywords;

        // when
        DUMMY_KEYWORD_ARR.forEach((elem) => oSearcher._storeRecentKeyword(elem));
        oSearcher._storeRecentKeyword(KEYWORD_ALREADY_EXIST); // 중복된 검색어 저장
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords.length).to.equal(DUMMY_KEYWORD_ARR.length);
        expect(storedRecentKeywords[0]).to.equal(KEYWORD_ALREADY_EXIST);
      });

      it('저장할 때, 이미 최대 갯수만큼 저장되어 있을 경우 맨 마지막 검색어가 삭제 되고 저장된다.', () => {
        // given
        const ANOTHER_KEYWORD = '추가 검색어';
        const MAXIMUM_NUMBER_OF_SAVED = DUMMY_KEYWORD_ARR.length;
        let storedRecentKeywords;

        oSearcher.MAX_RECENT_SEARCH_KEYWORDS = MAXIMUM_NUMBER_OF_SAVED;

        // when
        DUMMY_KEYWORD_ARR.forEach((elem) => oSearcher._storeRecentKeyword(elem));
        oSearcher._storeRecentKeyword(ANOTHER_KEYWORD); // 최대 갯수 저장후 하나 더 저장
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords.length).to.equal(MAXIMUM_NUMBER_OF_SAVED);
        expect(storedRecentKeywords[0]).to.equal(ANOTHER_KEYWORD);
      });

      it('삭제할 때, 요청한 검색어가 삭제된 배열이 저장된다.', () => {
        // given
        const KEYWORD_FOR_DELETE = DUMMY_KEYWORD_ARR[0];
        const expectedLength = DUMMY_KEYWORD_ARR.length - 1;
        let storedRecentKeywords;

        // when
        DUMMY_KEYWORD_ARR.forEach((elem) => oSearcher._storeRecentKeyword(elem));
        oSearcher._removeRecentData(KEYWORD_FOR_DELETE);
        storedRecentKeywords = oSearcher._getRecentKeywords();

        // then
        expect(storedRecentKeywords.length).to.equal(expectedLength);
        expect(storedRecentKeywords.indexOf(KEYWORD_FOR_DELETE) > -1).to.be.false;
      });
    });
  });

  /**
   * Request
   */
  describe('# Request', () => {
    const DUMMY_KEYWORD = '테스트용 검색어';
    const fakeStoredData = '테스트용 저장 데이터';
    const fakeEmptyStoredData = '';
    const fakeValidJSON = { value: '유효한 테스트 데이터' };
    const fakeErrorJSON = { error: '에러메시지' };

    context('useStorage 옵션 속성이', () => {
      it('true일 경우, 저장된 데이터가 있으면 http 요청을 하지 않고 해당 데이터를 반환한다.', async () => {
        // given
        const stubGetStoredResponseData = sinon.stub(oSearcher, '_getStoredResponseData').callsFake(() => fakeStoredData);
        const spyRequestSearchData = sinon.spy(oSearcher, '_requestSearchData');
        let resultData;
        oSearcher.useStorage = true;

        // when
        resultData = await oSearcher.getSearchData(DUMMY_KEYWORD);
        // then
        expect(stubGetStoredResponseData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(spyRequestSearchData.withArgs(DUMMY_KEYWORD).notCalled);
        expect(resultData).to.equal(fakeStoredData);
      });

      it('false일 경우, http 요청메서드가 실행된다.', async () => {
        // given
        const spyGetStoredResponseData = sinon.spy(oSearcher, '_getStoredResponseData');
        const stubRequestSearchData = sinon.stub(oSearcher, '_requestSearchData').callsFake(() => fakeValidJSON);
        let resultData;
        oSearcher.useStorage = false;

        // when
        resultData = await oSearcher.getSearchData(DUMMY_KEYWORD);
        // then
        expect(spyGetStoredResponseData.notCalled);
        expect(stubRequestSearchData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(resultData).to.equal(fakeValidJSON);
      });
    });

    context('저장된 데이터가 없어서 http 요청 성공 후 받은 응답 데이터가', () => {
      it('유효하지 않을 경우 반환 값이 없다.', async () => {
        // given
        const stubGetStoredResponseData = sinon.stub(oSearcher, '_getStoredResponseData').callsFake(() => fakeEmptyStoredData);
        const stubRequestSearchData = sinon.stub(oSearcher, '_requestSearchData').callsFake(() => fakeErrorJSON);
        const spyCheckValidResponse = sinon.spy(oSearcher, '_checkValidResponse');
        let resultData;
        oSearcher.useStorage = true;

        // when
        resultData = await oSearcher.getSearchData(DUMMY_KEYWORD);
        // then
        expect(stubGetStoredResponseData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(stubRequestSearchData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(spyCheckValidResponse.returned(false));
        expect(resultData).to.an.undefined;
      });
  
      it('유효한 경우 반환 값이 있다.', async () => {
        // given
        const stubGetStoredResponseData = sinon.stub(oSearcher, '_getStoredResponseData').callsFake(() => fakeEmptyStoredData);
        const stubRequestSearchData = sinon.stub(oSearcher, '_requestSearchData').callsFake(() => fakeValidJSON);
        const spyCheckValidResponse = sinon.spy(oSearcher, '_checkValidResponse');
        let resultData;
        oSearcher.useStorage = true;

        // when
        resultData = await oSearcher.getSearchData(DUMMY_KEYWORD);
        // then
        expect(stubGetStoredResponseData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(stubRequestSearchData.withArgs(DUMMY_KEYWORD).calledOnce);
        expect(spyCheckValidResponse.returned(true));
        expect(resultData).to.equal(fakeValidJSON);
      });
    });
  });

  /**
   * Rendering
   */
  describe('# Rendering', () => {
    /* 
    (최근검색어 템플릿)
      <li>
        <a class="search-list-item" data-index="{{index}}" data-value="{{value}}" href="#">
          {{value}}
          <button type="button" class="delete-btn"></button>
        </a>
      </li>
    */
    it('최근 검색어를 렌더링한다.', () => {
      // given
      let recentListItems = null;
      const dummyRecentKeywords = [ '최근검색어_01', '최근검색어_02' ];

      // when
      oSearcher.renderRecentList(dummyRecentKeywords);
      // then
      recentListItems = oSearcher.recentList.querySelectorAll('.search-list-item');
      expect(recentListItems.length).to.equal(dummyRecentKeywords.length);
      expect(recentListItems[0].dataset.index).to.equal('0');
      expect(recentListItems[0].dataset.value).to.equal(dummyRecentKeywords[0]);
      expect(recentListItems[0].innerText.trim()).to.equal(dummyRecentKeywords[0]);
    });

    /*
    (검색결과 템플릿)
      <li>
        <a class="search-list-item" data-index="{{index}}" data-value="{{value}}" href="#">
          {{valueWithHTML}}
        </a>
      </li>
    */
    it('검색결과를 렌더링한다.', () => {
      // given
      const DUMMY_SEARCH_KEYWORD = '검';
      const dummyResultList = [ ['검색결과_01'], ['검색결과_02'] ];
      const dummyResultJSON = [ DUMMY_SEARCH_KEYWORD, dummyResultList ];
      const dummyResultViewData = oSearcher._makeResultViewData(DUMMY_SEARCH_KEYWORD, dummyResultList);
      let resultListItems  = null;
      
      // when
      oSearcher.renderResultList(DUMMY_SEARCH_KEYWORD, dummyResultJSON);
      // then
      resultListItems = oSearcher.resultList.querySelectorAll('.search-list-item');
      expect(resultListItems.length).to.equal(dummyResultList.length);
      expect(resultListItems[0].dataset.index).to.equal('0');
      expect(resultListItems[0].dataset.value).to.equal(dummyResultList[0][0]);
      expect(resultListItems[0].innerHTML.trim()).to.equal(dummyResultViewData[0].valueWithHTML);
    });
  });

  /**
   * UI
   */
  describe('# UI', () => {
    // 인풋 벨리데이션 
    // 목록 열기 닫기
    // 목록 아이템 활성화 비활성화 

    // 데이터 조작하는 값.
    // sinon으로 넘긴 메서드.

    it('openRecentList() - 최근검색어가 없을 때, 목록이 열리지 않는다.', () => {
      // given
      const dummyRecentKeywords = [];

      const spyRenderFn = sinon.spy(oSearcher, 'renderRecentList');
      sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);
      
      // when
      oSearcher.openRecentList();
      // then
      expect(spyRenderFn.notCalled);
      expect(oSearcher.recentList.classList.contains('open')).to.be.false;
    });

    it('openRecentList() - 최근검색어가 있을 때, 목록이 열리고 마지막목록의 인덱스를 저장하고 렌더링함수를 호출한다.', () => {
      // given
      const dummyRecentKeywords = [ '최근검색어_01', '최근검색어_02', '최근검색어_03' ];
      const expectedLastIndex = dummyRecentKeywords.length - 1;

      const spyRenderFn = sinon.spy(oSearcher, 'renderRecentList');
      sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);

      // when
      oSearcher.openRecentList();
      // then
      expect(oSearcher.lastRecentIndex).to.equal(expectedLastIndex);
      expect(spyRenderFn.calledOnce);
      expect(oSearcher.recentList.classList.contains('open')).to.be.true;
    });

    it('closeRecentList() - 목록을 닫는다.', () => {
      // when
      oSearcher.closeRecentList();
      // then
      expect(oSearcher.recentList.classList.contains('open')).to.be.false;
    });
  });

  /**
   * Event (+ UI메서드 호출만 체크 / 상세 동작은 위에 / 만약 여러개가 합쳐져서 나오는 결과가 있다면 체크)
   */
  describe('# Event', () => {

    // focus,blur - input

    context('검색창에 focus이벤트가 일어날 때', () => {
      it('검색어가 비어있으면, 최근 목록이 노출된다.', () => {
        // given
        const DUMMY_CURRENT_KEYWORD = '';
        const dummyRecentKeywords = [ '최근검색어_01', '최근검색어_02', '최근검색어_03' ];
        const focusEvent = new Event('focus');
  
        sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);
        oSearcher.input.value = DUMMY_CURRENT_KEYWORD;
  
        // when
        oSearcher.input.dispatchEvent(focusEvent);
        // then
        expect(oSearcher.recentList.classList.contains('open')).to.be.true;
      });
  
      it('검색어가 비어있으나, 저장된 목록이 없을 경우 최근 목록이 노출되지 않는다.', () => {
        // given
        const DUMMY_CURRENT_KEYWORD = '테스트용 검색어';
        const dummyRecentKeywords = [];
        const focusEvent = new Event('focus');
  
        sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);
        oSearcher.input.value = DUMMY_CURRENT_KEYWORD;
  
        // when
        oSearcher.input.dispatchEvent(focusEvent);
        // then
        expect(oSearcher.recentList.classList.contains('open')).to.be.false;
      });
  
      it('검색어가 입력되어 있으면, 최근 목록이 노출되지 않는다.', () => {
        // given
        const DUMMY_CURRENT_KEYWORD = '테스트용 검색어';
        const dummyRecentKeywords = [ '최근검색어_01', '최근검색어_02', '최근검색어_03' ];
        const focusEvent = new Event('focus');
  
        sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);
        oSearcher.input.value = DUMMY_CURRENT_KEYWORD;
  
        // when
        oSearcher.input.dispatchEvent(focusEvent);
        // then
        expect(oSearcher.recentList.classList.contains('open')).to.be.false;
      });
    });

    context('검색창에 blur 이벤트가 일어날 때', () => {
      it('_resetToOriginalStatus()가 실행된다. (모든 UI상태가 초기화)', () => {
        // given
        const blurEvent = new Event('blur');
        const spyResetToOriginalStatus = sinon.spy(oSearcher, '_resetToOriginalStatus');
        oSearcher.mouseHoverOverTheList = false;
  
        // when
        oSearcher.input.dispatchEvent(blurEvent);
        // then
        expect(spyResetToOriginalStatus.calledOnce);
      });
  
      it('목록 아이템 선택(클릭)으로 인한 blur는 _resetToOriginalStatus()가 실행되지 않는다.', () => {
        // given
        const blurEvent = new Event('blur');
        const spyResetToOriginalStatus = sinon.spy(oSearcher, '_resetToOriginalStatus');
        oSearcher.mouseHoverOverTheList = true;
  
        // when
        oSearcher.input.dispatchEvent(blurEvent);
        // then
        expect(spyResetToOriginalStatus.notCalled);
      });
    });

    // input - visible keys

    context('검색창의 값이 변경될 때', () => {
      it('검색어가 입력되고 검색결과가 있으면, 결과를 렌더링하고 검색목록이 노출된다.', (done) => {
        // given
        const DUMMY_SEARCH_KEYWORD = '검';
        const dummyResultList = [ ['검색결과_01'], ['검색결과_02'] ];
        const dummyResultJSON = [ DUMMY_SEARCH_KEYWORD, dummyResultList ];
        const inputEvent = new InputEvent('input', { data: DUMMY_SEARCH_KEYWORD });
        let resultListItems  = null;

        sinon.stub(oSearcher, 'getSearchData').callsFake(() => dummyResultJSON);
        oSearcher.input.value = DUMMY_SEARCH_KEYWORD;
        
        // when
        oSearcher.input.dispatchEvent(inputEvent);
        // then
        done(); // stub하는 함수가 비동기로 실행되므로, 테스트코드가 resolve될때 실행되어야 한다.
        resultListItems = oSearcher.resultList.querySelectorAll('.search-list-item');
        expect(oSearcher.currentKeyword).to.equal(DUMMY_SEARCH_KEYWORD);
        expect(oSearcher.lastResultIndex).to.equal(dummyResultList.length - 1);
        expect(resultListItems.length).to.equal(dummyResultList.length);
        expect(oSearcher.resultList.classList.contains('open')).to.be.true;
      });
  
      it('검색어가 입력됐으나 검색결과가 없으면, 결과를 렌더링하지 않고 검색목록이 노출되지 않는다.', (done) => {
        // given
        const DUMMY_SEARCH_KEYWORD = '검';
        const dummyResultJSON = undefined;
        const inputEvent = new InputEvent('input', { data: DUMMY_SEARCH_KEYWORD });

        sinon.stub(oSearcher, 'getSearchData').callsFake(() => dummyResultJSON);
        oSearcher.input.value = DUMMY_SEARCH_KEYWORD;
        oSearcher.resultList.classList.add('open');

        // when
        oSearcher.input.dispatchEvent(inputEvent);
        // then
        done(); // (stub메서드가 비동기를 지원하지 않으므로, 테스트코드 스코프에서 비동기로 제어해야 함. done은 chai에서 제공하는 resolve역할)
        expect(oSearcher.resultList.classList.contains('open')).to.be.false;
      });

      it('검색창이 비어있으면, 검색결과를 찾지 않고 검색목록이 닫히며 최근검색어 목록이 노출된다.', () => {
        // given
        const DUMMY_SEARCH_KEYWORD = '';
        const dummyRecentKeywords = [ '최근검색어_01', '최근검색어_02', '최근검색어_03' ];
        const inputEvent = new InputEvent('input', { data: DUMMY_SEARCH_KEYWORD });

        const spyGetSearchData = sinon.spy(oSearcher, 'getSearchData');
        sinon.stub(oSearcher, '_getRecentKeywords').callsFake(() => dummyRecentKeywords);
        oSearcher.input.value = DUMMY_SEARCH_KEYWORD;
        oSearcher.resultList.classList.add('open');

        // when
        oSearcher.input.dispatchEvent(inputEvent);
        // then
        expect(spyGetSearchData.notCalled);
        expect(oSearcher.recentList.classList.contains('open')).to.be.true;
        expect(oSearcher.resultList.classList.contains('open')).to.be.false;
      });

      it('검색어가 이전 검색어와 같으면, 검색결과를 찾지 않는다.', () => {
        // given
        const DUMMY_SEARCH_KEYWORD = '검';
        const inputEvent = new InputEvent('input', { data: DUMMY_SEARCH_KEYWORD });

        const spyGetSearchData = sinon.spy(oSearcher, 'getSearchData');
        oSearcher.currentKeyword = DUMMY_SEARCH_KEYWORD;
        oSearcher.input.value = DUMMY_SEARCH_KEYWORD;
        oSearcher.resultList.classList.add('open');

        // when
        oSearcher.input.dispatchEvent(inputEvent);
        // then
        expect(spyGetSearchData.notCalled);
      });
    });

    // keydown - arrow keys

    context('검색목록이 없고 검색창에 Arrow Key가 입력되었을 때', () => {
      // given (공통)
      const KEY_ARROW_UP = 38;
      const KEY_ARROW_DOWN = 40;

      it('Up Key일 경우, arrow handle 메서드들이 실행되지 않는다', () => {
        // given
        const keydownArrowUpEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_UP });
        const spyHandleArrowUpKey = sinon.spy(oSearcher, '_handleArrowUpKey');
        const spyHandleArrowDownKey = sinon.spy(oSearcher, '_handleArrowDownKey');  
        oSearcher.lastRecentIndex = null;

        // when
        oSearcher.input.dispatchEvent(keydownArrowUpEvent);
        // then
        expect(spyHandleArrowUpKey.notCalled);
        expect(spyHandleArrowDownKey.notCalled);
      });

      it('Down Key일 경우, arrow handle 메서드들이 실행되지 않는다', () => {
        // given
        const keydownArrowDownEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_DOWN });
        const spyHandleArrowUpKey = sinon.spy(oSearcher, '_handleArrowUpKey');
        const spyHandleArrowDownKey = sinon.spy(oSearcher, '_handleArrowDownKey');  
        oSearcher.lastRecentIndex = null;

        // when
        oSearcher.input.dispatchEvent(keydownArrowDownEvent);
        // then
        expect(spyHandleArrowUpKey.notCalled);
        expect(spyHandleArrowDownKey.notCalled);
      });
    });

    context('검색목록이 있고 검색창에 Arrow Key가 입력되었을 때', () => {
      // given (공통)
      const KEY_ARROW_UP = 38;
      const KEY_ARROW_DOWN = 40;
      let searchListItems = null;

      const DUMMY_SEARCH_KEYWORD = '검';
      const dummyResultList = [ ['검색결과_01'], ['검색결과_02'], ['검색결과_03'] ];
      const dummyResultJSON = [ DUMMY_SEARCH_KEYWORD, dummyResultList ];      
      const LAST_RESULT_INDEX = dummyResultList.length - 1;

      beforeEach(() => {
        // 검색결과목록 생성
        oSearcher.lastResultIndex = LAST_RESULT_INDEX;
        oSearcher.renderResultList(DUMMY_SEARCH_KEYWORD, dummyResultJSON);
        oSearcher.openResultList();
        searchListItems = oSearcher.resultList.querySelectorAll('.search-list-item');
      });

      it('Up Key일 경우, 현재 아이템 바로 위에 있는 아이템이 선택된다. ', () => {
        // given
        const ACTIVE_ITEM_INDEX = 1;
        const expectedNextIndex = ACTIVE_ITEM_INDEX - 1;
        const keydownArrowUpEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_UP });
        oSearcher.activeResultIndex = ACTIVE_ITEM_INDEX;

        // when
        oSearcher.input.dispatchEvent(keydownArrowUpEvent);
        // then
        expect(oSearcher.activeResultIndex).to.equal(expectedNextIndex);
        expect(searchListItems[expectedNextIndex].classList.contains('on')).to.be.true;
      });

      it('Up Key일 경우, 검색창의 커서가 앞으로 이동하지 않고 검색어 뒤에서 유지된다.', () => {
        // given
        const ACTIVE_ITEM_INDEX = 1;
        const keydownArrowUpEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_UP });
    
        const spyPreventDefault = sinon.spy(keydownArrowUpEvent, 'preventDefault');
        oSearcher.activeResultIndex = ACTIVE_ITEM_INDEX;
    
        // when
        oSearcher.input.dispatchEvent(keydownArrowUpEvent);
        // then
        expect(spyPreventDefault.calledOnce);
      });

      it('Down Key일 경우, 현재 아이템 바로 아래 있는 아이템이 선택된다. ', () => {
        // given  
        const ACTIVE_ITEM_INDEX = 1;
        const expectedNextIndex = ACTIVE_ITEM_INDEX + 1;
        const keydownArrowDownEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_DOWN });
        oSearcher.activeResultIndex = ACTIVE_ITEM_INDEX;

        // when
        oSearcher.input.dispatchEvent(keydownArrowDownEvent);
        // then
        expect(oSearcher.activeResultIndex).to.equal(expectedNextIndex);
        expect(searchListItems[expectedNextIndex].classList.contains('on')).to.be.true;
      });

      it('맨 처음 아이템에서 Up Key를 누른 경우, 모든 아이템이 비활성화 된다.', () => {
        // given  
        const ACTIVE_ITEM_INDEX = 0;
        const keydownArrowUpEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_UP });
        oSearcher.activeResultIndex = ACTIVE_ITEM_INDEX;

        // when
        oSearcher.input.dispatchEvent(keydownArrowUpEvent);
        // then
        expect(oSearcher.activeResultIndex).to.equal(null);
        expect(oSearcher.resultList.querySelectorAll('on').length).to.equal(0);
      });
      
      it('맨 마지막 아이템에서 Down Key를 누른 경우, 모든 아이템이 비활성화 된다.', () => {
        // given  
        const ACTIVE_ITEM_INDEX = LAST_RESULT_INDEX;
        const keydownArrowDownEvent = new KeyboardEvent('keydown', { keyCode: KEY_ARROW_DOWN });
        oSearcher.activeResultIndex = ACTIVE_ITEM_INDEX;

        // when
        oSearcher.input.dispatchEvent(keydownArrowDownEvent);
        // then
        expect(oSearcher.activeResultIndex).to.equal(null);
        expect(oSearcher.resultList.querySelectorAll('on').length).to.equal(0);
      });
    });

    // keyup - enter key

    context('검색창에 검색어가 입력되어 있을 때 Enter Key를 누르면', () => {
      // given (공통)
      const KEY_ENTER = 13;
      const keyupEnterEvent = new KeyboardEvent('keyup', { keyCode: KEY_ENTER });
      const DUMMY_CURRENT_KEYWORD = '테스트용 검색어';

      it('검색목록에서 선택중인 목록아이템이 있을 때, 선택된 아이템이 검색창에 입력되고 목록이 닫힌다.', () => {
        // given
        const DUMMY_SELECTED_KEYWORD = '테스트용 선택된 아이템 이름';
        const fakeSelectedListItem = document.createElement('li');
        
        sinon.stub(oSearcher, '_findToActiveResultItem').callsFake(() => fakeSelectedListItem);
        const spyResetToOriginalStatus = sinon.spy(oSearcher, '_resetToOriginalStatus');
  
        oSearcher.input.value = DUMMY_CURRENT_KEYWORD;
        fakeSelectedListItem.dataset.value = DUMMY_SELECTED_KEYWORD;
        fakeSelectedListItem.classList.add('on');
  
        // when
        oSearcher.input.dispatchEvent(keyupEnterEvent);
        // then
        expect(oSearcher.input.value).to.equal(DUMMY_SELECTED_KEYWORD);
        expect(oSearcher.resultList.classList.contains('open')).to.be.false;
        expect(spyResetToOriginalStatus.calledOnce);
      });
  
      it('검색목록에서 선택중인 목록아이템이 없을 때, form submit handler가 실행되고 최근 검색어로 저장된다.', () => {
        // given
        const DUMMY_SELECTED_KEYWORD = '';
        const fakeSelectedListItem = null;
        
        sinon.stub(oSearcher, '_findToActiveResultItem').callsFake(() => fakeSelectedListItem);
        const spyStoreRecentKeyword = sinon.spy(oSearcher, '_storeRecentKeyword');
        const spySubmitForm = sinon.spy(oSearcher, 'submitForm');
  
        oSearcher.input.value = DUMMY_CURRENT_KEYWORD;
        fakeSelectedListItem.dataset.value = DUMMY_SELECTED_KEYWORD;
  
        // when
        oSearcher.input.dispatchEvent(keyupEnterEvent);
        // then
        expect(spyStoreRecentKeyword.withArgs(DUMMY_CURRENT_KEYWORD).calledOnce);
        expect(spySubmitForm.withArgs(DUMMY_CURRENT_KEYWORD).calledOnce);
        expect(oSearcher.resultList.classList.contains('open')).to.be.false;
      });
    });

    // mouse - recent list

    context.skip('최근 목록에서 mouse가', () => {
      it('움직일 때마다, 목록 아이템이 활성화 된다.', () => {
        // given 
    
        // when
    
        // then
      });

      it('빠져나갈 때, 목록 아이템이 모두 비활성화 된다.', () => {
        // given 
    
        // when
    
        // then
      });

      it('목록 아이템을 Click할 때, 선택된 아이템 값이 검색창에 입력되고 목록이 닫힌다.', () => {
        // given 
    
        // when
    
        // then
      });
    });

    // mouse - result list

    context.skip('검색결과 목록에서 mouse가', () => {
      it('움직일 때마다, 목록 아이템이 활성화 된다.', () => {
        // given 
    
        // when
    
        // then
      });
  
      it('빠져나갈 때, 목록 아이템이 모두 비활성화 된다.', () => {
        // given 
    
        // when
    
        // then
      });
  
      it('목록 아이템을 Click할 때, 선택된 아이템 값이 검색창에 입력되고 목록이 닫힌다.', () => {
        // given 
    
        // when
    
        // then
      });
    });

  });
}); // AutoCompleteSearcher