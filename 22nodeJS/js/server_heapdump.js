var http = require("http");
var heapdump = require("heapdump");

var leakArray = [];

var leak = function() {
  leakArray.push("leak" + Math.random());
}

http.createServer(function(req, res) {
  leak();
  res.writeHead(200, {'content-type': "text/plain"});
  res.end('hello world\n');
}).listen('1337');

console.log("server running at http://127.0.0.1:1337/");
