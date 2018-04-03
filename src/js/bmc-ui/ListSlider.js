'use strict';

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