var fs = require('fs');
var iconv = require('iconv-lite');

// var rs = fs.createReadStream('test.md');
var rs = fs.createReadStream('test.md', { highWaterMark: 11 }); // 将文件可读流的每次读取的Buffer长度限制为11.
// rs.setEncoding('utf8')// 让data事件中传递的不再时一个Buffer对象，而是编译后的字符串
// var data = '';
// rs.on("data", function(chunk) {
//   data += chunk;
// });
// rs.on("end", function() {
//   console.log(data);
// });

// 正确的拼接Buffer方式
var chunks = [];
var size = 0;

rs.on("data", function(chunk) {
  chunks.push(chunk);
  size += chunk.length;
});

rs.on("end", function() {
  var buf = Buffer.concat(chunks, size);
  var str = iconv.decode(buf, "utf8");
  console.log(str);
})