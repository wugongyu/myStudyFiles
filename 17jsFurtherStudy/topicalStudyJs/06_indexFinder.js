
/*元素查找*/ 
function createIndexFinder1(dir) {
  return function(array, indicator, context) {
    var i = dir > 0 ? 0 : array.length - 1
    for (; i >= 0 && i < array.length; i += dir) {
      if(indicator.call(context, array[i], i, array)) return i;
    }
    return -1;
  }
}
var findIndex = createIndexFinder1(1);
var findLastIndex = createIndexFinder1(-1);

console.log(findIndex([10, 20, 20, 30, 40, 50], function(item) {
  return item === 20
})); // 1

// 有序数组使用二分查找法插入相应元素，返回插入位置下标
function sortedIndex(array, obj) {
  var low = 0;
  var high = array.length;
  while(low < high) {
    var mid = Math.floor((low + high) / 2);
    if(array[mid] < obj) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return high;
}

function contextBind(fn, context) {
  return function(obj) {
    return fn ? fn.call(context, obj) : obj;
  }
}

// iteratee对数组的每一个元素进行处理 context-指定的上下文
function sortedIndexFinal(array, obj, iteratee, context) {
  iteratee = contextBind(iteratee, context);
  var low = 0, high = array.length;
  while(low < high) {
    var mid = Math.floor((low + high) / 2);
    if(iteratee(array[mid]) < iteratee(obj)) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return high;
}

console.log(sortedIndexFinal([10, 20, 30, 40, 50], 35)) // 3

/*
创建indexOf，lastIndexOf
@param dir 正数--创建indexOf，负数--创建lastIndexOf
return function
function 参数：
  @param array查询数组
  @param item 查询项
  @param idIndex 开始查找位置

数组的 indexOf 参数 fromIndex：
设定开始查找的位置。如果该索引值大于或等于数组长度，
意味着不会在数组里查找，返回 -1。
如果参数中提供的索引值是一个负值，则将其作为数组末尾的一个抵消，即 -1 表示从最后一个元素开始查找，
-2 表示从倒数第二个元素开始查找 ，以此类推。 
注意：如果参数中提供的索引值是一个负值，仍然从前向后查询数组。
如果抵消后的索引值仍小于 0，则整个数组都将会被查询。其默认值为 0。

lastIndexOf 的 fromIndex：
从此位置开始逆向查找。默认为数组的长度减 1，即整个数组都被查找。
如果该值大于或等于数组的长度，则整个数组会被查找。
如果为负值，将其视为从数组末尾向前的偏移。
即使该值为负，数组仍然会被从后向前查找。
如果该值为负时，其绝对值大于数组长度，则方法返回 -1，即数组不会被查找。
*/
function createIndexOfFinder1(dir) {
  return function(array, item, idIndex) {
    var length = array.length;
    var i = 0;
    if(typeof dir === 'number') {
      if(dir > 0) {
        i = idIndex >= 0 ? idIndex : Math.max(idIndex + length, 0);
      } else {
        length = idIndex >= 0 ? Math.min(idIndex + 1, length) : (idIndex + length + 1);
      }
    }
    for (idIndex = (dir > 0 ? i : length -1); idIndex >= 0 && idIndex < length; idIndex += dir) {
      if(array[idIndex] === item) return;
    }
    return -1;
  }
}

// var indexOf = createIndexOfFinder1(1);
// var lastIndexOf = createIndexOfFinder1(-1);

/*
优化：
1. 支持查找NaN
2. 支持有序数组二分法查找
*/ 
function createIndexOfFinderFinal(dir, indicate, sortedIndex) {
  return function (array, findItem, idIndex) {
    var i = 0, length = array.length;
    if(typeof dir === 'number') {
      if(dir > 0) {
        // 确定正向起始位置
        i = idIndex >= 0 ? idIndex : Math.max(length + idIndex, 0);
      } else {
        // 确定逆向起始位置
        length = idIndex >= 0 ? Math.min(idIndex + 1, length) : (idIndex + length + 1);
      }
    } else if(sortedIndex && idIndex && length) {
      // 第三个参数idIndex不传开始搜索的下标值，而是一个布尔值 true，就认为数组是一个排好序的数组，这时候，就会采用更快的二分法进行查找
      idIndex = sortedIndexFinal(array, findItem);
      // 如果该插入的位置的值正好等于元素的值，说明是第一个符合要求的值
      return array[idIndex] === findItem ? idIndex : -1;
    }
    if(findItem !== findItem) {
      // 判断查找元素是否NaN
      idIndex = indicate(array.slice(i, length), isNaN);
      return idIndex >= 0 ? idIndex + i : -1;
    }
    for (idIndex = (dir > 0 ? i : length - 1); idIndex >= 0 && idIndex < length; idIndex += dir) {
      if(array[idIndex] === findItem) return idIndex;
    }
    return -1;
  }
}

var indexOf = createIndexOfFinderFinal(1, findIndex, sortedIndexFinal);
var lastIndexOf = createIndexOfFinder1(-1, findLastIndex, sortedIndexFinal);