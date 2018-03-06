'use strict';

// Data
const apiDomain = 'http://crong.codesquad.kr:8080';
const actionUrl = {
  bestDish: '/woowa/best',
  mainDish: '/woowa/main',
  course: '/woowa/course',
  soup: '/woowa/soup',
  sideDish: '/woowa/side'
};

// DOM
const $gnbMenus = document.querySelectorAll('#gnb .menu > li');
const $tabBoxArr = document.querySelectorAll('.tab-box');
const $slidingListBoxArr = document.querySelectorAll('.sliding-list-box');
const $imgBox = document.querySelector('#main-visual .img-box');
const $arrowBtnBox = document.querySelector('#main-visual .arrow-btn-box');
const $dotBtnBox = document.querySelector('#main-visual .dot-btn-box');

// UI Class
const oMainVisualSlide = new BmcVisualSlide($imgBox, $arrowBtnBox, $dotBtnBox);
const oTabBestDish = new BmcTab({
  $tabBox: $tabBoxArr[0],
  reqUrl: apiDomain + actionUrl.bestDish,
  templateId: 'best-seller__tab-content-item'
});
const oSlidingListSideDish = new BmcSlidingList($slidingListBoxArr[0]);

/**
 * bmc (배민찬)
 */

const bmc = {
  init() {
    oMainVisualSlide.init();
    oTabBestDish.init();
    oSlidingListSideDish.init();
  }
};

bmc.init();



