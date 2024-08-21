
// 数组扁平化
function flatten(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if(Array.isArray(arr[i])) {
      result = result.concat(flatten(arr[i]))
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

var arr = [1, [2, [3, 4]]];
console.log(flatten(arr));

function flatten2(arr) {
  return arr.reduce(function(prev, current) {
    return prev.concat(Array.isArray(current) ? flatten2(current) : current)
  }, [])
}
console.log(flatten2(arr));

function flatten3(arr) {
  while(arr.some(function(item) {
    return Array.isArray(item)
  })) {
    arr = [].concat(...arr);
  }
  return arr;
}


console.log(flatten3(arr));

/*
 * @param  {Array} input   要处理的数组
 * @param  {boolean} shallow 是否只扁平一层
 * @param  {boolean} strict  是否严格处理元素
 * 当遍历数组元素时，如果元素不是数组，就会对 strict 取反的结果进行判断，
 * 如果设置 strict 为 true，就会跳过不进行任何处理，这意味着可以过滤非数组的元素
 * @param  {Array} output  这是为了方便递归而传递的参数
*/ 
function flattenFinal(input, shallow, strict, output) {
  output = output || [];
  var idIndex = output.length;
  for (var i = 0; i < input.length; i++) {
    var current = input[i];
    if(Array.isArray(current)) {
      if(shallow) {
        var j = 0;
        while (j < current.length) {
          output[idIndex++] = current[j++];
        }
      } else {
        flattenFinal(current, shallow, strict, output);
        idIndex = output.length;
      }
    } else if(!strict){
      output[idIndex++] = current;
    }
  }
  return output
}

console.log(flattenFinal([1, 2, [3, 4]], true, true)); // [3, 4]

_.flatten = function(array, shallow) {
  return flattenFinal(array, shallow, false);
}
// 传入多个数组，然后返回传入的数组的并集（跳过传入的非数组参数）
_.union = function() {
  var result = flattenFinal(arguments, true, true); // 扁平化数组, 跳过传入的非数组参数
  return Array.from(new Set(result)); // 数组去重
}

console.log(_.union([1, 2, 3], [101, 2, 1, 10], 4, 5));

// 取出来自 array 数组，并且不存在于多个 other 数组的元素（跳过传入的非数组参数）



_.difference = function(array, ...rest) {
  rest = flattenFinal(rest, true, true);
  return array.filter(function(item) {
    return rest.indexOf(item) === -1;
  })
}