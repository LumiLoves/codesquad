module.exports = function () {
  var readline = require('readline');

  var r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  r.setPrompt('> ');

  r.on('close', function () {
    process.exit();
  });
  return r;
}