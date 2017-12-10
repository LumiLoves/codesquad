"use strict";

var readline = require('./config/readline')();
var messages = require('./src/messages');
var parser = require('./src/jsonParser');
var reader = require('./src/jsonReader');


(function () {
  messages.waitInsert();
  readline.prompt();

  readline.on('line', function (insert) {
    var parsedData;
    var dataCount;

    try {
      parsedData = parser.parse(insert);
      // dataCount = reader.countType(parsedData);
      // messages.jsonCount(dataCount);
      console.log(parsedData);
    }
    catch (error) {
      messages.error(error);
    }

    messages.waitInsert();
    readline.prompt();
  });
})();