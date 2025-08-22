var net = require('net');
// 连接服务器
var client = net.connect({port: 8124}, function() {
  console.log("client connected");
  client.write("in connect")
});

client.on("data", function(data) {
  console.log(data.toString());
  client.end();
});

client.on("end", function() {
  console.log("client disconnected");
})