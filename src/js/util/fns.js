'use strict';

/**
 * Fns
 */

const fns = (function(HttpError) {

  const fns = {
    setIndexToDom(nodeList, selector) {
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
    },
    async getFetchData({ url }) {
      const response = await fetch(url);
  
      if (response.status === 200) {
        return await response.json();
      } else {
        throw new HttpError(response);
      }
    }
  };

  return fns;

})(HttpError);
