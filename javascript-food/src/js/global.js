/**
 * page initializer (by url)
 */

// 다른 여러 페이지들이 있다고 가정
const pageScriptSrcMap = {
  main: './main.js',
  sub: './sub.js',
  // ...
};

function getPageName() {
  const { protocol, pathname } = location;
  const isNotSupportedProtocol = (protocol !== ('https:' || 'http:'));
  if (isNotSupportedProtocol) { return null; }

  let pageName = pathname.substring(pathname.lastIndexOf('/') + 1);
  pageName = pageName.split('?')[0];
  pageName = pageName.split('#')[0];
  pageName = pageName.split('.')[0];    
  return pageName;
}

function runPage() {
  const pageName = getPageName() || 'main';
  const scriptSrc = pageScriptSrcMap[pageName];

  import(scriptSrc)
  .then(({ default: initPage }) => initPage())
  .catch((error) => {
    throw new Error('해당 페이지의 script file import 중 에러발생', error);
  });
}

document.addEventListener('DOMContentLoaded', runPage);
