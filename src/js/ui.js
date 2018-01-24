'use strict';

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