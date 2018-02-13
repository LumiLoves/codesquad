'use strict';

/**
 * Gnb
 */

function Gnb($menuArr) {
  this.$menuArr = $menuArr;
}

Gnb.prototype = {
  init() {
    this.registerEvent();
  },
  registerEvent() {
    this.$menuArr.forEach((elem) => {
      elem.addEventListener('mouseenter', ({ target }) => {
        this.handleActiveMenu(target);
      });

      elem.addEventListener('mouseleave', ({ target }) => {
        this.handleInactiveMenu(target);
      });
    });
  },
  handleActiveMenu(target) {
    target.classList.add('on');
  },
  handleInactiveMenu(target) {
    target.classList.remove('on');    
  }
};


/**
 * Tab (use async)
 */

/** [ component 구조 ]
  .tab-box
    .tab-button-box
      li > a (button-items)
      li > a (button-items)
      ....

    .tab-content-group-box
      li (tab-content-group-item)
        .tab-content-box
          li > a.thumbnail-box (tab-content-item)
          li > a.thumbnail-box (tab-content-item)
          ...
      li (tab-content-group-item)
        .tab-content-box
          li > a.thumbnail-box (tab-content-item)
          ...
      ....
*/

function Tab({ $tabBox, reqUrl, templateId }) {
  this.$buttonBox = $tabBox.querySelector('.tab-button-box');
  this.$buttonItemArr = $tabBox.querySelectorAll('.tab-button-box > li');
  this.$contentGroupItemArr = $tabBox.querySelectorAll('.tab-content-group-box > li');

  this.reqUrl = reqUrl;
  this.data = null;

  this.templateId = templateId;
  this.templateHtml = '';
}

Tab.prototype = {
  init() {
    const totalLength = this.$buttonItemArr.length;
    const randomIndex = util.number.random(0, totalLength - 1);

    this.getData(() => {
      this.handleContentGroupItemToActive(randomIndex);
    });
    this.setButtonIndex();
    this.handleButtonItemToActive(randomIndex);
    this.registerButtonEvent(randomIndex);
  },

  /* instance data */

  getData(callback) {
    oAjax.getData({
      url: this.reqUrl,
      success: (resJSON) => {
        this.data = resJSON; 
        callback && callback();
      }
    });
  },

  /* rendering */

  renderContentGroupItem(index) {
    if (this.templateHtml === '') {
      this.templateHtml = oTemplate.getTemplate(this.templateId);
    }

    const $contentBoxItem = this.$contentGroupItemArr.item(index).querySelector('.tab-content-box');
    const contentItemsData = this.data[index]['items'];
    const resultHtml = oTemplate.makeHtml(this.templateHtml, contentItemsData);
  
    $contentBoxItem.innerHTML = resultHtml;
  },

  /* dom */

  setButtonIndex() {
    util.dom.setIndex(this.$buttonItemArr, 'a');  
  },
  registerButtonEvent() {
    this.$buttonBox.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target;

      if (target || target.nodeName === 'A') {
        this.handleButtonItemToActive(target.index || 0);
        this.handleContentGroupItemToActive(target.index || 0);
      }
    });
  },
  handleButtonItemToActive(i) {
    const index = i || 0;

    this.$buttonItemArr.forEach((elem) => {
      elem.classList.remove('on');    
    });
    this.$buttonItemArr.item(index).classList.add('on');
  },
  handleContentGroupItemToActive(i) {
    const index = i || 0;
    const $targetWrapper = this.$contentGroupItemArr.item(index).querySelector('.tab-content-box');  
    const notYetRendering = ($targetWrapper.innerHTML === '');

    if (notYetRendering) {
      this.renderContentGroupItem(index);
    }

    this.$contentGroupItemArr.forEach((elem) => {
      elem.classList.remove('on');    
    });
    this.$contentGroupItemArr.item(index).classList.add('on');
  }
};


/**
 * Sliding List (use async)
 */

function SlidingList($slidingListBox) {

}

SlidingList.prototype = {
  //
};
