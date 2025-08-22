var https = require('https');
var fs = require('fs');
var options = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
  // ca: [fs.readFileSync('./keys/ca.crt')],
}

https.createServer(options, function(req, res) {
  res.writeHead(200);
  res.end('hello https server');
}).listen(8000);