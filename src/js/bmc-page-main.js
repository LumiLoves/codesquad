'use strict';

window.bmcPage || (window.bmcPage = {});

window.bmcPage.index = (function(AutoCompleteSearcher, VisualSlider, Tab, ListSlider, PageScroller) {

  /* data */

  const urlInfo = {
    BASE_URL: 'http://crong.codesquad.kr:8080',

    // search
    SEARCH_FOOD: '/ac/${query}',

    // list slider 
    BEST_DISH: '/woowa/best',
    SIDE_DISH: '/woowa/side',
    MAIN_DISH: '/woowa/main',
    SOUP: '/woowa/soup'

    // BASE_URL: 'https://github.com/lumiloves/javascript-food/blob/master/src/data',
    // BEST_DISH: '/best.json',
    // SIDE_DISH: '/side.json',
    // MAIN_DISH: '/main.json',
    // SOUP: '/soup.json'
  };


  /* UI instance */

  // 자동완성검색
  const oAutoCompleteSearcher = new AutoCompleteSearcher({
    wrapperElem: document.querySelector('#header .search-form'),
    userOption: {
      reqUrl: urlInfo.BASE_URL + urlInfo.SEARCH_FOOD,
      useStorage: true,
      storageName: 'search-history',
      templateHTML: document.querySelector('[data-template-html="auto-complete-result-list"]').innerHTML
    }
  });

  // 비주얼 슬라이더
  const oVisualSlider_promotion = new VisualSlider({
    wrapperElem: document.querySelector('#main-visual'),
    userOption: {
      OPACITY_INTERVAL_VALUE: [ 0.11, 0.08 ],
      useJsAnimation: true
    }
  });

  // 비동기 렌더링 탭
  const oTab_bestDish = new Tab({
    wrapperElem: document.querySelector('#best-seller .tab-box'),
    userOption: {
      reqUrl: urlInfo.BASE_URL + urlInfo.BEST_DISH,
      templateHTML: document.querySelector('[data-template-html="best-seller__tab-content-item"]').innerHTML,
      ITEM_NUMBER_PER_GROUP: 3
    }
  });

  // 비동기 렌더링 목록슬라이더
  const oListSlider_dishes = [
    urlInfo.BASE_URL + urlInfo.SIDE_DISH,
    urlInfo.BASE_URL + urlInfo.MAIN_DISH,
    urlInfo.BASE_URL + urlInfo.SOUP
  ].map((thisUrl, i) => {
    return new ListSlider({
      wrapperElem: document.querySelectorAll('.sliding-list-box')[i],
      userOption: {
        ITEM_COUNT_PER_GROUP: 4 - i,
        reqUrl: thisUrl,
        templateHTML: document.querySelector('[data-template-html="side-dish__content-box"]').innerHTML
      }
    });
  });

  // 페이지 스크롤러
  const oPageScroller = new PageScroller({
    wrapperElem: document.querySelector('#scroll-btns')
  });

  
  /* initIndexPage */

  function initIndexPage() {
    oAutoCompleteSearcher.init();
    oVisualSlider_promotion.init();
    oTab_bestDish.init();
    oListSlider_dishes.forEach((oListSlider_dish) => oListSlider_dish.init());
    oPageScroller.init();
  }

  return {
    init: initIndexPage
  }
})(AutoCompleteSearcher, VisualSlider, Tab, ListSlider, PageScroller);
