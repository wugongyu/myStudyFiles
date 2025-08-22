var https = require('https');
var fs = require('fs');

var options = {
  hostname: 'localhost',
  port: 8000,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('./keys/client.key'),
  cert: fs.readFileSync('./keys/client.crt'),
  // rejectUnauthorized: false, // 在数据传输过程中会加密，但无法保证服务器端的证书不是伪造的
  ca: [fs.readFileSync('./keys/ca.crt')], // ！：出现'INVALID_PURPOSE'问题
}

options.agent = new https.Agent(options);

var req = https.request(options, function(res) {
  res.setEncoding('utf-8');
  res.on("data", function(d) {
    console.log(d);
  })
});
req.end();
req.on("error", function(e) {
  console.log(e);
  
})