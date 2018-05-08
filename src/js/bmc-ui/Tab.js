'use strict';

/**
 * Tab
 */

class Tab {
  constructor({ wrapperElem, dom, reqUrlItemAll }) {
    this.dom = dom;
    this._bindElemProps(wrapperElem);
    this._bindUIProps();
    this.reqUrlItemAll = reqUrlItemAll;
    this.resJSON = null;

    // this.init();
  }

  /* data */

  _bindElemProps(wrapperElem) {
    this.wrapperElem = wrapperElem;
    this.contentBox = wrapperElem.querySelector('.tab-content-group-box');
    this.contentItems = wrapperElem.querySelectorAll('.tab-content-group-box > li');
    this.btnBox = wrapperElem.querySelector('.tab-btn-box');
    this.btnItems = wrapperElem.querySelectorAll('.tab-btn-box > li');
  }
  _bindUIProps() {
    this.activeIndex = 0;
  }
  _updateActiveIndexProp(i = 0) {
    this.activeIndex = i;
  }

  /* render */

  _remodelRenderData(renderData) {
    return renderData.reduce((accumulator, currentObject) => {
      const itemStartOrder = 0;
      const itemEndOrder = 2;

      currentObject.items[itemStartOrder].isGroupStart = true;
      currentObject.items[itemEndOrder].isGroupEnd = true;
      return accumulator.concat(currentObject.items);
    }, []);
  }
  _bindPropsAfterRender() {
    this.contentItems = this.wrapperElem.querySelectorAll('.tab-content-group-box > li');
    this.maxIndex = this.contentItems.length;
  }

  /* init */

  async init() { // 생성 시 호출할 내부 메서드를 모아놓는 곳
    const needTemplateRendering = !this.contentItems.length;
    const hasTemplateRenderer = (typeof this.renderer === 'object');
    const randomIndex = this._getRandomIndex();

    if (needTemplateRendering && hasTemplateRenderer) {
      this.resJSON = await this._getRequestData(this.reqUrlItemAll);
      this._renderItemAll();
      this._bindPropsAfterRender();
    }
    this.activeElements(randomIndex, true);
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

  activeElements(newIndex, isForceActive = false) {
    const oldIndex = this.activeIndex;
    if (!isForceActive && (oldIndex == newIndex)) { return; }

    this._updateActiveIndexProp(newIndex);
    this._activeBtn(oldIndex, newIndex);
    this._activeContent(oldIndex, newIndex);
  }
  _activeBtn(oldIndex, newIndex = 0) {
    // const index = newIndex || 0;

    this.btnItems.item(oldIndex).classList.remove('on');
    this.btnItems.item(newIndex).classList.add('on');
  }
  _activeContent(oldIndex, newIndex = 0) {
    // const index = newIndex || 0;

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
    this.dom.setIndex(this.btnItems, 'a');
    this.btnBox.addEventListener('click', (e) => e.preventDefault());
    this.btnBox.addEventListener('click', this._onClickBtn.bind(this));
  }
  _onClickBtn({ target }) {
    if (target && target.nodeName === 'A') { this.activeElements(target.index); }
  }
}
