'use strict';

/**
 * Renderer
 */

class Renderer {
  constructor({ ajax, template, reqUrl, templateHTML }) {
    this.ajax = ajax;
    this.template = template;

    this.url = reqUrl;
    this.data = null;
    this.templateHTML = templateHTML;
  }
  renderUI({ wrapper, handleData, callback }) {
    this._requestData((res) => {
      if (typeof handleData === 'function') {
        const resultData = handleData(this.data);
        this._saveResData(resultData);
      }
      this._makeHTML(wrapper);
      callback && callback();
    });
  }
  _requestData(success) {
    this.ajax.getData({
      url: this.url,
      success: (res) => {
        this._saveResData(res);
        (typeof success === 'function') && success(res);
      }
    });
  }
  _saveResData(data) {
    this.data = data;
  }
  _makeHTML(appendWrapper) {
    this.template.makeHTML({
      templateHTML: this.templateHTML,
      dataArr: this.data,
      append: (result) => (appendWrapper.innerHTML = result)
    });
  }
}
