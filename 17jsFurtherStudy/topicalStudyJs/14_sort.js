/*排序*/ 

// 插入排序
function insertionSort(arr) {
  for (var i = 1; i < arr.length; i++) {
    var element = arr[i]; // 当前元素
    // 当前元素与前面已排好顺序的元素做对比
    for (var j = i - 1; j >= 0; j--) {
      var preElement = arr[j];
      var order = preElement - element;
      if(order > 0) {
        // 前面有元素大于当前元素，前面的元素往后挪
        arr[j + 1] = preElement;
      } else {
        break;
      }
    }
    arr[j + 1] = element; // 当前元素位置更新
  }
  return arr;
}

console.log(insertionSort([6, 5, 4, 3, 2, 1]));

// 快速排序
function quickSort(arr) {
  if(arr.length < 2) return arr;
  var pivotIndex = Math.floor(arr.length / 2);
  var pivot = arr.splice(pivotIndex, 1)[0];
  var left = [];
  var right = [];
  for (var i = 0; i < arr.length; i++) {
    var element = arr[i];
    if(element > pivot) {
      right.push(element);
    } else {
      left.push(element);
    }
  }

  return quickSort(left).concat([pivot], quickSort(right));
}

console.log(quickSort([1,3,8, 5, 9, 3,4,7]));
function quickSortInPlace(arr) {
  function swap(arr, a, b) {
    console.log('in swap', arr, a, b)
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }
  function partition(arr, left, right) {
    var pivot = arr[left];
    var storeIndex = left;
    for (var i = left + 1; i <= right; i++) {
      if(arr[i] < pivot) {
        swap(arr, ++storeIndex, i)
      }
    }
    swap(arr, left, storeIndex);
    return storeIndex
  }

  function sort(arr, left, right){
    if(left < right) {
      var storeIndex = partition(arr, left, right);
      sort(arr, left, storeIndex - 1);
      sort(arr, storeIndex + 1, right);
    }
  }

  sort(arr, 0, arr.length - 1); 
  return arr;
}

console.log(quickSortInPlace([6, 5, 4, 3, 2, 1]));
console.log(quickSortInPlace([1,3,8, 5, 9, 3,4,7]));

