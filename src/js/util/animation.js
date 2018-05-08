
/**
 * Animation
 */

const animation = {
  OPACITY_INTERVAL_VALUE: 0.01,
  fadeOut(elem, OIV = this.OPACITY_INTERVAL_VALUE) {
    elem.style.opacity = 1;

    function decrease() {
      if ((elem.style.opacity -= OIV) <= 0) {
        elem.style.opacity = 0;
      } else {
        requestAnimationFrame(decrease);
      }
    }
    decrease();
  },
  fadeIn(elem, OIV = this.OPACITY_INTERVAL_VALUE) {
    elem.style.opacity = 0;

    function increase() {
      let opacityVal = parseFloat(elem.style.opacity);
      if (!((opacityVal += OIV) >= 1)) {
        elem.style.opacity = opacityVal;
        requestAnimationFrame(increase);        
      }
    }
    increase();
  }
};

