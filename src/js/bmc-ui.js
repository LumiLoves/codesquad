'use strict';

const BmcUI = (function() {

  /**
   * Renderer
   */

  class Renderer {
    constructor({ ajax, template, reqUrl, templateHTML }) {
      this.ajax = ajax;
      this.template = template;

      this.url = reqUrl;
      this.data = null;
      this.templateHTML = templateHTML;
    }
    renderUI({ wrapper, handleData, callback }) {
      this._requestData((res) => {
        if (typeof handleData === 'function') {
          const resultData = handleData(this.data);
          this._updateData(resultData);
        }
        this._makeHTML(wrapper);
        callback && callback();
      });
    }
    _requestData(success) {
      this.ajax.getData({
        url: this.url,
        success: (res) => {
          this._updateData(res);
          (typeof success === 'function') && success(res);
        }
      });
    }
    _updateData(data) {
      this.data = data;
    }
    _makeHTML(wrapper) {
      this.template.makeHTML({
        templateHTML: this.templateHTML,
        dataArr: this.data,
        append: (result) => (wrapper.innerHTML = result)
      });
    }
  }


  /**
   * Tab
   */

  class Tab {
    constructor({ wrapperElem, renderer, dom }) {
      const needRendering = !!renderer;

      this.dom = dom;
      this.renderer = renderer;
      this._createElementsData(wrapperElem);
      this._createUIData();

      (needRendering)? this.render() : this.init();
    }

    /* data */
    
    _createElementsData(wrapperElem) {
      this.wrapperElem = wrapperElem;
      this.contentBox = wrapperElem.querySelector('.tab-content-group-box');
      this.contentItems = wrapperElem.querySelectorAll('.tab-content-group-box > li');
      this.btnBox = wrapperElem.querySelector('.tab-btn-box');
      this.btnItems = wrapperElem.querySelectorAll('.tab-btn-box > li');
    }
    _createUIData() {
      this.activeIndex = 0;
    }
    _updateActiveIndexData(i) {
      this.activeIndex = i || 0;
    }

    /* render */

    _handleRenderData(renderData) {
      return renderData.reduce((accumulator, currentObject) => {
        currentObject.items[0].isGroupStart = true;
        currentObject.items[2].isGroupEnd = true;
        return accumulator.concat(currentObject.items);
      }, []);
    }
    _updateRenderElemData() {
      this.contentItems = this.wrapperElem.querySelectorAll('.tab-content-group-box > li');
      this.maxIndex = this.contentItems.length;
    }

    /* init */

    render() {
      this.renderer.renderUI({
        wrapper: this.contentBox,
        handleData: this._handleRenderData,
        callback: () => {
          this._updateRenderElemData();
          this.init();
        }
      });
    }
    init() { // 생성 시 호출할 내부 메서드를 모아놓는 곳
      const randomIndex = this._getRandomIndex();
      this.activeElements(randomIndex, true);
      this.registerEvents();
    }

    /* ui */
    activeElements(newIndex, isForceActive = false) {
      const oldIndex = this.activeIndex;
      if (!isForceActive && (oldIndex == newIndex)) { return; }

      this._updateActiveIndexData(newIndex);
      this._activeBtn(oldIndex, newIndex);
      this._activeContent(oldIndex, newIndex);
    }
    _activeBtn(oldIndex, newIndex) {
      const index = newIndex || 0;

      this.btnItems.item(oldIndex).classList.remove('on');
      this.btnItems.item(newIndex).classList.add('on');
    }
    _activeContent(oldIndex, newIndex) {
      const index = newIndex || 0;
  
      this.contentItems.item(oldIndex).classList.remove('on');
      this.contentItems.item(newIndex).classList.add('on');      
    }
    _getRandomIndex() {
      const min = 0;
      const max = this.btnItems.length - 1;
      return min + Math.floor(Math.random() * (max + 1));
    }

    /* event */

    registerEvents() {
      this._injectBtnsIndex();
      this.btnBox.addEventListener('click', (e) => e.preventDefault());
      this.btnBox.addEventListener('click', this._onClickBtn.bind(this));
    }
    _injectBtnsIndex() {
      this.dom.setIndex(this.btnItems, 'a');
    }
    _onClickBtn({ target }) {
      if (target && target.nodeName === 'A') { this.activeElements(target.index); }
    }
  }


  /**
   * Slider
   */

  class Slider {
    constructor() {
      this.activeIndex = 0;
    }

    /* data */

    _updateActiveIndexData(i) {
      this.activeIndex = i || 0;
    }

    /* ui */

    _activeContent(oldIndex, newIndex) {
      const oldIndexSet = this._calcSlideIndexSet(oldIndex);
      const newIndexSet = this._calcSlideIndexSet(newIndex);

      this._removeDirectionClass(oldIndexSet);      
      this._addDirectionClass(newIndexSet);
    }
    _calcSlideIndex(i) {
      return (this.maxIndex + i) % this.maxIndex;
    }
    _calcSlideIndexSet(i) {
      return {
        prev: this._calcSlideIndex(i - 1),
        current: this._calcSlideIndex(i),
        next: this._calcSlideIndex(i + 1)
      }
    }
    _removeDirectionClass(indexSet) {
      this.contentItems.item(indexSet.prev).classList.remove('prev');
      this.contentItems.item(indexSet.current).classList.remove('current');
      this.contentItems.item(indexSet.next).classList.remove('next');
    }
    _addDirectionClass(indexSet) {
      this.contentItems.item(indexSet.prev).classList.add('prev');
      this.contentItems.item(indexSet.current).classList.add('current');
      this.contentItems.item(indexSet.next).classList.add('next');
    }

    /* event */

    _isPrevBtn(elem) {
      return elem.classList.contains('prev');
    }
    _isNextBtn(elem) {
      return elem.classList.contains('next');
    }
  }

  /**
   * VisualSlider
   */
  class VisualSlider extends Slider {
    constructor({ wrapperElem, dom, animation, useJsAnimation }) {
      super();

      this.dom = dom;
      this.animation = animation;
      this.useJsAnimation = useJsAnimation;
      this._createElementsData(wrapperElem);
      this._createUIData();

      this.init();
    }

    /* data */

    _createElementsData(wrapperElem) {
      this.contentBox = wrapperElem.querySelector('.img-box');
      this.contentItems = this.contentBox.querySelectorAll('.img-item');
      this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');
      this.dotBtnBox = wrapperElem.querySelector('.dot-btn-box');
      this.dotBtnItems = this.dotBtnBox.querySelectorAll('a');
    }
    _createUIData() {
      this.maxIndex = this.contentItems && this.contentItems.length;      
    }
    _changeContentBoxDatasetAnimationTypeIsJs() {
      this.contentBox.dataset.animationType = 'javascript';
    }
    
    /* init */
    
    init() {
      if (this.useJsAnimation) this._changeContentBoxDatasetAnimationTypeIsJs();
      this.activeElements(0);
      this.registerEvents();
    }

    /* ui */
    
    activeElements(i, isForceActive = false) {
      const oldIndex = this.activeIndex;
      const newIndex = this._calcSlideIndex(i || 0);
      if (!isForceActive && (oldIndex == newIndex)) { return; }
 
      this._updateActiveIndexData(newIndex);
      this._activeDotBtn(oldIndex, newIndex);
      if (this.useJsAnimation) { // ??? 매번 확인하지말고 최초에 activeContent메서드를 할당해서 고정할 수 없나?
        this._activeContentByJS(oldIndex, newIndex)
      } else {
        this._activeContent(oldIndex, newIndex);
      }
    }
    _activeDotBtn(oldIndex, newIndex) {
      this.dotBtnItems.item(oldIndex).classList.remove('on');
      this.dotBtnItems.item(newIndex).classList.add('on');  
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
    _fadeOut(i) {
      const OPACITY_INTERVAL_VALUE = 0.11;
      const target = this.contentItems.item(i);

      target.style.transform = 'translateX(0)';
      this.animation.fadeOut(target, OPACITY_INTERVAL_VALUE);
    }
    _fadeIn(i) {
      const OPACITY_INTERVAL_VALUE = 0.08;
      const target = this.contentItems.item(i);

      target.style.transform = 'translateX(0)';
      target.style.zIndex = 0;
      this.animation.fadeIn(target, OPACITY_INTERVAL_VALUE);
    }
 
    /* event */
    
    registerEvents() {
      this._injectContentsIndex();
      this._injectDotBtnsIndex();
 
      this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
      this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));

      this.dotBtnBox.addEventListener('click', (e) => e.preventDefault());
      this.dotBtnBox.addEventListener('click', this._onClickDotBtn.bind(this));
    }
    _injectContentsIndex() {
      this.dom.setIndex(this.contentItems);    
    }
    _injectDotBtnsIndex() {
      this.dom.setIndex(this.dotBtnItems);
    }
    _onClickDirectionBtn({ target }) {
      const oldIndex = this.activeIndex;
      const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;

      if (target && target.nodeName === 'A') { this.activeElements(newIndex); }
    }
    _onClickDotBtn({ target }) {
      if (target && target.nodeName === 'A') { this.activeElements(target.index); }
    }
  }



  /**
   * ListSlider
   */

  class ListSlider extends Slider {
    constructor({ wrapperElem, renderer, dom }) {
      const needRendering = !!renderer;
      super();

      this.dom = dom;
      this.renderer = renderer;
      this._createElementsData(wrapperElem);
      this._createUIData();

      (needRendering)? this.render() : this.init();
    }

    /* data */

    _createElementsData(wrapperElem) {
      this.wrapperElem = wrapperElem;
      this.contentBox = wrapperElem.querySelector('.content-group'); // TODO 다른데도 바꾸기.
      this.contentItems = wrapperElem.querySelectorAll('.content-group > li');
      this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');          
    }
    _createUIData() {
      this.maxIndex = this.contentItems && this.contentItems.length;      
    }

    /* render */

    _handleRenderData(originData) {
      const numberOfGroups = 4;
      const groupStartIndex = 0;
      const groupEndIndex = numberOfGroups - 1;
      let resultData = originData;

      resultData.forEach((data, i) => {
        const groupIndex = (i + numberOfGroups) % numberOfGroups;
        if (groupIndex === groupStartIndex) { resultData[i].isGroupStart = true; }
        if (groupIndex === groupEndIndex) { resultData[i].isGroupEnd = true; }  
      });

      // 삭제예정) 3개 이하 (1,2개)로는 동작이 고장나서 일단 갯수를 4개로 늘려놓음.
      resultData = resultData.concat(resultData);

      return resultData;
    }
    _updateRenderElemData() {
      this.contentItems = this.wrapperElem.querySelectorAll('.content-group > li');
      this.maxIndex = this.contentItems.length;
    }

    /* init */
    
    render() {
      this.renderer.renderUI({
        wrapper: this.contentBox,
        handleData: this._handleRenderData,
        callback: () => {
          this._updateRenderElemData();
          this.init();
        }
      });
    }
    init() {
      this.activeElements(0, true);
      this.registerEvents();
    }

    /* ui */

    activeElements(i, isForceActive = false) {
      const oldIndex = this.activeIndex;      
      const newIndex = this._calcSlideIndex(i || 0);
      if (!isForceActive && (oldIndex == newIndex)) { return; }

      this._updateActiveIndexData(newIndex);
      this._activeContent(oldIndex, newIndex);
    }

    /* event */
    
    registerEvents() {
      this._injectContentsIndex();
      this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
      this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));
    }
    _injectContentsIndex() {
      this.dom.setIndex(this.contentItems);
    }
    _onClickDirectionBtn({ target }) {
      const oldIndex = this.activeIndex;
      const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;

      if (target && target.nodeName === 'A' || target.nodeName === 'I') { this.activeElements(newIndex); }
    }
  }

  return {
    Renderer,
    Tab,
    VisualSlider,
    ListSlider
  }
})();





