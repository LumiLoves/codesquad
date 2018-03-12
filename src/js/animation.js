'use strict';

/**
 * Animation
 */

window.LUMI = window.LUMI || {};

LUMI.animation = {
  FADE_SPEED: 0.01,
  fadeOut(elem, speed) {
    elem.style.opacity = 1;
    const SPEED = speed || this.FADE_SPEED;

    (function decrease() {
      if ((elem.style.opacity -= SPEED) <= 0) {
        elem.style.opacity = 0;
      } else {
        requestAnimationFrame(decrease);
      }
    })();
  },
  fadeIn(elem, speed) {
    elem.style.opacity = 0;
    const SPEED = speed || this.FADE_SPEED;

    (function increase() {
      var opacityVal = parseFloat(elem.style.opacity);
      if (!((opacityVal += SPEED) >= 1)) {
        elem.style.opacity = opacityVal;
        requestAnimationFrame(increase);        
      }
    })();
  }
};
