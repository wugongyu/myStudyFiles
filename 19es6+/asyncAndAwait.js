/*
async -- generator函数的语法糖
*/

function getData()  {
  return new Promise(function (resolve){
      return setTimeout(function() {resolve('data')}, 1000)
    }  
  )
}

async function test() {
  var data = await getData();
  console.log('data：', data);
  var data2 = await getData();
  console.log('data2：', data2);
  return 'success';
}

test().then(res => console.log(res)); 
/*
data： data
data2： data
success
*/

/*
generator函数是不会自动执行的
*/ 
function *test2() {
  var data = yield getData();
  console.log('data', data);
  var data2 = yield getData();
  console.log('data2', data2);
  return 'success';
}

function *myGenerator() {
  // yield '1';
  // yield '2';
  // return '3';
  console.log(yield '1');
  console.log(yield '2');
  console.log(yield '3');
  
  
  
}

const gen = myGenerator();
gen.next();
gen.next('test1'); // test1
gen.next('test2'); // test2
gen.next('test3'); // test3


// 生成器值得传递
function *myGenerator2() {
  const a = yield 12;
  const b = yield a + 1;
  const c = yield b + 2;
  yield c + 3;
}
const gen2 = myGenerator2();
console.log(gen2.next(111).value); // 12
console.log(gen2.next(8).value); // 9
console.log(gen2.next(20).value); // 22
console.log(gen2.next(80).value); // 83
console.log(gen2.next().done); // true

function *fibonacciSequence() {  
  let x = 0, y = 1;  
  for(;;) {   
       yield y;    
      [x, y] = [y, x+y]; 
}}
// 1 1
// 

function* take(n, iterable) {  
  let it = iterable[Symbol.iterator](); 
    while(n-- > 0) {        
          let next = it.next();  
  if (next.done){
      return;
  }    
  else { 
      yield next.value
  }; 
}}

console.log([...take(5, fibonacciSequence())])
//[ 1, 1, 2, 3, 5 ]


// async await的实现
// 1. 执行器
function runGenerator(gen) {
  // 先获取迭代器
  var g = gen();
  // 递归执行g.next()
  function _next(val) {
    var res = g.next(val);
    if(res.done) return res.value;
    // Promise.then()的时候都去执行_next()，实现自动迭代的效果
    res.value.then(function(v) {
      _next(v)
    })
  }
  _next();
}

function *myGenerator3() {
  console.log(Promise.resolve(1));
  console.log(Promise.resolve(2));
  console.log(Promise.resolve(3));
}

// runGenerator(myGenerator3)


function runGeneratorFinal(gen) {
  // 返回一个promise
  return new Promise(function(resolve, reject){
    var g = gen();
    function _next(val) {
      // 错误处理
      try {
        var res = g.next(val);
      } catch (error) {
        return  reject(error);
      }
      if(res.done) {
        return resolve(res.value);
      } else {
        //res.value包装为promise，以兼容yield后面跟基本类型的情况
        Promise.resolve(res.value).then(
          function(v){ _next(v)},
          function(err) { g.throw(err) }
        )
      }

    }
    _next();
  })
}

function* myGenerator4() {
  try {
    console.log(yield Promise.resolve(1)) 
    console.log(yield 2)   //2
    console.log(yield Promise.reject('error'))
  } catch (error) {
    console.log(error)
  }
}

runGeneratorFinal(myGenerator4)







