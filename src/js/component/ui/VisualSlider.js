/**
 * VisualSlider
 */

import ParentSlider from './ParentSlider.js';
import { fadeInElem, fadeOutElem, attachIndexToDom } from './../../utility/helpers.js';

export default class VisualSlider extends ParentSlider {
  constructor({ wrapperElem, userOption = {} }) {
    super();

    // dom
    this.contentBox = wrapperElem.querySelector('.img-box');
    this.contentItems = this.contentBox.querySelectorAll('.img-item');
    this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');
    this.dotBtnBox = wrapperElem.querySelector('.dot-btn-box');
    this.dotBtnItems = this.dotBtnBox.querySelectorAll('.dot');

    // ui state data
    this.activeIndex = 0;
    this.maxIndex = this.contentItems && this.contentItems.length;      
    this.isMoving = false;

    // option
    Object.assign(this, {
      useJsAnimation: false,
      OPACITY_INTERVAL_VALUE: [ 0.08, 0.11 ]
    }, userOption);
  }

  /* init */
  
  init() {
    if (this.useJsAnimation) { this._setAnimationTypeIsJs(); }
    this.activeElements(0);
    this.registerEvents();
  }
  _setAnimationTypeIsJs() {
    this.contentBox.dataset.animationType = 'javascript';
  }

  /* ui */
  activeElements(i, isForceActive = false) {
    const oldIndex = this.activeIndex;
    const newIndex = this._calcSlideIndex(i || 0);
    if (!isForceActive && (oldIndex == newIndex)) { return; }

    this.activeIndex = newIndex;
    this._activeDotBtn(oldIndex, newIndex);
    if (this.useJsAnimation) { // ??? 매번 확인하지말고 최초에 activeContent메서드를 할당해서 고정할 수 없나?
      this._activeContentByJS(oldIndex, newIndex)
    } else {
      this._activeContent(oldIndex, newIndex);
    }
  }
  _activeDotBtn(oldIndex, newIndex) {
    this.dotBtnItems[oldIndex].classList.remove('on');
    this.dotBtnItems[newIndex].classList.add('on');  
  }
  _activeContent(oldIndex, newIndex) {
    super.activeContent(oldIndex, newIndex);
  }

  _activeContentByJS(oldIndex, newIndex) {
    this._resetAnimationCSS();
    this._fadeOut(oldIndex);
    this._fadeIn(newIndex);
  }
  _resetAnimationCSS() {
    this.contentItems.forEach((elem) => {
      elem.style.transform = 'translateX(100%)';
      elem.style.opacity = 0;
      elem.style.zIndex = -1;
    });
  }
  _fadeOut(itemIndex) {
    const target = this.contentItems[itemIndex];

    target.style.transform = 'translateX(0)';
    fadeOutElem(target, this.OPACITY_INTERVAL_VALUE[1]);
  }
  _fadeIn(itemIndex) {
    const target = this.contentItems[itemIndex];

    target.style.transform = 'translateX(0)';
    target.style.zIndex = 0;
    fadeInElem(target, this.OPACITY_INTERVAL_VALUE[0]).then(() => {
      this.isMoving = false;
    });
  }

  _isPrevBtn(target) {
    return super.isPrevBtn(target);
  }


  /* event */

  registerEvents() {
    attachIndexToDom(this.dotBtnItems);
    
    this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));

    this.dotBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.dotBtnBox.addEventListener('click', this._onClickDotBtn.bind(this));
  }
  _onClickDirectionBtn({ target }) {
    const isDirectionBtn = target.classList.contains('direction-btn');
    if (!isDirectionBtn || this.isMoving) { return; }

    const oldIndex = this.activeIndex;
    const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;
    this.activeElements(newIndex);
  }
  _onClickDotBtn({ target }) {
    const isDotBtn = target.classList.contains('dot'); 
    if (!isDotBtn || this.isMoving) { return; }

    this.activeElements(target.index);
  }
}
