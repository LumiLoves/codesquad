'use strict';

/**
 * Renderer
 */

class ClientRenderer {
  constructor({ getData, template, templateHTML }) {
    this.data = null;
    this.getData = getData; // 예) ajax, localStorage, cache 등등...
    this.template = template;
    this.templateHTML = templateHTML;
  }
  async renderUI({ remodelData, wrapper }) {
    let resJSON = await this.getData();
    if (typeof remodelData === 'function') { 
      resJSON = remodelData(resJSON);
    }
    this._saveResData(resJSON);
    this._makeHTML(wrapper);
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



