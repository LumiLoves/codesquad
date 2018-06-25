'use strict';

/**
 * TemplateRenderer
 */

class TemplateRenderer {
  constructor({ templateHTML }) {
    this.templateHTML = templateHTML;
  }
  renderDOM({ data, appendFn }) {
    const dataArr = (toString.call(data) === '[object Object]')? [].push(data) : data;
    const resultHTML = dataArr.reduce((accumulator, currentData) => {
      let currentHTML = this.templateHTML;

      currentHTML = this._replaceData(currentHTML, currentData); // 단순 치환
      currentHTML = this._handleEachHelper(currentHTML, currentData); // each(반복) 치환
      currentHTML = this._handleIfHelper(currentHTML, currentData); // if(조건) 치환

      return accumulator += currentHTML;
    }, '');

    if (typeof appendFn === 'function') { appendFn(resultHTML); }

    return resultHTML;
  }
  _replaceData(html, obj) {
    let thisValue = null;

    for (var key in obj) {
      thisValue = obj[key];
      html = html.replace(`{{${key}}}`, thisValue);
    }

    return html;
  }
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
  }
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
}



