'use strict';

/**
 * ListSlider
 */

class ListSlider extends Slider {
  constructor({ wrapperElem, dom, itemCountPerGroup, reqUrlItemAll }) {
    super();

    this.dom = dom;
    this._bindElemProps(wrapperElem);
    this._bindUIProps();
    this.itemCountPerGroup = itemCountPerGroup;
    this.reqUrlItemAll = reqUrlItemAll;
    this.resJSON = null;

    // this.init();
  }

  /* data */

  _bindElemProps(wrapperElem) {
    this.wrapperElem = wrapperElem;
    this.contentBox = wrapperElem.querySelector('.content-group'); // TODO 다른데도 바꾸기.
    this.contentItems = wrapperElem.querySelectorAll('.content-group > li');
    this.directionBtnBox = wrapperElem.querySelector('.direction-btn-box');          
  }
  _bindUIProps() {
    this.maxIndex = this.contentItems && this.contentItems.length;      
  }

  /* render */

  _remodelRenderData(originData) {
    // 삭제예정) 그룹이 3개 이하 (1,2개)로는 동작이 고장나서 일단 갯수를 4개로 늘려놓음.
    let resultData = [...originData, ...originData];
    resultData = JSON.parse(JSON.stringify(resultData));
    // resultData.pop();
    // resultData.pop();

    const itemStartOrder = 0;
    const itemEndOrder = this.itemCountPerGroup - 1;
    const lastItemIndex = resultData.length - 1;

    resultData.forEach((data, i) => {
      const itemOrder = (i + this.itemCountPerGroup) % this.itemCountPerGroup;
      if (itemOrder === itemStartOrder) { resultData[i].isGroupStart = true; }
      if ((itemOrder === itemEndOrder) || (i === lastItemIndex)) { resultData[i].isGroupEnd = true; }
    });

    return resultData;
  }
  _bindPropsAfterRender() {
    this.contentItems = this.wrapperElem.querySelectorAll('.content-group > li');
    this.maxIndex = this.contentItems.length;
  }

  /* init */

  async init() {
    const needTemplateRendering = !this.contentItems.length;
    const hasTemplateRenderer = (typeof this.renderer === 'object');

    if (needTemplateRendering && hasTemplateRenderer) {
      this.resJSON = await this._getRequestData(this.reqUrlItemAll);
      this._renderItemAll();
      this._bindPropsAfterRender();
    }
    this.activeElements(0, true);
    this.registerEvents();
  }
  _renderItemAll() {
    const data = this.resJSON;

    this.renderer.renderDOM({
      data: data,
      appendFn: (resultHTML) => { this.contentBox.innerHTML = resultHTML; }
    });
  }
  // 공통
  async _getRequestData(reqUrl) {
    const res = await fetch(reqUrl);
    let resJSON = await res.json();
    if (typeof this._remodelRenderData === 'function') {
      resJSON = this._remodelRenderData(resJSON);
    }
    return resJSON;
  }
  // 공통
  addModule(name, value) {
    const hasModule = !!this[name];
    if (hasModule) { return false; }
    this[name] = value;
    return true;
  }

  /* ui */

  activeElements(i, isForceActive = false) {
    const oldIndex = this.activeIndex;      
    const newIndex = this._calcSlideIndex(i || 0);
    if (!isForceActive && (oldIndex == newIndex)) { return; }

    this._updateActiveIndexProp(newIndex);
    this._activeContent(oldIndex, newIndex);
  }

  /* event */
  
  registerEvents() {
    this.dom.setIndex(this.contentItems);    
    this.directionBtnBox.addEventListener('click', (e) => e.preventDefault());
    this.directionBtnBox.addEventListener('click', this._onClickDirectionBtn.bind(this));
  }
  _onClickDirectionBtn({ target }) {
    const oldIndex = this.activeIndex;
    const newIndex = (this._isPrevBtn(target))? oldIndex - 1 : oldIndex + 1;

    if (target && target.nodeName === 'A' || target.nodeName === 'I') {
      this._updateDirection();
      this.activeElements(newIndex);
    }
  }
}