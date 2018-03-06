'use strict';

/**
 * ajax
 */

if (!window.LUMI) window.LUMI = {};

LUMI.ajax = {
  request({ url, method, data, reqContentType, success, error, isAsync }) {
    const xhr = new XMLHttpRequest();
    method = method.toUpperCase();
    data = LUMI.util.type.isObject(data)? JSON.stringify(data): null; 
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
  // encodeFormData() {},
  // 디폴트 응답 콜백 핸들러 모음?!
  // handleDefaultSuccess() {},
  // handleDefaultError() {},
};

/*
const request = (arg) => console.log(arg);
const postJSON = () => {
  const method = "POST";
  return ({ url, data, success, error, isAsync }) => request({url,data,success,error,isAsync,method:'POST'});
}

postJSON()({ url:"xx", data:"data", success:()=>console.log(1), error:"none", isAsync:"ok" });
*/


/**

사용측 코드

oAjax.getData({
	url: actionUrl.bestDish,
	// data: {
  //   "a": 1,
  //   "b": 2
  // },
	success: () => {
    // .....
  }
});

or

oAjax.getData(actionUrl.bestDish, { "a": 1, "b": 2 }, () => {
  // .....
});

 */