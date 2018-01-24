'use strict';


// es6 문법 쓰기.
// let, const 
// () => { }
// object shorthands
// prototype 으로 패턴 써보기


// DOM
const $gnbMenuArr = document.querySelectorAll('#gnb .menu > li');

// Data
const actionUrl = {
  bestDish: '/woowa/best',
  mainDish: '/woowa/main',
  course: '/woowa/course',
  soup: '/woowa/soup',
  sideDish: '/woowa/side'
};

// Class
const oGnb = new Gnb($gnbMenuArr); // TODO 생각해보기. 전역변수로 빼도 괜찮다고 하심.
const oAjax = new Ajax();


/**
 * BMC (배민찬)
 */
const BMC = {
  init() {
    oGnb.init();
  }
};

BMC.init();



