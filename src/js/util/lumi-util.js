'use strict';

const lumiUtil = (function() {
  /**
   * Ajax
   */

  const ajax = {
    request({ url, method, data, reqContentType, success, error, isAsync }) {
      const xhr = new XMLHttpRequest();
      method = method.toUpperCase();
      data = (toString.call(data) === '[object Object]')? JSON.stringify(data): null; 
      isAsync = (isAsync)? isAsync : true;
  
      xhr.open(method, url, isAsync);
      reqContentType && xhr.setRequestHeader('Content-Type', reqContentType);
  
      xhr.onreadystatechange = () => {
        const type = xhr.getResponseHeader('Content-Type');
        let resData = null;
  
        // 예외 처리
        if (xhr.readyState !== 4) { return; }
        if (xhr.status !== 200) {
          (typeof error === 'function') && error(xhr);
          return;
        }
  
        // 응답데이터 처리
        if (type.match(/^text/)) {
          resData = xhr.responseText;
        } else if (type.match(/^application\/json/)) {
          resData = JSON.parse(xhr.responseText);
        } else {
          throw new Error('응답은 텍스트 또는 JSON 형태여야 합니다. 현재 상태: ' + type);
          return;
        }
  
        // 성공 콜백
        (typeof success === 'function') && success(resData);      
      };
  
      xhr.send(data);
    },
    getData({ url, data, success, error, isAsync }) {
      this.request({
        url, data, success, error, isAsync, method: 'GET'
      });
    },
    postJSON({ url, data, success, error, isAsync }) {
      this.request({
        url, data, success, error, isAsync, method: 'POST', reqContentType: 'application/json'
      });
    }
  };


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


  /**
   * Dom
   */

  const dom = {
    registerEvent(dom, eventName, callback) {
      dom.forEach((elem) => {
        elem.addEventListener(eventName, (e) => {
          e.preventDefault();
          callback(e);
        });
      });
    },
    setIndex(nodeList, selector) {
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
  };


  return {
    ajax,
    animation,
    dom
  }
})();

