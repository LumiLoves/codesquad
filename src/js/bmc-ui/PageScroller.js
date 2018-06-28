'use strict';

/**
 * PageScroller
 */

class PageScroller extends ParentUI {
  constructor({ wrapperElem, userOption = {} }) {
    super();

    // dom
    this.wrapperElem = wrapperElem;
    
    // ui state data
    this.START_SCROLL_POSITION = 0;
    this.END_SCROLL_POSITION = document.scrollingElement.offsetHeight - window.innerHeight;

    // option
    this.TRIGGER_POSITION = userOption.TRIGGER_POSITION || 150;
    this.INTERVAL_VALUE = userOption.INTERVAL_VALUE || 5; // 가속도 주기 위한 값
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
    let accumulatedDecreaseValue = 1;

    const decreasePosition = () => {
      const currentPosition = window.scrollY;
      const nextPosition = currentPosition - (accumulatedDecreaseValue += this.INTERVAL_VALUE);

      if (currentPosition > this.START_SCROLL_POSITION) {
        window.scrollTo(0, nextPosition);
        requestAnimationFrame(decreasePosition);
      }
    }
    decreasePosition();
  }
  scrollDown() {
    let accumulatedIncreaseValue = 1;

    const increasePosition = () => {
      const currentPosition = window.scrollY;
      const nextPosition = currentPosition + (accumulatedIncreaseValue += this.INTERVAL_VALUE);

      if (nextPosition < this.END_SCROLL_POSITION) {
        window.scrollTo(0, nextPosition);
        requestAnimationFrame(increasePosition);
      }
    }
    increasePosition();
  }
  _needToShow() {
    const currentPosition = window.scrollY;
    return this.TRIGGER_POSITION < currentPosition;
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


