'use strict';

/**
 * BmcTab (use async)
 */

/** [ component 구조 ]
  .tab-box
    .tab-btn-box
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

function BmcTab({ $tabBox, reqUrl, templateId }) {
  this.$buttonBox = $tabBox.querySelector('.tab-btn-box');
  this.$buttonItemArr = $tabBox.querySelectorAll('.tab-btn-box > li');
  this.$contentGroupItemArr = $tabBox.querySelectorAll('.tab-content-group-box > li');

  this.reqUrl = reqUrl;
  this.data = null;

  this.templateId = templateId;
  this.templateHtml = '';
}

BmcTab.prototype = {
  init() {
    const totalLength = this.$buttonItemArr.length;
    const randomIndex = LUMI.util.number.random(0, totalLength - 1);

    LUMI.ajax.getData({
      url: this.reqUrl,
      success: (resJSON) => {
        this.data = resJSON; 
        this.handleContentGroupItemToActive(randomIndex);
      }
    });
    this.setButtonIndex();
    this.handleButtonItemToActive(randomIndex);
    this.registerButtonEvent(randomIndex);
  },

  /* rendering */

  renderContentGroupItem(index) {
    if (this.templateHtml === '') {
      this.templateHtml = LUMI.template.getTemplate(this.templateId);
    }

    const $contentBoxItem = this.$contentGroupItemArr.item(index).querySelector('.tab-content-box');
    const contentItemsData = this.data[index]['items'];
    const resultHtml = LUMI.template.makeHtml(this.templateHtml, contentItemsData);
  
    $contentBoxItem.innerHTML = resultHtml;
  },

  /* dom */

  setButtonIndex() {
    LUMI.util.dom.setIndex(this.$buttonItemArr, 'a');  
  },
  registerButtonEvent() {
    this.$buttonBox.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target;

      if (target && target.nodeName === 'A') {
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
 * BmcVisualSlide
 */

function BmcVisualSlide({ $imgBox, $arrowBtnBox, $dotBtnBox, useRAF }) {
  this.$imgBox = $imgBox;
  this.$imgArr = $imgBox.querySelectorAll('.img-item');
  this.$arrowBtnBox = $arrowBtnBox;
  this.$dotBtnBox = $dotBtnBox;
  this.$dotBtnArr = $dotBtnBox.querySelectorAll('a');

  this.totalLength = this.$imgArr.length;  
  this.useRAF = useRAF || false;
  useRAF && (this.currentIndex = 3);
}

BmcVisualSlide.prototype = {
  init() {
    this.setImgIndex();
    this.setDotBtnIndex();
    this.$imgBox.dataset.useRequestAnimationFrame = this.useRAF;
    if (this.useRAF) {
      this.handleSlideActive(this.currentIndex);
      this.handleDotBtnActive(this.currentIndex);
    }

    this.registerArrowBtnEvent();
    this.registerDotBtnEvent();
  },

  /* dom */
  setImgIndex() {
    LUMI.util.dom.setIndex(this.$imgArr);    
  },
  setDotBtnIndex() {
    LUMI.util.dom.setIndex(this.$dotBtnArr);
  },

  registerArrowBtnEvent() {
    this.$arrowBtnBox.addEventListener('click', (e) => {
      e.preventDefault();
      const $thisBtn = e.target;
      if (!$thisBtn) { return; }

      const isPrev = $thisBtn.classList.contains('prev');
      const isNext = $thisBtn.classList.contains('next');
      const currentIndex = this.currentIndex || this.$imgBox.querySelector('.current').index;
      let newIndex;

      isPrev && (newIndex = this.calcSlideIndex(currentIndex - 1));
      isNext && (newIndex = this.calcSlideIndex(currentIndex + 1));

      this.handleSlideActive(newIndex, currentIndex);
      this.handleDotBtnActive(newIndex, currentIndex);
    });
  },
  registerDotBtnEvent() {
    this.$dotBtnBox.addEventListener('click', (e) => {
      e.preventDefault();
      const $thisBtn = e.target;
      if (!$thisBtn) { return; }

      const currentIndex = this.currentIndex || this.$imgBox.querySelector('.current').index;
      const newIndex = $thisBtn.index;

      this.handleSlideActive(newIndex, currentIndex);
      this.handleDotBtnActive(newIndex, currentIndex);
    });
  },

  calcSlideIndex(index) {
    const max = this.totalLength;
    return (max + index) % max;
  },
  handleDotBtnActive(activeIndex, resetIndex) {
    this.$dotBtnArr.item(resetIndex).classList.remove('on');
    this.$dotBtnArr.item(activeIndex).classList.add('on');
  },
  handleSlideActive(activeIndex, resetIndex) {
    if (this.useRAF) { // requestAnimationFrame 사용
      const noAnimation = (resetIndex)? false : true;
      this.currentIndex = activeIndex;
      this.handleSlideResetCSS();
      this.handleSlideFadeOut(resetIndex, noAnimation);
      this.handleSlideFadeIn(activeIndex, noAnimation);

    } else { // transition 사용
      this.handleSlideToRemoveClass(resetIndex);
      this.handleSlideToAddClass(activeIndex);
    }
  },
  handleSlideToRemoveClass(currentIndex) {
    const $imgArr = this.$imgArr;
    const prevIndex = this.calcSlideIndex(currentIndex - 1);
    const nextIndex = this.calcSlideIndex(currentIndex + 1);

    $imgArr.item(prevIndex).classList.remove('prev');
    $imgArr.item(currentIndex).classList.remove('current');
    $imgArr.item(nextIndex).classList.remove('next');
  },
  handleSlideToAddClass(currentIndex) {
    const $imgArr = this.$imgArr;
    const prevIndex = this.calcSlideIndex(currentIndex - 1);
    const nextIndex = this.calcSlideIndex(currentIndex + 1);

    $imgArr.item(prevIndex).classList.add('prev');
    $imgArr.item(currentIndex).classList.add('current');
    $imgArr.item(nextIndex).classList.add('next');
  },
  handleSlideResetCSS() {
    this.$imgArr.forEach((elem) => {
      elem.style.transform = 'translateX(100%)';
      elem.style.opacity = 0;
      elem.style.zIndex = -1;
    });
  },
  handleSlideFadeOut(index, noAnimation) {
    const SPEED = 0.11;
    const $target = this.$imgArr.item(index);
    $target.style.transform = 'translateX(0)';
    if (noAnimation) {
      $target.style.opacity = 0;
    } else {
      LUMI.animation.fadeOut($target, SPEED);
    }
  },
  handleSlideFadeIn(index, noAnimation) {
    const SPEED = 0.08;
    const $target = this.$imgArr.item(index);
    $target.style.transform = 'translateX(0)';
    $target.style.zIndex = 0;
    if (noAnimation) {
      $target.style.opacity = 1;
    } else {
      LUMI.animation.fadeIn($target, SPEED);
    }
  }
};

/**
 * BmcSlidingList (use async)
 */

function BmcSlidingList($slidingListBox) {

}

BmcSlidingList.prototype = {
  init() {

  }
};
