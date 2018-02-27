const express = require('express');
const app = express();
const http = require('http').Server(app);

app.use(express.static(__dirname + '/src'));
app.get('/', function(req, res) {
  res.sendfile('index.html');
});
app.get('/template', function(req, res) {
  res.sendfile('template.html');
});
app.get('/outline', function(req, res) {
  res.sendfile('index_outline.html');
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});