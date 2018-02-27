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

function Tab({ $tabBox, reqUrl, templateId }) {
  this.$buttonBox = $tabBox.querySelector('.tab-btn-box');
  this.$buttonItemArr = $tabBox.querySelectorAll('.tab-btn-box > li');
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

    oAjax.getData({
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
 * Visual Slide
 */

function VisualSlide($imgBox, $arrowBtnBox, $dotBtnBox) {
  this.$imgBox = $imgBox;
  this.$imgArr = $imgBox.querySelectorAll('.img-item');
  this.totalLength = this.$imgArr.length;

  this.$arrowBtnBox = $arrowBtnBox;
  this.$dotBtnBox = $dotBtnBox;
}

VisualSlide.prototype = {
  init() {
    this.setImgIndex();
    this.setDotBtnIndex();

    this.registerArrowBtnEvent();
    // this.registerArrowBtnEventWithRequestAnimationFrame();
    
    this.registerDotBtnEvent();
  },

  /* dom */

  setImgIndex() {
    util.dom.setIndex(this.$imgArr);    
  },
  setDotBtnIndex() {
    const $dotBtnArr = this.$dotBtnBox.querySelectorAll('a');
    util.dom.setIndex($dotBtnArr);
  },

  /*
  registerArrowBtnEvent() {
    this.$arrowBtnBox.addEventListener('click', (e) => {
      e.preventDefault();

      const target = e.target;
      const $imgArr = this.$imgArr;
      const totalLength = this.totalLength;
      const $currentImg = this.$imgBox.querySelector('.current');
      const currentIndex = $currentImg.index;

      if (target && target.classList.contains('prev')) {
        
        return;
      }

      if (target && target.classList.contains('next')) {
        $imgArr.item((totalLength + currentIndex - 1) % totalLength).classList.remove('prev');
        $imgArr.item((totalLength + currentIndex) % totalLength).classList.remove('current');
        $imgArr.item((totalLength + currentIndex + 1) % totalLength).classList.remove('next');

        $imgArr.item((totalLength + currentIndex) % totalLength).classList.add('prev');
        $imgArr.item((totalLength + currentIndex + 1) % totalLength).classList.add('current');
        $imgArr.item((totalLength + currentIndex + 2) % totalLength).classList.add('next');
        return;
      }
    });
  },
  */

  registerArrowBtnEvent() {
    this.$arrowBtnBox.addEventListener('click', (e) => {
      e.preventDefault();

      const targetBtn = e.target;
      const totalLength = this.totalLength;
      const $imgArr = this.$imgArr;

      const $currentImg = this.$imgBox.querySelector('.now');
      const $oldImg = this.$imgBox.querySelector('.old');

      const currentIndex = $currentImg.index;
      const newIndex = (totalLength + currentIndex - 1) % 5;

      $currentImg.classList.remove('now');
      $oldImg.classList.remove('old');

      if (targetBtn && targetBtn.classList.contains('prev')) {
        $imgArr.item((totalLength + currentIndex - 1) % totalLength).classList.add('now');
        $imgArr.item((totalLength + currentIndex) % totalLength).classList.add('old');
        return;
      }

      if (targetBtn && targetBtn.classList.contains('next')) {
        $imgArr.item((totalLength + currentIndex + 1) % totalLength).classList.add('now');
        $imgArr.item((totalLength + currentIndex) % totalLength).classList.add('old');
        return;
      }
    });
  },
  registerArrowBtnEventWithRequestAnimationFrame() {
    this.$arrowBtnBox.addEventListener('click', (e) => {
      e.preventDefault();

      const targetBtn = e.target;
      const $imgArr = this.$imgArr;
      const totalLength = this.totalLength;

      const $currentImg = this.$imgBox.querySelector('.current');
      const currentIndex = $currentImg.index;
      let willIndex = null;

      $currentImg.classList.remove('current');
      fadeOut($currentImg);

      if (targetBtn && targetBtn.classList.contains('prev')) {
        willIndex = (totalLength + currentIndex - 1) % totalLength;
      }

      if (targetBtn && targetBtn.classList.contains('next')) {
        willIndex = (totalLength + currentIndex + 1) % totalLength;           
      }

      $imgArr.item(willIndex).classList.add('current');
      fadeIn($imgArr.item(willIndex));
    });

    function fadeIn(el) {
      el.style.opacity = 1;

      (function fade() {
        if ((el.style.opacity -= .01) < 0) {
          // el.style.display = 'none';
        } else {
          requestAnimationFrame(fade);
        }
      })();
    }

    function fadeOut(el) {
      el.style.opacity = 0;
      // el.style.display = 'block';
      
      (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .01) > 1)) {
          el.style.opacity = val;
          requestAnimationFrame(fade);
        }
      })();
    }
  },



  registerDotBtnEvent() {

  },
  handleSlideToPrev(currentIndex) {
    //
  },
  handleSlideToNext(currentIndex) {
    //
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
