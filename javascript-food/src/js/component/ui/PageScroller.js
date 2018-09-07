/**
 * PageScroller
 */

import ParentUI from './core/ParentUI.js';

export default class PageScroller extends ParentUI {
  constructor({ wrapperElem, userOption = {} }) {
    super();
    const { documentElement: docElem, body } = document;
    const SCROLL_HEIGHT = docElem.scrollHeight || body.scrollHeight || 0;
    const CLIENT_HEIGHT = docElem.clientHeight || body.clientHeight || 0;

    // dom
    this.wrapperElem = wrapperElem;
    
    // ui state data
    this.isScrolling = false;
    this.MIN_SCROLL_TOP = 0;
    this.MAX_SCROLL_TOP = SCROLL_HEIGHT - CLIENT_HEIGHT - 100; // 버퍼값 100 추가

    // option
    Object.assign(this, {
      TRIGGER_SCROLL_TOP: 150,
      INTERVAL_VALUE: 5 // 가속도 주기 위한 값
    }, userOption);
  }

  /* init */

  init() {
    this.checkToShow();
    this.registerEvent();
  }

  /* ui */

  checkToShow() {
    const haveToshow = this._haveToShow();
    (haveToshow)? this.show() : this.hide();
  }
  show() {
    this.wrapperElem.classList.add('on');
  }
  hide() {
    this.wrapperElem.classList.remove('on');
  }
  scrollUp() {
    let accumulatedDecreaseValue = 1;    
    
    const decreaseScrollTop = () => {      
      const currentScrollTop = this._getCurrentScrollTop();

      if (currentScrollTop > this.MIN_SCROLL_TOP) {
        const nextScrollTop = currentScrollTop - (accumulatedDecreaseValue += this.INTERVAL_VALUE);
        if (!this.isScrolling) { this.isScrolling = true; }
        window.scrollTo(0, nextScrollTop);
        requestAnimationFrame(decreaseScrollTop);
      } else {
        this.isScrolling = false;
        this.hide();
      }
    }
    decreaseScrollTop();
  }
  scrollDown() {
    let accumulatedIncreaseValue = 1;

    const increaseScrollTop = () => {
      const currentScrollTop = this._getCurrentScrollTop();

      if (currentScrollTop < this.MAX_SCROLL_TOP) {
        const nextScrollTop = currentScrollTop + (accumulatedIncreaseValue += this.INTERVAL_VALUE);
        if (!this.isScrolling) { this.isScrolling = true; }        
        window.scrollTo(0, nextScrollTop);
        requestAnimationFrame(increaseScrollTop);
      } else {
        this.isScrolling = false;        
      }
    }
    increaseScrollTop();
  }
  _haveToShow() {
    const currentScrollTop = this._getCurrentScrollTop();
    return this.TRIGGER_SCROLL_TOP < currentScrollTop;
  }
  _getCurrentScrollTop() {
    return document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  /* event */

  registerEvent() {
    window.addEventListener('scroll', (e) => this._onScroll(e));
    this.wrapperElem.addEventListener('click', (e) => e.preventDefault());
    this.wrapperElem.addEventListener('click', (e) => this._onClickBtn(e));
  }
  _onClickBtn({ target: { classList: targetClassList } }) {
    const isScrollBtn = targetClassList.contains('scroll-btn');
    if (!isScrollBtn || this.isScrolling) { return; }

    const isUpBtn = targetClassList.contains('up');
    const isDownBtn = targetClassList.contains('down');

    isUpBtn && this.scrollUp();
    isDownBtn && this.scrollDown();
  }
  _onScroll() {
    if (this.isScrolling) { return; }
    this.checkToShow();
  }
}