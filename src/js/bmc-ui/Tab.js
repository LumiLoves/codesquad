'use strict';

/**
 * Tab
 */

class Tab {
  constructor({ wrapperElem, renderer, dom }) {
    this.dom = dom;
    this.renderer = renderer;
    this._bindElemProps(wrapperElem);
    this._bindUIProps();

    this.init();
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
    const needClientSideRendering = !this.contentItems.length;
    const randomIndex = this._getRandomIndex();

    if (needClientSideRendering) {
      await this._render();
      this._bindPropsAfterRender();
    }
    this.activeElements(randomIndex, true);
    this.registerEvents();
  }
  async _render() {
    await this.renderer.renderUI({
      wrapper: this.contentBox,
      remodelData: this._remodelRenderData.bind(this)
    });
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
