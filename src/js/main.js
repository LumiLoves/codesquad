// es6 문법 쓰기.
// let, const 
// () => { }
// object shorthands
// prototype 으로 패턴 써보기

'use strict';

// DOM
const $gnbMenuArr = document.querySelectorAll('#gnb .menu > li');

// Data
const actionUrl = {
  bestDish: '/woowa/best',
  mainDish: '/woowa/main',
  course: '/woowa/course',
  soup: '/woowa/soup',
  sideDish: '/woowa/side'
};

// Class
const oGnb = new Gnb($gnbMenuArr); // TODO 생각해보기. 전역변수로 빼도 괜찮다고 하심.
const oAjax = new Ajax();


/**
 * Gnb
 */
// TODO Gnb 이름 더 구체적으로?!
function Gnb($menuArr) {
  this.$menuArr = $menuArr;
}

// TODO 델리게이션으로 구현
Gnb.prototype = {
  init() {
    this.registerEvent();
  },
  registerEvent() {
    this.$menuArr.forEach((elem) => {
      elem.addEventListener('mouseenter', ({ target }) => {
        this.handleActiveMenu(target);
      });

      elem.addEventListener('mouseleave', ({ target }) => {
        this.handleInactiveMenu(target);
      });
    });
  },
  handleActiveMenu(target) {
    target.classList.add('on');
  },
  handleInactiveMenu(target) {
    target.classList.remove('on');    
  }
};


/**
 * Asynchronous Tab
 */
/** [설계]
 *- init 시 랜덤으로 메뉴 선택되어져 보여진다. @
 *- showTab
 *  - ajax로 json 가져와 저장
 *  - json을 돌면서 html 만듦
 *    - 버튼박스 만듦
 *    - 리스트박스 만듦
 *  - appendHtml
 * 
 *- getHtmlButtonItem
 *- getHtmlListItem
 *- getHtmlThumbnail
 *
 *- registerEvent
 *  - 리스트버튼 클릭 시
 *    - 이미 불러온 적이 있는지 확인
 *    - showTab(index) 실행
 */
function AsynchronousTab($tabBox) {
  // this.$tabBox = $tabBox;
  this.$tabButtonBox = $tabBox.querySelector('.tab-button-box');
  this.$tabListBox = $tabBox.querySelector('.tab-list-box');
  this.template = {
    buttonItem: '',
    listItem: '',
    thumbnail: ''
  };
}

AsynchronousTab.prototype = {
  init() {
    const randomIndex = getRandomMenuIndex();

    this.showTab(randomIndex);
    this.registerEvent();
  },
  registerEvent() {
    this.$tabButtonBox.addEventListener('click', ({ target }) => {
      // target
    });
  },
  getRandomMenuIndex() {
    const menuLength = this.$tabButtonBox.length;
    return Math.floor(Math.random() * (menuLength - 1));
  },
  showTab(index) {
    const resJSON = oAjax.getData();
    const html = this.makeHtml(resJSON);
    // ajax
    // makeHtml
    // appendHtml
  },

  // Html
  makeHtml(json) {
    const html = '';
    // getHtmlButtonItem 반복
    // getHtmlListItem 반복
    return html;
  },
  getHtmlButtonItem() {

  },
  getHtmlListItem() {

  },
  appendHtml(insertTarget) {

  }
};


/**
 * Asynchronous Sliding List
 */
function SlidingList($slidingListBox) {

}

SlidingList.prototype = {

};


/**
 * Ajax
 */
function Ajax() {
  // something ...
}

Ajax.prototype = {
  isSuccess(readyState, status) {
    return (readyState === 4 && status === 200);
  },
  getData(option) {
    // 사용하는 입장에서 고민해보기.
    // option : url, data, callback
    // contentType(json, form) or isForm (default: JSON)
    const xhr = new XMLHttpRequest();

    xhr.open('GET', option.url);
    xhr.onreadystatechange = () => {
      if (this.isSuccess(xhr.readyState, xhr.status)) {
        option.callback && option.callback(xhr);
      }
    };
    xhr.send(null);
  },
  postJSON(url, data, callback) {
    const xhr = new XMLHttpRequest();
    const data = JSON.stringify(data);

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {

    };
    xhr.send(data);
  },
  makeData() {

  },
  encodeFormData() {

  },
  handleDefaultSuccess() {

  },
  handleDefaultError() {
    // 디폴트 응답 콜백 핸들러 모음?!
  },
  getData() {
    // 자바스크립트의 비동기 종류? : 사용자이벤트, xhr이벤트, promise, async, injection??

    // 동기로 작동하려면? 
    // request를 onreadystatechange 같은 걸 안쓰면 동기로 동작하므로 안좋다?
    // 이게 아니라 플래그로 작동하는 듯. false동기로 하면 
    // 이때는 이벤트 핸들러를 사용할 필요 없이, send()메서드 실행이 종료된 후 xhr프로퍼티 확인.
    // 가능하면 사용하지 말것. 이유?
    // - 클라이언트 측 자바스크립트는 싱글스래드(single thread)이기 때문에
    // - send()메서드는 보통 요청을 완료할 때까지 전체적인 브라우저의 UI를 중단시켜 잠시 사용불가상태로 만듦.
    // - 요청이 연결된 서버의 응답속도가 느릴수록, 사용자의 브라우저는 자주 얼어버릴(freeze) 것이다.


    const xhr = new XMLHttpRequest();
    // 순서 : 요청 방식 + url, 요청헤더, 요청 본문    

    // xhr.addEventListener('load', () => {
    //   console.log(arguments, this.responseText);
    // });

    xhr.open('GET', 'url'); // xhr.open('GET', 'url', false); 3번째인자. 비동기처리 여부.
    // get + form일 경우, url + '?' + encodeFormData(data)
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    // MIME-TYPE. 보내는 데이터 타입
    //  'text/plain', 'text/html', 'text/css', 'text/javascript'
    //  'application/json'
    //  'application/x-www-form-urlencoded': (q=pizza&startDate=190380&endDate=930290)
    xhr.onreadystatechange = () => {
      // if (xhr.readyState === 4 && xhr.status === 200)
      if (xhr.readyState !== 4) { return; } // 완료되지 않은 요청결과는 무시.
      if (xhr.status === 200) {
        // xhr.readyState
        // 0 : UNSENT . open()메서드가 아직 호출되지 않았다.
        // 1 : OPENED . open()메서드가 호출되었다.
        // 2 : HEADERS_RECEIVED . HTTP헤더를 전송받았다.
        // 3 : LOADING . 응답본문을 전송받는 중이다.
        // 4 : DONE . 응답이 완료되었다.

        // 응답 헤더 정보
        // xhr.getAllResponseHeader();
        const type = xhr.getResponseHeader('Content-Type');
        const size = xhr.getResponseHeader('Content-Length');
        const date = xhr.getResponseHeader('Last-Modified');
   
        // 응답 데이터
        if (type.match(/^text/)) { // 응답이 텍스트형태인지 확인후, 콜백으로 전달한다.
          callback && callback(xhr.responseText);
        } else if (type === 'application/json') {
          callback && callback(JSON.parse(xhr.responseText));
        } else {
          throw new Error('응답은 텍스트 또는 제이슨 형태여야 합니다. 현재 상태: ' + type);
        }

        // return xhr.responseText;

      } else {
        // 에러정보
        // xhr.status
        // xhr.statusText
      }

      // 에러 핸들링 다른 방법
      if (xhr.status !== 200) { throw new Error(xhr.statusText); }
    };
    xhr.send(null); // get 요청은 본문을 가질 수 없으므로, send() 메서드의 인자를 null로 지정하거나 생략해야 한다.
    // 대부분의 post 요청은 본문을 포함하며, 해당 본문은 Content-Type 형식과 같아야 한다.
    // xhr.send(encodeFormData(data));
  }
};


/**
 * Html
 */
function Html() {

}

Html.prototype = {
  getHtmlThumbnail() {

  }
};


/**
 * BMC (배민찬)
 */
const BMC = {
  init() {
    oGnb.init();
  }
};

BMC.init();



