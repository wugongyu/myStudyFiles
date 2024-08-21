/**偏函数*/ 

function partial(fn) {
  var outerArgs = [].slice.call(arguments, 1);
  return function() {
    var innerArgs = [].slice.call(arguments, 0);
    return fn.apply(this, outerArgs.concat(innerArgs));
  }
}

function add(a, b) {
  return a + b + this.value
}

// var addOne = add.bind(null, 1);
var addOne = partial(add, 1)
var value = 1;
var obj = {
  value: 2,
  addOne: addOne,
}

// console.log(obj.addOne(2)); // 5

function partialFinal(fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
    var len = args.length, i, position = 0;
    for (i = 0; i < len; i++) {
      // i对应的args参数（上一次调用函数的传参）是否是占位符，若是，使用当前函数对应position位置的参数替换，否则不替换
      args[i] = args[i] === _ ? arguments[position++] : args[i];
    }
    // 判断是否完成arguments与args的参数传递
    while(position < arguments.length) {
      args.push(arguments[position++]);
    }
    return fn.apply(this, args);
  }
}
function subtract(a, b) {
  return b - a;
}
console.log(partialFinal(subtract, 5, _)(20)); // 15
console.log(partialFinal(subtract, _, _)(5, 20)); // 15

