
/*
each的实现
依赖 03_checkType.js中的isArrayLike方法
*/ 
function eachWithCall(obj, callback) {
  var i = 0, length;
  if(isArrayLike(obj)) {
    length = obj.length;
    for (; i < length; i++) {
      if(callback.call(obj[i], i, obj[i]) === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      if (Object.hasOwnProperty.call(obj, i)) {
        if(callback.call(obj[i], i, obj[i])=== false) {
          break;
        }
      }
    }
  }
  return obj;
}

function eachNormal(obj, callback) {
  var i = 0, length;
  if(isArrayLike(obj)){
    length = obj.length;
    for (; i < length; i++) {
      callback(i, obj[i]);
    }
  } else {
    for (i in obj) {
      if (Object.hasOwnProperty.call(obj, i)) {
        callback(i, obj[i]);
      }
    }
  }
  return obj;
}

var testArr = Array.from({length: 1000000}, (v, i) => i);


console.time('for loop');
var forLoopResult = 0;
for (let index = 0; index < testArr.length; index++) {
  forLoopResult += testArr[index];
}
console.timeEnd('for loop');

console.time('eachNormal loop');
var eachNormalLoopResult = 0;
eachNormal(testArr, function(i, item) {
  eachNormalLoopResult += item;
})
console.timeEnd('eachNormal loop');

console.time('eachWithCall loop');
var eachWithCallResult = 0;
eachWithCall(testArr, function(i, item) {
  eachWithCallResult += item;
})
console.timeEnd('eachWithCall loop');

/*
for loop: 13.4189453125 ms
eachNormal loop: 11.755126953125 ms
eachWithCall loop: 29.492919921875 ms
通过时长对比，由此可以推测出，call 会导致性能损失，但也正是 call 的存在，才能将 this 指向循环中当前的元素。
有利有弊。
*/ 
