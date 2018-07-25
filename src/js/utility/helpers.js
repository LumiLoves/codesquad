/**
 * helpers
 */

import HttpError from './../component/http/HttpError.js';

export function injectScriptDOM(src, afterInjectionFn) {
  const scriptElem = document.createElement('script');
  scriptElem.src = src;
  scriptElem.addEventListener('load', () => {
    afterInjectionFn && afterInjectionFn();
  });
  document.body.appendChild(scriptElem);
}

export function attachIndexToDom(nodeList, selector) {
  const selectorFlag = selector? 'hasSelector' : 'noSelector';
  const handler = {
    noSelector(elem, i) {
      elem.index = i;
    },
    hasSelector(elem, i) {
      elem.querySelector(selector).index = i;
    }
  }[selectorFlag];

  nodeList.forEach(handler);
}

export async function getFetchData({ url }) {
  const response = await fetch(url);

  if (response.status === 200) {
    return await response.json();
  } else {
    throw new HttpError(response);
  }
}

export function fadeOutElem(elem, OPACITY_INTERVAL_VALUE = 0.01) {
  elem.style.opacity = 1;

  function decreaseOpacity() {
    if ((elem.style.opacity -= OPACITY_INTERVAL_VALUE) <= 0) {
      elem.style.opacity = 0;
    } else {
      requestAnimationFrame(decreaseOpacity);
    }
  }
  decreaseOpacity();
}

export function fadeInElem(elem, OPACITY_INTERVAL_VALUE = 0.01) {
  elem.style.opacity = 0;

  function increaseOpacity() {
    let opacityVal = parseFloat(elem.style.opacity);
    if (!((opacityVal += OPACITY_INTERVAL_VALUE) >= 1)) {
      elem.style.opacity = opacityVal;
      requestAnimationFrame(increaseOpacity);        
    }
  }
  increaseOpacity();
}