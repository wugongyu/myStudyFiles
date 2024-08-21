/*深浅拷贝*/ 
function shallowCopy(obj) {
  var objType = typeof obj;
  if(obj === null || objType !== 'object') return obj;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    // for in 不仅遍历对象自身属性，还会遍历继承的inumerable 属性，这里只拷贝自身属性，所以需要使用hasOwnProperty判断
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[k] = obj[key];
      
    }
  }
  return newObj;
}

console.log(shallowCopy(null));

function deepClone(obj) {
  if(obj === null || typeof obj !== 'object') return obj;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] = (obj === null || typeof obj !== 'object') ? obj[key] : deepClone(obj[key]);
    }
  }
  return newObj;
}

var cloneOriginObj = {
  name: '1',
  value: 16,
  z: null,
  arr: [1, 2,44]
}

var newCloneObj = deepClone(cloneOriginObj);
newCloneObj.arr.push(88);
console.log(newCloneObj, cloneOriginObj);

function extend1() {
  var target = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var currentItem = arguments[i];
    if(currentItem != null) {
      for (var name in currentItem) {
        var copyItem = currentItem[name];
        if(copyItem !== undefined) {
          target[name] = copyItem;
        }
      }
    }
  }
  return target;
}
var extendObj1 = {
  a: 1,
  b: { b1: 1, b2: 2 }
};

var extendObj2 = {
  b: { b1: 3, b3: 4 },
  c: 3
};

var extendObj3 = {
  d: 4
}
// var copyExtendObj = extend1(extendObj1, extendObj2, extendObj3)
// copyExtendObj.b.b1 = 55
// console.log(copyExtendObj, extendObj2);

function extend2() {
  var deep = false; // 是否深克隆，默认否
  var target = arguments[0] || {};
  var copyIsArray;
  var i = 1;
  if(typeof target === 'boolean') {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  // 非对象，非函数，target设置为{}
  if(typeof target !== 'object' && checkTypeFinal(target) !== 'function') {
    target = {};
  }
  for (; i < arguments.length; i++) {
    var currentItem = arguments[i];
    if(currentItem != null) {
      for (var name in currentItem) {
        var srcItem = target[name];
        var copyItem = currentItem[name];
        var tempSrcItem;
        // 解决循环引用：判断要复制的对象属性是否等于 target，如果等于，则跳过此次循环
        if(copyItem === target) {
          continue;
        }
        /*
        判断目标属性值跟要复制的对象的属性值类型是否一致:
          如果待复制对象属性值类型为数组，目标属性值类型不为数组的话，目标属性值就设为 []
          如果待复制对象属性值类型为对象，目标属性值类型不为对象的话，目标属性值就设为 {}
        */ 
        if(deep && copyItem && (isPlainObject(copyItem) || 
          (copyIsArray = Array.isArray(copyItem)))) {
          if(copyIsArray) {
            copyIsArray = false;
            tempSrcItem = srcItem && Array.isArray(srcItem) ? srcItem : []; 
          } else {
            tempSrcItem = srcItem && isPlainObject(srcItem) ? srcItem : {};
          }
          target[name] = extend2(deep, tempSrcItem, copyItem);
        } else if(copyItem !== undefined) {
          target[name] = copyItem;
        }
      }
    } 
  }
  return target;
}

var copyExtendObj1 = extend2(true, extendObj1, extendObj2, extendObj3)
copyExtendObj1.b.b1 = 55
console.log(copyExtendObj1, extendObj2);



var a = extend2(true, [4, 5, 6, 7, 8, 9], [1, 2, 3]);
console.log(a)

var obj1 = {
  value: {
      3: 1
  }
}

var obj2 = {
  value: [5, 6, 7],

}

var b = extend2(true, obj1, obj2)
console.log(obj1); // 此时obj1已经被改变
var c = extend2(true, obj2, obj1)
// console.log(b);
console.log(c);