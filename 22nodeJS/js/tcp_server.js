// 创建一个TCP服务器
var net = require('net');
var server  = net.createServer(function(socket) {
  socket.on("data", function(data) {
    socket.write("in data transfer")
  });
  socket.on("end", function() {
    console.log('disconnect');
  });
  socket.write("welcome to tcp server");
});
server.listen(8124, function() {
  console.log("server bound");
})