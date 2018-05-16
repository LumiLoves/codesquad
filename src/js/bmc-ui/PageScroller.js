'use strict';

/**
 * PageScroller
 */

class PageScroller extends UI {
  constructor({ wrapperElem, startPositionForDisplay = 150 }) {
    super();
    this._bindElemProps(wrapperElem);
    this._bindUIProps();
    this.startPositionForDisplay = startPositionForDisplay;
  }

  /* data */

  _bindElemProps(wrapperElem) {
    this.wrapperElem = wrapperElem;
  }
  _bindUIProps() {
    this.docHeight = document.scrollingElement.offsetHeight;
  }

  /* init */

  init() {
    this.activeElements();
    this.registerEvent();
  }

  /* ui */

  activeElements() {
    const needToshow = this._needToShow();
    (needToshow)? this.show() : this.hide();
  }
  show() {
    this.wrapperElem.classList.add('on');
  }
  hide() {
    this.wrapperElem.classList.remove('on');
  }
  scrollUp() {
    const SCROLL_START_POSITION = 0;
    const INTERVAL_VALUE = 5; // 가속도 주기 위한 값
    let decreaseValue = 1;

    function decrease() {
      const currentScrollY = window.scrollY;
      const nextScrollY = currentScrollY - (decreaseValue += INTERVAL_VALUE);

      if (currentScrollY > SCROLL_START_POSITION) {
        window.scrollTo(0, nextScrollY);
        requestAnimationFrame(decrease);
      }
    }
    decrease();
  }
  scrollDown() {
    const SCROLL_END_POSITION = this.docHeight - window.innerHeight;
    const INTERVAL_VALUE = 5; // 가속도 주기 위한 값
    let increaseValue = 1;

    function increase() {
      const currentScrollY = window.scrollY;
      const nextScrollY = currentScrollY + (increaseValue += INTERVAL_VALUE);

      if (nextScrollY < SCROLL_END_POSITION) {
        window.scrollTo(0, nextScrollY);
        requestAnimationFrame(increase);
      }
    }
    increase();
  }
  _needToShow() {
    const currentPosition = window.scrollY;
    return this.startPositionForDisplay < currentPosition;
  }

  /* event */

  registerEvent() {
    window.addEventListener('scroll', this._onScroll.bind(this));
    this.wrapperElem.addEventListener('click', (e) => e.preventDefault());
    this.wrapperElem.addEventListener('click', this._onClickBtn.bind(this));
  }
  _onClickBtn({ target }) {
    if (target.nodeName !== 'BUTTON') { return; }
    const isUpBtn = target.classList.contains('up');
    const isDownBtn = target.classList.contains('down');

    isUpBtn && this.scrollUp();
    isDownBtn && this.scrollDown();
  }
  _onScroll(event) {
    this.activeElements();
  }
}


