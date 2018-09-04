/**
 * main page 
 */

import VisualSlider from './component/ui/VisualSlider.js';
import Tab from './component/ui/Tab.js';
import ListSlider from './component/ui/ListSlider.js';
import PageScroller from './component/ui/PageScroller.js';


/* data */

const searchUrl = { // [참고 API] https://www.mediawiki.org/wiki/API:Opensearch
  BASE_URL: 'https://ko.wikipedia.org/w/api.php',
  QUERY_STRING: 'action=opensearch&format=json&search=${keyword}'
};

const templateUrl = {
  BASE_URL: 'https://raw.githubusercontent.com/LumiLoves/javascript-food/kimally/src/data',
  BEST_DISH: '/best.json',
  SIDE_DISH: '/side.json',
  MAIN_DISH: '/main.json',
  SOUP: '/soup.json'
};


/* UI instance */

// 비주얼 슬라이더
const oVisualSlider_promotion = new VisualSlider({
  wrapperElem: document.querySelector('#main-visual'),
  userOption: {
    OPACITY_INTERVAL_VALUE: [ 0.09, 0.12 ],
    useJsAnimation: true
  }
});

// 비동기 렌더링 탭
const oTab_bestDish = new Tab({
  wrapperElem: document.querySelector('#best-seller .tab-box'),
  userOption: {
    reqUrl: templateUrl.BASE_URL + templateUrl.BEST_DISH,
    useStorage: true,
    templateHTML: document.querySelector('[data-template-html="best-seller__tab-content-item"]').innerHTML
  }
});

// 비동기 렌더링 목록슬라이더
const oListSlider_dishes = [
  templateUrl.BASE_URL + templateUrl.SIDE_DISH,
  templateUrl.BASE_URL + templateUrl.MAIN_DISH,
  templateUrl.BASE_URL + templateUrl.SOUP
].map((thisUrl, i) => {
  return new ListSlider({
    wrapperElem: document.querySelectorAll('.sliding-list-box')[i],
    userOption: {
      ITEM_COUNT_PER_GROUP: 4,
      reqUrl: thisUrl,
      templateHTML: document.querySelector('[data-template-html="side-dish__content-box"]').innerHTML
    }
  });
});

// 페이지 스크롤러
const oPageScroller = new PageScroller({
  wrapperElem: document.querySelector('#scroll-btns')
});

// 자동 완성 검색
const makeAutoCompleteSearchInstance = (AutoCompleteSearcher) => {
  return new AutoCompleteSearcher({
    wrapperElem: document.querySelector('#header .search-box'),
    userOption: {
      reqUrl: searchUrl.BASE_URL + '?' + searchUrl.QUERY_STRING,
      useStorage: true,
      templateHTMLResultList: document.querySelector('[data-template-html="auto-complete-result-list"]').innerHTML,
      templateHTMLRecentList: document.querySelector('[data-template-html="auto-complete-recent-list"]').innerHTML
    }
  });
};


/* init */

export default function init() {
  const searchInput = document.querySelector('#header .search-input');
  const searchModuleSrc = './component/ui/AutoCompleteSearcher.js';
  
  searchInput.addEventListener('focus', function handleSearchInput() {
    searchInput.removeEventListener('focus', handleSearchInput);

    import(searchModuleSrc)
      .then(({ default: AutoCompleteSearcher }) => {
        const oAutoCompleteSearcher = makeAutoCompleteSearchInstance(AutoCompleteSearcher);
        oAutoCompleteSearcher.init(() => {
          const focusEvent = new Event('focus');
          searchInput.dispatchEvent(focusEvent);
        });
      })
      .catch((error) => {
        throw new Error('AutoCompleteSearcher 모듈을 가져오지 못함', error);
      });
  });

  oVisualSlider_promotion.init();
  oTab_bestDish.init();
  oListSlider_dishes.forEach((oListSlider_dish) => oListSlider_dish.init());
  oPageScroller.init();
}
