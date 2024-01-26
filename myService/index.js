const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// 处理请求 的content-type 为application/json
app.use(bodyParser.json())

//处理请求的content-type 为application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// 允许所有源跨域访问
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  next()
});

app.get('/user', (req, res) => {
  console.log(req.query);
  res.send({
    data: {
      name: '张三三',
      phone: '13787365179',
      department: '招标二部',
      company: '集团有限公司',
    },
    message: '成功',
    code: 200,
  })
})


app.post('/user', (req, res) => {
  //console.log(req.body)
  res.send('成功接收')
})
app.listen(3008, () => {
  console.log('服务启动')
})