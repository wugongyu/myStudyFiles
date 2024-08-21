/*
函数柯里化
*/ 

var _ = {};
function currying(fn) {
  var args = [].slice.call(arguments, 1); // 获取除调用函数外的剩余参数
  return function() {
    var innerArgs = [].slice.call(arguments);
    return fn.apply(this, args.concat(innerArgs));
  }
}

function add(a, b) {
  console.log(a + b);
  return a + b;
}

var addCurrying = currying(add, 2, 3);
addCurrying();

function curryingSecond(fn, length) {
  length = length || fn.length; // function的length属性（指实例对象/已定义的函数）它表示该函数的形参个数
  var arraySlice = Array.prototype.slice;
  return function() {
    // 实参个数小于（剩余）形参个数
    if(arguments.length < length) {
      var combinedArgs = [fn].concat(arraySlice.call(arguments));
      return curryingSecond(currying.apply(this, combinedArgs), length - arguments.length);
    }
    return fn.apply(this, arguments);
  }
}

var testCurry = curryingSecond(function(a, b, c) {
  console.log([a, b, c]);
  return [a, b, c];
})
testCurry('a', 'b', 'c');// ['a', 'b', 'c']
testCurry('a')('b', 'c'); // ['a', 'b', 'c']
testCurry('a')('b')('c');// ['a', 'b', 'c']
testCurry('a','b')('c');// ['a', 'b', 'c']



function curryingSimple(fn, args) {
  length = fn.length;
  args = args || [];
  return function() {
    var _args = args.slice(0), arg, i;
    for (var i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      _args.push(arg);
    }
    if(_args.length < length) {
      return curryingSimple.call(this, fn, _args);
    } else {
      return fn.apply(this, _args);
    }
  }
}

/**
 * 函数柯里化，参数可使用占位符进行占位，注意，占位是边执行边填补的
 * */ 
function curryingHolders(fn, args, holders) {
  args = args || [];
  holders = holders || []; // 记录占位符下标位置
  var length = fn.length;
  return function() {
    var _args = args.slice(0), // 上一次执行完毕后的参数
    _holders = holders.slice(0),// 上一次执行完毕后的占位符数组 
    argsLen = _args.length, // 上一次执行完毕后的参数长度 
    holdersLen = _holders.length, // 上一次执行完毕后的占位符数组长度 
    arg, i, index = 0;
    for (i = 0; i < arguments.length; i++) {
      arg = arguments[i];// 当前执行函数参数
      if(arg === _ && holdersLen) {
        // 上一组占位符数组不为空，且执行函数的当前参数为占位符
        //  处理类似 fn(_, 2)(_, _, 4) 这种情况，index 需要指向 holders 正确的下标

        index++; // 占位符索引
        if(index > holdersLen) {
          _args.push(arg);
          // 新增占位符，数值为： 上一组参数长度减一， 加上 (占位符索引减去上一组占位符数组长度)(即新增占位符长度)
          _holders.push(argsLen - 1 + (index - holdersLen)); 
        }
      } else if(arg === _) {
        // 上一组占位符数组为空，执行函数的当前参数为占位符
        // 处理类似 fn(1)(_) 或是 fn(1, _, _)这种情况

        _args.push(arg);
        _holders.push(argsLen + i);
      
      } else if(holdersLen) {
        // 上一组占位符数组不为空，执行函数的当前参数不为占位符
      //  处理类似 fn(_, 2)(1) 这种情况

        //  fn(_, 2)(_, 3)
        if (index >= holdersLen) {
          _args.push(arg);
        }
        //  fn(_, 2)(1) 用参数 1 替换占位符
        // else {
        //   _args.splice(_holders[index], 1, arg); // 替换占位符
        //   _holders.splice(index, 1); // 删除
        // }
        else {
          // 改动， 添加判断
          // 如果占位符被消耗完了还继续添加参数的话只会添加到第一个位置而不会新增，原因是_args.splice(_holes[index], 1, arg);中_holes[index]是undefined
          if (_holders.length) {
            _args.splice(_holders[index], 1, arg);
            _holders.splice(index, 1)
          } else {
            _args.push(arg);
          }
        }
      
      } else {
        // 上一组占位符数组为空，执行函数的当前参数不为占位符
        _args.push(arg);
      }
    }
    if(_holders.length || _args.length < length) {
      return curryingHolders.call(this, fn, _args, _holders);
    } else {
      return fn.apply(this, _args);
    }
  }
}

/*
占位符是边传边填补的，也就是说fn(_, 2)(_, _, 4)(1)(3)(5)第二个函数里的占位符会填补第一个函数的占位符，
可以理解为占位符顺延。对于第二个函数的参数来说，第一个占位符表示填充第一个函数中的占位符，
此时占位符填满了，第二个占位符会新增上去。然后参数1填充第一个占位符，参数3填充第二个占位符，此时占位符已经用完了，参数5添加到末尾。
数组分别是[_, 2]、[_, 2, _, 4]、[1, 2, _, 4]、[1, 2, 3, 4]、[1, 2, 3, 4, 5]。

这里理解的关键是第二个占位符（第二个函数中的第一个占位符）会顺延第一个占位符到下一个函数，而不是新增一个占位符。

*/ 

var testCurry2 = curryingHolders(function(a, b, c, d, e) {
  console.log([a, b, c, d, e]);
  return [a, b, c, d, e];
});
// testCurry2(1, 2, 3, 4, 5);
// testCurry2(_, 2, 3, 4, 5)(1);
// testCurry2(1, _, 3, 4, 5)(2);
// testCurry2(1, _, 3)(_, 4)(2)(5);
// testCurry2(1, _, _, 4)(_, 3)(2)(5);
testCurry2(_, 2)(_, _, 4)(1)(3)(5);
// testCurry2(1, _, _, 4)(2, 3, 5);
// testCurry2(1, _)(2, 3, 4, 5);

// 不定参函数
function addCurry(...params) {
  var addSum = params.reduce(function(prev, cur){
    return prev + cur;
  }, 0);
  var fn = function(...innerParams) {
    var innerSum = innerParams.reduce(function(prev, cur) {
      return prev + cur;
    }, 0);
    return addCurry.call(this, addSum, innerSum);
  }
  fn.toString = function() {
    return addSum;
  };
  return fn;
}
console.log(+addCurry(1, 2, 4)(7, 8, 9));

function curryingWithHolders(fn, args, holders) {
  args = args || [];
  holders = holders || [];
  return function() {
    var _args = args.slice(0),
    _holders = holders.slice(0),
    argsLen = _args.length,
    holdersLen = _holders.length,
    arg, i, index = 0;
    for (i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      if(arg === _ && holdersLen) {
        index ++;
        if(index > holdersLen) {
          _args.push(arg);
          _holders.push((argsLen - 1) + (index - holdersLen));
        }
      } else if(arg === _) {
        _args.push(arg);
        _holders.push(argsLen + i);
      } else if(holdersLen) {
        if(_holders.length) {
          _args.splice(_holders[index], 1, arg);
          _holders.splice(index, 1);
        } else {
          _args.push(arg);
        }
      } else {
        _args.push(arg);
      }
    }
    if(_holders.length || (_args.length < fn.length)) {
      return curryingWithHolders.call(this, fn, _args, _holders);
    } else {
      return fn.apply(this, _args);
    }
  }
}




