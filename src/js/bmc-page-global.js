'use strict';

(function(bmcPage) {

  const pageNameByFileNameMap = {
    'index.html': 'main',
    'template.html': 'template'
  };

  function getFileName(url) {
    let resultUrl = url.substring(url.lastIndexOf('/')+1);
    resultUrl = resultUrl.split('?')[0];
    resultUrl = resultUrl.split('#')[0];

    return resultUrl;
  }

  function mapInitByPage(pathname) {
    const fileName = getFileName(pathname);
    const pageName = pageNameByFileNameMap[fileName];

    return bmcPage[pageName].init;
  }

  document.addEventListener('DOMContentLoaded', mapInitByPage(location.pathname)());

})(window.bmcPage);
