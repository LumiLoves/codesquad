'use strict';

const mainPage = (function(lumiUtil, BmcUI) {
  const { Renderer, Tab, VisualSlider, ListSlider } = BmcUI;
  const url = {
    domain: 'http://crong.codesquad.kr:8080',
    bestDish: '/woowa/best',
    sideDish: '/woowa/side',    
    mainDish: '/woowa/main',
    soup: '/woowa/soup'
  };

  function initMainPage() {

    /* Visual Slider - Promotion */
    const oVisualSliderPromotion = new VisualSlider({
      wrapperElem: document.querySelector('#main-visual'),
      dom: lumiUtil.dom,
      animation: lumiUtil.animation,
      useJsAnimation: true
    });

    /* Tab - Best Dish */ 
    const oTabBestDish = new Tab({
      wrapperElem: document.querySelector('#best-seller .tab-box'),
      renderer: new Renderer({
        ajax: lumiUtil.ajax,
        reqUrl: url.domain + url.bestDish,        
        template: lumiUtil.template,
        templateHTML: document.querySelector('[data-template-html="best-seller__tab-content-item"]').innerHTML
      }),
      dom: lumiUtil.dom
    });

    /* Sliding Lists */
    const listSliderNodeList = document.querySelectorAll('.sliding-list-box');
    const oListSliderArr = [
      url.domain + url.sideDish,
      url.domain + url.mainDish,
      url.domain + url.soup
    ].map((url, i) => {
      return new ListSlider({
        wrapperElem: document.querySelectorAll('.sliding-list-box')[i],
        renderer: new Renderer({
          ajax: lumiUtil.ajax,
          reqUrl: url,          
          template: lumiUtil.template,
          templateHTML: document.querySelector('[data-template-html="side-dish__content-box"]').innerHTML
        }),
        dom: lumiUtil.dom
      });  
    });
  }

  return {
    init: initMainPage
  }
})(lumiUtil, BmcUI);