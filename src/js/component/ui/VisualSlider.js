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

    this._activeContent = (this.useJsAnimation)? this._activeContentByJS : this._activeContentByCSS;
  }

  /* init */
  
  init() {
    if (this.useJsAnimation) { this._setAnimationTypeIsJs(); }    
    this._resetContentByJS(0);
    this.registerEvents();
  }
  _setAnimationTypeIsJs() {
    this.contentBox.dataset.animationType = 'javascript';
  }

  /* ui */
  activeElements(index) {
    const oldIndex = this.activeIndex;
    const newIndex = this._calcSlideIndex(index || 0);
    if (oldIndex == newIndex) { return; }

    this.activeIndex = newIndex;
    this._activeDotBtn(oldIndex, newIndex);
    this._activeContent(oldIndex, newIndex);
  }
  _activeDotBtn(oldIndex, newIndex) {
    this.dotBtnItems[oldIndex].classList.remove('on');
    this.dotBtnItems[newIndex].classList.add('on');  
  }
  _activeContentByCSS(oldIndex, newIndex) {
    super.activeContent(oldIndex, newIndex);
  }

  _activeContentByJS(oldIndex, newIndex) {
    this._resetContentByJS();
    this._fadeOut(oldIndex);
    this._fadeIn(newIndex);
  }
  _resetContentByJS(index) {
    this.contentItems.forEach((elem) => {
      elem.style.transform = 'translateX(100%)';
      elem.style.opacity = 0;
      elem.style.zIndex = -1;
    });

    if (!isNaN(index)) {
      const target = this.contentItems[index];
      target.style.transform = 'translateX(0px)';
      target.style.opacity = 1;
      target.style.zIndex = 0;
    }
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
    this.directionBtnBox.addEventListener('click', (e) => this._onClickDirectionBtn(e));

    this.dotBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.dotBtnBox.addEventListener('click', (e) => this._onClickDotBtn(e));
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
