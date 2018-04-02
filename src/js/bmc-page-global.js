'use strict';

const mapPageInit = {
  '/': mainPage.init
}[location.pathname];

document.addEventListener('DOMContentLoaded', mapPageInit);
