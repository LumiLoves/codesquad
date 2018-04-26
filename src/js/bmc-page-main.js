'use strict';

const mainPage = (function(lumiUtil, Renderer, Tab, VisualSlider, ListSlider) {
  const urlInfo = {
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
      OPACITY_INTERVAL_VALUE: [ 0.11, 0.08 ],
      useJsAnimation: true
    });

    /* Tab - Best Dish */
    const oTabBestDish = new Tab({
      wrapperElem: document.querySelector('#best-seller .tab-box'),
      renderer: new ClientRenderer({
        getData: async () => {
          const res = await fetch(urlInfo.domain + urlInfo.bestDish);
          return await res.json();
        },
        template: lumiUtil.template,
        templateHTML: document.querySelector('[data-template-html="best-seller__tab-content-item"]').innerHTML
      }),
      dom: lumiUtil.dom
    });

    /* Sliding Lists */
    const listSliderNodeList = document.querySelectorAll('.sliding-list-box');
    const oListSliderArr = [
      urlInfo.domain + urlInfo.sideDish,
      urlInfo.domain + urlInfo.mainDish,
      urlInfo.domain + urlInfo.soup
    ].map((url, i) => {
      return new ListSlider({
        wrapperElem: document.querySelectorAll('.sliding-list-box')[i],
        renderer: new ClientRenderer({
          getData: async () => {
            const res = await fetch(url);
            return await res.json();
          },
          // getData: () => JSON.parse(localStorage.getItem('res_sideDish')),
          template: lumiUtil.template,
          templateHTML: document.querySelector('[data-template-html="side-dish__content-box"]').innerHTML
        }),
        dom: lumiUtil.dom,
        itemCountPerGroup: 4 - i
      });
    });
  }

  return {
    init: initMainPage
  }
})(lumiUtil, Renderer, Tab, VisualSlider, ListSlider);