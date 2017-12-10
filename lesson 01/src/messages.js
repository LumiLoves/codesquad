var util = require('./utils');
var log = util.log;

var messages = {
  waitInsert: function () {
    log('Please insert json data');
  },
  jsonCount: function (count) {
    sumCount = count.string + count.number + count.bool;
    log(`총 ${sumCount}개의 데이터 중에 문자열 ${count.string}개, 숫자 ${count.number}개, 부울 ${count.bool}개가 포함되어 있습니다.`);
  },
  error: function (errorMassage) {
    log(errorMassage);
  },
};

module.exports = messages;