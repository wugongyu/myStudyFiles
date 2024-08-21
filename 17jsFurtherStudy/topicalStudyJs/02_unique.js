
/*数组去重*/ 
// 兼容性好
function unique1(arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    for(var j = 0; j < res.length; j++) {
      if(arr[i] === res[j]) break;
    }
    if(j === res.length) {
      res.push(arr[i]);
    }
  }
  return res;
}
var arrData = [1, 1, '1', '1']
console.log(unique1(arrData))


function unique2(arr) {
  var res = [];
  for(var i= 0; i < arr.length; i++) {
    var current = arr[i];
    // indexof简化内层循环
    if(res.indexOf(current) === -1) {
      res.push(current);
    }
  }
  return res;
}

// 排序后再去重
function unique3(arr) {
  var res = [];
  var previous;
  var sortedArr = arr.concat().sort();
  for (var index = 0; index < sortedArr.length; index++) {
    // 第一个 或相邻元素不相同
    if(!index || previous !== sortedArr[index]) {
      res.push(sortedArr[index])
    }
    previous = sortedArr[index];
  }
  return res;
}
console.log(unique3(arrData), 'unique3')


//isSorted - 表示函数传入的数组是否已排过序，如果为 true，将会采用更快的方法进行去重
// iteratee：传入一个函数，可以对每个元素进行重新的计算，然后根据处理的结果进行去重
function unique(arr, isSorted, iteratee) {
  var res = [];
  var previous = [];
  for (let i = 0; i < arr.length; i++) {
    var current = arr[i];
    var currentComputed = iteratee ? iteratee(current) : current;
    if(isSorted) {
      if(!i || previous !== currentComputed) {
        res.push(currentComputed);
        previous = currentComputed;
      }
    } else if(iteratee) {
      if(previous.indexOf(currentComputed) === -1) {
        previous.push(currentComputed);
        res.push(current);
        // 使用迭代函数处理后的元素，去重后，返回以前的元素
      }
    } else if(res.indexOf(current) === -1){
      res.push(current);
    }
  }
  return res;
}
var arrayData2 = [1, 1, 'a', 'A', 2, 2]
console.log(unique(arrayData2, false, function(item){
  return typeof item == 'string' ? item.toLowerCase() : item
}));

// 去重（区分对象）：优化后的键值对方法
function uniqueObjectArr(arr) {
  var obj = {}
  return arr.filter(function(item, index, arr) {
    var uniqueObjName = typeof item + JSON.stringify(item);
    return obj.hasOwnProperty(uniqueObjName) ? false : obj[uniqueObjName] = true;
  })
}

console.log(uniqueObjectArr([{value: 1}, {value: 2}, { value: 1 }]));

var fuzzyArray = [1, 1, '1', '1', null, null, undefined, undefined, new String('1'), new String('1'), /a/, /a/, NaN, NaN];
console.log(uniqueObjectArr(fuzzyArray));

function uniqueByes6(arr) {
  return [...new Set(arr)];
}