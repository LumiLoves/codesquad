'use strict';

(function(bmcPage) {
  function getFileName(url) {
    const isNotSupportedProtocol = location.protocol !== ('https:' || 'http:');
    if (isNotSupportedProtocol) { return null; }

    let resultUrl = url.substring(url.lastIndexOf('/')+1);
    resultUrl = resultUrl.split('?')[0];
    resultUrl = resultUrl.split('#')[0];
    resultUrl = resultUrl.split('.')[0];    
    return resultUrl;
  }

  function getPageInitFn(pathname) {
    const fileName = getFileName(pathname);
    return (fileName)? bmcPage[fileName].init : bmcPage.index.init;
  }

  const currentPageInitFn = getPageInitFn(location.pathname);
  document.addEventListener('DOMContentLoaded', currentPageInitFn());

})(window.bmcPage);
