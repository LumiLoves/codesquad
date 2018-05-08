
/**
 * Helpers
 */

const helpers = {
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
  }
};