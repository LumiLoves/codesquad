'use strict';

(function(bmcPage) {
  function getFileName(url) {
    let resultUrl = url.substring(url.lastIndexOf('/')+1);
    resultUrl = resultUrl.split('?')[0];
    resultUrl = resultUrl.split('#')[0];
    resultUrl = resultUrl.split('.')[0];    
    return resultUrl;
  }

  function mapInitByPage(pathname) {
    const fileName = getFileName(pathname);
    return (fileName)? bmcPage[fileName].init : bmcPage.index.init;
  }

  document.addEventListener('DOMContentLoaded', mapInitByPage(location.pathname)());

})(window.bmcPage);
