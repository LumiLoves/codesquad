/**
 * Server
 */

const express = require('express');
const app = express();
const http = require('http').Server(app);


/* set static url */

// app.use(express.static(__dirname + '/src'));
app.use(express.static(__dirname));


/* page */

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});
app.get('/template', function(req, res) {
  res.sendfile('./template.html');
});
app.get('/outline', function(req, res) {
  res.sendfile('./index_outline.html');
});
app.get('/test', function(req, res) {
  res.sendfile('./test/test.html');
});


/* test url */

app.get('/test-success', function(req, res) {
  const mockJSON = require('./test/mock/mockSuccess.json');
  res.json(mockJSON);
});
app.get('/test-error', function(req, res) {
  res.status(401);
  res.json({ data: "error" });
});


/* port */

http.listen(3001, function() {
  console.log('listening on *:3001');
});