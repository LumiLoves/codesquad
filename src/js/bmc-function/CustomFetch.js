'use strict';

/**
 * CustomFetch
 */

class CustomFetch extends ParentRequest {
  constructor() {
    super();
  }
  async getData({ url, error }) {
    const res = await fetch(url).catch(errorCallback);
    let resJSON = await res.json();

    function errorCallback(err) {
      if (typeof error === 'function') { error(err); }
      console.log('Error: ', err);
    }

    return resJSON;
  }
}
