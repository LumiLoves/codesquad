// es6 문법 쓰기.
// let, const 
// () => { }
// object shorthands
// prototype 으로 패턴 써보기


// 1.
// const $gnbMenuArr = document.querySelectorAll('#gnb .menu > li');

// $gnbMenuArr.forEach((elem) => {
//   elem.addEventListener('mouseenter', (e) => {
//     e.target.classList.add('on');
//   });

//   elem.addEventListener('mouseleave', (e) => {
//     e.target.classList.remove('on');
//   });
// });


// 2.
const $gnbMenuArr = document.querySelectorAll('#gnb .menu > li');


/**
 * Gnb
 */

function Gnb($target) {
  this.$menuArr = $target;
}

Gnb.prototype = {
  init() {
    alert();
    this.registerEvent();
  },
  registerEvent() {
    this.$menuArr.forEach((elem) => {
      elem.addEventListener('mouseenter', (e) => {
        this.active(e);
      });

      elem.addEventListener('mouseleave', (e) => {
        this.inactive(e);
      });
    });
  },
  active(e) {
    e.target.classList.add('on');
  },
  inactive(e) {
    e.target.classList.remove('on');    
  }
};


/**
 * bmc (배민찬)
 */

const bmc = {
  init() {
    // new Gnb($gnbMenuArr).init();
    new Gnb($gnbMenuArr).init()
  }
};

bmc.init();
