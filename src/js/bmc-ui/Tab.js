'use strict';

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
