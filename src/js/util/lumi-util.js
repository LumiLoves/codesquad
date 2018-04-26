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
   * Template
   */

  const template = {
    makeHTML({ templateHTML, dataArr, append }) {
      const resultHTML = dataArr.reduce((accumulator, currentData) => {
        let currentHTML = templateHTML;
        currentHTML = this._replaceData(currentHTML, currentData); // 단순 치환
        currentHTML = this._handleEachHelper(currentHTML, currentData); // each 치환
        currentHTML = this._handleIfHelper(currentHTML, currentData); // if조건 치환
        return accumulator += currentHTML;
      }, '');

      if (typeof append === 'function') { append(resultHTML); }

      return resultHTML;
    },
    _replaceData(html, obj) {
      let thisValue = null;
  
      for (var key in obj) {
        thisValue = obj[key];
        html = html.replace(`{{${key}}}`, thisValue);
      }
  
      return html;
    },
    _handleEachHelper(html, data) {
      const regexAllEachTemplate = /\{\{#each([^\}]+)\}\}([^\#]+)\{\{\/each\}\}/g;
      const regexEachWithGroup = /\{\{#each([^\}]+)\}\}([^\#]+)\{\{\/each\}\}/;
      const eachArr = html.match(regexAllEachTemplate);
        // ==> 결과값 [ "{{#each foo}}<p>{{this}}</p>{{/each}}", "{{#each doo}}<p>{{this}}</p>{{/each}}" ]
  
      eachArr.forEach((eachStr) => {
        const keyAndTemplate = eachStr.match(regexEachWithGroup); 
          // ==> 결과값 [ "{{#each foo}}<p>{{this}}</p>{{/each}}", " foo", "<p>{{this}}</p>" ] 
        const key = keyAndTemplate[1].trim();
        const template = keyAndTemplate[2].trim();
        const eachDataArr = data[key];
        const hasEachDataArr = eachDataArr && eachDataArr.length;
        let eachHtml = '';
  
        hasEachDataArr && eachDataArr.forEach((eachData) => {
          eachHtml += template.replace(/{{this}}/g, eachData);
        });
  
        html = html.replace(eachStr, eachHtml);
      });
  
      return html;
    },
    _handleIfHelper(html, data) {
      const regexAllIfTemplate = /\{\{#if([^\}]+)\}\}([^\#]+)\{\{\/if\}\}/g;
      const regexIfWithGroup = /\{\{#if([^\}]+)\}\}([^\#]+)\{\{\/if\}\}/;
      const ifArr = html.match(regexAllIfTemplate);
  
      ifArr.forEach((ifStr) => {
        const keyAndTemplate = ifStr.match(regexIfWithGroup);
        const key = keyAndTemplate[1].trim();
        const template = keyAndTemplate[2].trim();
        const ifData = data[key];
        let ifHtml = '';

        if (!!ifData) {
          ifHtml = template.replace(/{{this}}/g, ifData);
          html = html.replace(ifStr, ifHtml);  
        } else {
          html = html.replace(ifStr, '');                
        }
      });

      return html;
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
    template,
    animation,
    dom
  }
})();

