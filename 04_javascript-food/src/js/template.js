'use strict';

/**
 * Template
 */

function Template() {}

Template.prototype = {
  getTemplate(templateId) {
    const selector = `[data-template-html = "${templateId}"]`;
    return document.querySelector(selector).innerHTML;
  },
  makeHtml(templateHtml, dataArr) {
    let totalHtml = '';

    dataArr.forEach((data, i) => {
      // 단순 치환
      let dataHtml = this._replaceData(templateHtml, data);
      // each 치환
      dataHtml = this._handleEachHelper(dataHtml, data);
      // if조건 치환
      dataHtml = this._handleIfHelper(dataHtml, data);

      totalHtml += dataHtml;
    });

    return totalHtml;
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
      const hasIfData = ifData && ifData.length;
      let ifHtml = '';

      if (hasIfData) {
        ifHtml = template.replace(/{{this}}/g, ifData);
        html = html.replace(ifStr, ifHtml);  
      } else {
        html = html.replace(ifStr, '');                
      }
    });

    return html;
  }
  // renderView(templateId, data, appendFunc) {
  //   const template = this.getTemplate(templateId);
  //   const html = this.makeHtml(template, data);
  //   appendFunc(html);
  // }
};


/**

사용측 코드

template.renderView('#gnb', {}, (html) => {
  $parent.appendHtml(html);
});

 */