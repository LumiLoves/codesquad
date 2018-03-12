'use strict';

/**
 * Animation
 */

window.LUMI = window.LUMI || {};

LUMI.animation = {
  SPEED: 0.01,
  fadeOut(elem, speed) {
    elem.style.opacity = 1;
    const SPEED = speed || this.SPEED;

    const decrease = () => {
      if ((elem.style.opacity -= SPEED) <= 0) {
        elem.style.opacity = 0;
      } else {
        requestAnimationFrame(decrease);
      }
    };
    decrease();
  },
  fadeIn(elem, speed) {
    elem.style.opacity = 0;
    const SPEED = speed || this.SPEED;

    const increase = () => {
      var val = parseFloat(elem.style.opacity);
      if (!((val += SPEED) >= 1)) {
        elem.style.opacity = val;
        requestAnimationFrame(increase);        
      }
    };
    increase();
  }
};
