/*
函数记忆
*/ 
function memorize1(fn) {
  var cache = {};
  return function() {
    var key = arguments.length + Array.prototype.join.call(arguments, ',');
    if(cache[key]) {
      console.log('in cache');
      return cache[key];
    } else {
      console.log('in callee');
      return cache[key] = fn.apply(this, arguments);
    }
  }
}


function add(a, b) {
  return a + b;
};
var memoryAdd = memorize1(add);
memoryAdd(1, 2); // in callee
memoryAdd(1, 2); // in cache

function memorize2(fn, hashHandler) {
  var memorize = function(key) {
    var cache = memorize.cache;
    // 默认使用 function 的第一个参数作为 key,自定义参数key需传入处理函数hashHandler
    var targetKey = '' + (hashHandler ? hashHandler.apply(this, arguments) : key);
    if(!cache[targetKey]) {
      return cache[targetKey] = fn.apply(this, arguments)
    }
    return cache[targetKey];
  }
  memorize.cache = {};
  return memorize;
}

var memoryAdd2 = memorize2(add);
console.log(memoryAdd2(1, 2)); // 3
console.log(memoryAdd2(1, 3)); // 3

var memoryAdd3 = memorize2(add, function() {
  var args = Array.prototype.slice.call(arguments); 
  return JSON.stringify(args);
});
console.log(memoryAdd3(1, 2)); // 3
console.log(memoryAdd3(1, 3)); // 4

// 斐波那契数列
var fibonacciCount = 0;
function fibonacci(n) {
  fibonacciCount++;
  return n < 2 ? n : fibonacci(n-1) + fibonacci(n - 2);
} 
for (var i = 0; i < 11; i++) {
  fibonacci(i);
}
console.log(fibonacciCount) // 453

console.log('---------------');
fibonacciCount = 0;
fibonacci = memorize2(fibonacci);
for (var i = 0; i < 11; i++) {
  fibonacci(i);
}
console.log(fibonacciCount) // 12



