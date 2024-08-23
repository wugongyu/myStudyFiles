// 乱序-- Fisher–Yates 算法，真正实现数组乱序
function shuffle(arr) {
  var i, j, element;
  for ( i = arr.length; i; i--) {
    element = arr[i - 1];
    j = Math.floor(Math.random() * i);
    arr[i - 1] = arr[j];
    arr[j] = element;
  }
  return arr;
}

function shuffleByEs6(arr) {
  for (let i = arr.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]]
  }
  return arr;
}

// 数组乱序--洗牌算法
function shuffle2(arr)  {
  var result = [];
  while(result.length < arr.length) {
    var temp;
    do {
      temp = arr[~~(Math.random() * arr.length)]; // ~~表示的就是两次取反的自然结果，保持原值
    } while (result.includes(temp));
    result.push(temp);
  }
  return result;
}

console.log(shuffle([1,2,3,4,5]));
console.log(shuffle2(['a', 'b', 'c', 'd', 'e', 'f']));


var times = 100000;
var res = {};

for (var i = 0; i < times; i++) {
    var arr = shuffle([1, 2, 3]);

    var key = JSON.stringify(arr);
    res[key] ? res[key]++ :  res[key] = 1;
}

// 为了方便展示，转换成百分比
for (var key in res) {
    res[key] = res[key] / times * 100 + '%'
}
console.log(res, 'shuffle --the number of arr appearance percent'); 
/*
{
    "[1,3,2]": "16.773%",
    "[3,2,1]": "16.733%",
    "[1,2,3]": "16.730999999999998%",
    "[3,1,2]": "16.813%",
    "[2,1,3]": "16.429%",
    "[2,3,1]": "16.521%"
}
*/

var times2 = 1000000;
var aAppearanceLocations = new Array(10).fill(0);
for (var i = 0; i < times2; i++) {
    var arr = shuffle2(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    aAppearanceLocations[arr.indexOf('a')] ++;
}
console.log('100万次循环，a字母在每个位置出现的次数', aAppearanceLocations); // [99769, 100337, 100249, 100111, 100506, 99638, 100322, 99982, 99804, 99282]




