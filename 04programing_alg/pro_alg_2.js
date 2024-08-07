/**
 * 1、不用加减乘除运算符，求整数的7倍
 * */ 

// 方法1--位运算
/**
 *  思路：
 * m 和 n 是两个二进制整数，求 m + n：
    1、用与运算求 m 和 n 共同为 “1” 的位： m' = m & n
    2、用异或运算求 m 和 n 其中一个为 “1” 的位： n' = m ^ n
    3、如果 m' 不为 0，那么将 m' 左移一位（进位），记 m = m' << 1，记 n = n'，跳回到步骤 1
    4、如果 m' 为 0，那么 n' 就是我们要求的结果。
    此方法需了解js二进制操作符
    https://www.cnblogs.com/seeks/p/7710977.html
    https://mp.weixin.qq.com/s?__biz=MjM5MDA2MTI1MA==&mid=2649089176&idx=3&sn=9b61f8b45a37be59cf83fbd17e26a29f&chksm=be5bc335892c4a2383b7c2c48a29eeaa9ae66e505b9d967333956376c5c7e1e666d9fe5e4405&scene=27
 * */ 
// 定义位运算加法
function addByBit(m, n){
  while(m) {
    [m, n] = [(m & n) << 1, m ^ n];
    console.log('in while', m, n);
  }
  console.log('in return', m, n);
  return n;
}
// 定义循环累加七次
function multiply7_bit(num) {
  var sum = 0;
  var counter = new Array(7);
  while(counter.length) {
    sum = addByBit(sum, num);
    counter.pop();
  }
  return sum;
}

// console.log(multiply7_bit(6));

// hack 方式 1 - 利用 Function 的构造器 & 乘号的字节码
let multiply7_hack_1 = (num) => 
    new Function(["return ",num,String.fromCharCode(42),"7"].join(""))();

// console.log(multiply7_hack_1(6));

// hack 方式 2 - 利用 eval 执行器 & 乘号的字节码
let multiply7_hack_2 = (num) => 
		eval([num,String.fromCharCode(42),"7"].join(""));

// hack 方式 3 - 利用 SetTimeout 的参数 & 乘号的字节码
// setTimeout(["window.multiply7_hack_3=(num)=>(7",String.fromCharCode(42),"num)"].join(""))

// 进制转换
// 参考位运算我们进行一下思考：二进制整数向左位移一位、末尾补0，可以得到其2倍值；十进制整数向左位移一位、末尾补0，可以得到其10倍值；那么我们也可以依此法来进行七进制整数进位补0，来得到7倍值！
let multiply7_4 = 
    (num)=>parseInt([num.toString(7),'0'].join(''),7);

 /**
 * 2、模拟实现localstorage
 * */ 

 const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null ,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key], 
    clear: () => store = {},
  }
})()

Object.defineProperty(window, 'localStorage2', {
  value: localStorageMock
})

localStorage2.setItem('test', 'test')
console.log(localStorage2.getItem("test"))  //test
localStorage2.removeItem('test')
console.log(localStorage2.getItem("test"));  //null
localStorage2.setItem('test', 'test');
localStorage2.clear();
console.log(localStorage2.getItem("test")); //null

// 上面的方法忽略了 localStorage 的特性，即刷新，关闭页面仍然存在。正解应该是使用能够持久化的方法或者接口，比如 cookie 来模拟实现。
// !window.localStorage && !function(win)
;(function(win) {
  var thousandYears = 1e3 * 365 * 24 * 36e5;
  function getCookies() {
    return document.cookie.match(/([^;=]+)=([^;]+)/g) || [];
  }

  function getExpires(flag){
    flag = flag || 1;
    return 'expires=' + (new Date((+new Date()) + thousandYears * flag)).toUTCString();
  }

  function getItem(key){
    var cookies = getCookies();
    for (let i = 0; i < cookies.length; i++) {
      const cookieItem = cookies[i];
      const params = cookieItem.match(/^\s*([^=]+)=(.+)/);
      if(params[1] === key) {
        return decodeURIComponent(params[2]);
      }
      
    }
  }

  function setItem(key, value, isExpired){
    document.cookie = [
      key + '=' + encodeURIComponent(value),
      getExpires(isExpired ? -1 : 1),
      'path=/'
    ].join('; ');
  }

  function removeItem(key) {
    setItem(key, '', true);
  }

  function clear() {
    var cookies = getCookies();
    for (let i = 0; i < cookies.length; i++) {
      var key = cookies[i].match(/^\s*([^=]+)/)[1]
      removeItem(key);
    }
  }
  Object.defineProperty(win, 'localStorage3', {
    value: {
      getItem,
      setItem,
      removeItem,
      clear,
    }
  })
})(window);

/**
 * 3、localstorage支持expires
 * 存储的时候加个存储时间戳和有效期时长，取的时候判断一下
 * */ 
;(function() {
  var getItem = localStorage.getItem.bind(localStorage);
  var setItem = localStorage.setItem.bind(localStorage);
  var removeItem = localStorage.removeItem.bind(localStorage);
  localStorage.getItem = function(key) {
    var expires = getItem(key + '_expires');
    if(expires && new Date() > new Date(Number(expires))) {
      removeItem(key);
      removeItem(key + '_expires');
    }
    return getItem(key);
  }
  localStorage.setItem = function(key, value, expires) {
    if(typeof expires !== 'undefined') {
      var expiresDate = new Date(expires).valueOf();
      setItem(key + '_expires', expiresDate);
    }
    return setItem(key, value);
  }
})();

/**
 * 4、url有三种情况
    https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=&local_province_id=33
    https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800&local_province_id=33
    https://www.xx.cn/api?keyword=&level1=&local_batch_id=&elective=800,700&local_province_id=33
    匹配elective后的数字输出（写出最优解法）:

    [] || ['800'] || ['800','700']
 * */ 
function getUrlValue(url){
  if(!url) return;
  // 其中：（?<=elective=） 是指匹配以elective=开头的字符串；
  // (\d+(, \d+))指匹配数字开头，可能不定数量逗号分隔后是数字的字符串。
  let res = url.match(/(?<=elective=)(\d+(,\d+)*)/);
  return res ?res[0].split(',') : [];
}


/**
 * 5、考虑到性能问题，如何快速从一个巨大的数组中随机获取部分元素。
      比如有个数组有100K个元素，从中不重复随机选取10K个元素。
 * */ 
function getFromBigArr(itemNums = 10000, bigArrNums = 100000){
  let set = new Set();
  while(true) {
    if(set.length > itemNums - 1) break;
    let temp = parseInt(Math.random() * bigArrNums, 10);
    if(set.has(temp)) continue;
    set.add(temp);
  }
  return Array.from(set);
}

function getFromBigArr2(itemNums = 10000, bigArrNums = 100000){
  const bigArr = Array.from({length: bigArrNums}, (v, i) => i);
  const resultArr = [];
  const keysSet = new Set();
  let count = 0;
  console.time('耗时');
  do {
    const key = Math.floor(Math.random() * (bigArrNums - 1));
    if(keysSet[key] === undefined) {
      resultArr.push(bigArr[key]);
      keysSet[key] = 1;
    }
    count++;
  } while (resultArr.length < itemNums);
  console.timeEnd('耗时');
  console.log(`循环次数：${count}`);
}

/**
 * 6、请写一个函数，完成以下功能
 * 输入： '1, 2, 3, 5, 7, 8, 10'，
 * 输出： '1~3,5,7~8,10'
 * */ 

function collectContinuousNum(numStr){
  var result = [];
  var numList = numStr.split(',').map(item => Number(item));
  var temp = numList[0];
  numList.forEach((number, index) => {
    // 当前数加1是否等于后一个数，若是则说明是连续数字，不做操作
    if(number + 1 !== numList[index + 1]) {
      if(temp !== number) {
        result.push(`${temp}~${number}`);
      } else {
        result.push(number);
      }
      temp = numList[index + 1];
    }
  });
  console.log('collectContinuousNum', result.join(','))
  return result.join(',');
}
const input = "1,2,3,5,7,8,10";
collectContinuousNum(input);

/**
 * 
 * 7、对象平铺
  var entry = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae'
    }
  }

  // 要求转换成如下对象
  var output = {
  'a.b.c.dd': 'abcdd',
  'a.d.xx': 'adxx',
  'a.e': 'ae'
  }
 * */ 

var entry = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae'
    }
}
var output = {
  'a.b.c.d.ff': 'abcdff',
  'a.d.xx': 'adxx',
  'a.e': 'ae'
  }
function flatObj(obj, parentKey = '', result = {}){
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const concatKey = `${parentKey}${key}`;
      if(typeof obj[key] === 'object') {
        flatObj(obj[key], `${concatKey}.`, result)
      } else {
        result[concatKey] = obj[key];
      }
    }
  }
  console.log('flatObj', result);
  return result;
}

flatObj(entry)

/**
 * 8、对象反平铺
 * 遍历对象，如果键名称含有 . 将最后一个子键拿出来，构成对象，
 * 如 {'a.b.c.dd': 'abcdd'} 变为 {'a.b.c': { dd: 'abcdd' }} , 如果变换后的新父键名中仍还有点，递归进行以上操作即可。 
 * */ 
function nested(obj) {
  Object.keys(obj).forEach(k => {
    getNested(k);
  });
  console.log('nested',obj);
  return obj;
  function getNested(key){
    const idx = key.lastIndexOf('.');
    const value = obj[key];
    if(idx !== -1) {
      delete obj[key];
      const mainKey = key.substring(0, idx);
      const subKey = key.substring(idx+1);
      if(obj[mainKey] === undefined) {
        obj[mainKey] = { [subKey]: value}
      } else {
        obj[mainKey][subKey] = value;
      }
      if(/\./.test(mainKey)) {
        getNested(mainKey);
      }
    }
  }
}

nested(output)

/**
 * 10、去重
 *  规则1：如果是数组 则每个元素相等认为两个数组相等
    规则2：如果是对象 则每个键的值都相等则认为两个对象相等
 * */ 

var getType = (function() {
  const typeMap = { 
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object',
    '[object Error]': 'error',
    '[object Symbol]': 'symbol'
  };
  return function getType(obj) {
    if(obj == null) {
      return obj + '';
    }
    const typeStr = Object.prototype.toString.call(obj);
    return typeof obj === 'object' || typeof obj === 'function' ?
      typeMap[typeStr] || 'object' : typeof obj;
  }
})();

/**
* 判断两个元素是否相等
* 在 === 的基础上 有如下扩展规则
* 规则1：如果是数组 则每个元素相等认为两个数组相等
* 规则2：如果是对象 则每个键的值都相等则认为两个对象相等
* @param {any} target 比较元素
* @param {any} other 其他元素
* @returns {Boolean} 是否相等
*/

function isEqual(target, other) {
  const t1 = getType(target);
  const t2 = getType(other);
  if(t1 !== t2) return false; // 类型不同
  if(t1 === 'array') {
    if(target.length !== other.length) return false; // 数组长度不相等
    // every方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。
    return target.every((item, index) => {
      return isEqual(item, other[index]); // 根据数组下标进行数组比较
    })
  }
  if(t2 === 'object') {
    const targetKeys = Object.keys(target);
    const otherKeys = Object.keys(other);
    if(targetKeys.length !== otherKeys.length) return false; // 对象的属性长度不相等
    return targetKeys.every((k, index) => {
      return isEqual(target[k], other[k]);
    })
  }
  return target === other;
}

/**
* 对输入数组按照指定规则进行去重
*
* @param {Array<any>} arr 待去重的数组
* @returns {Array<any>} 去重后的新数组
*/
function unique(arr){
  const result = arr.reduce((calculateArr, current) => {
    const isUnique = !calculateArr.some((item) => isEqual(current, item));
    if(isUnique) {
      calculateArr.push(current);
    }
    return calculateArr;
  },[]);
  return result;
}

console.log('normal', unique([123, "meili", "123", "mogu", 123]));
console.log('array', unique([123, [1, 2, 3], [1, "2", 3], [1, 2, 3], "meili"]));
console.log('object', unique([123, {a: 1}, {a: {b: 1}}, {a: "1"}, {a: {b: 1}}, "meili"]));

/**
 * 11、找出字符串中连续出现最多的字符和个数
 * 'abcaakjbb' => {'a':2,'b':2}
 * 'abbkejsbcccwqaa' => {'c':3}
 * */ 
// 注意，是连续出现最多
function getContinueLongest(str){
  // 正则表达式中的小括号"()"。是代表分组的意思。 如果再其后面出现\1则是代表与第一个小括号中要匹配的内容相同, * 代表匹配零次或多次
  // 注意：\1必须与小括号配合使用
  const arr = str.match(/(\w)\1*/g);
  const maxLen = Math.max(...arr.map(item => item.length));
  const maxObj = arr.reduce((calculateObj, current) => {
    if(current.length === maxLen) {
      calculateObj[current[0]] = maxLen;
    }
    return calculateObj
  }, {});
  return maxObj;
}

console.log(getContinueLongest('abcaakjbb'));
console.log(getContinueLongest('abbkejsbcccwqaa'));

/**
 * 12、统计 1 ~ n 整数中出现 1 的次数
 * */ 

const oneCounter = (n) => {
  let count = 0;
  for (let i = 0; i < n; i++) {
    count += String(i).split('').filter(s => s === '1').length;
  }
  return count;
}

/**
 * 13、扁平化数组转为树结构数组，且要去重
 * 将[{id: 1}, {id: 2, pId: 1}, ...] 的重复数组（有重复数据）转成树形结构的数组 [{id: 1, child: [{id: 2, pId: 1}]}, ...] （需要去重）
 * */ 
function flatArrMapToTree(arr){
  let result = [];
  // 将扁平化数组转为对象，实现去重
  const map = arr.reduce((acc, cur) => {
    acc[cur.id] = cur;
  }, {});
  // 将map对象转为tree数组
  for (const item of map) {
    if(!item.pId) {
      // 非子元素，直接添加到数组中
      result.push(item);
    } else {
      // 子元素，找到对应父节点并添加到对应父节点的child数组中
      const parentNode = map[item.pId];
      parentNode.child = parentNode.child || [];
      parentNode.child.push(item);
    }
  }
}


/**
 * 14、有一堆扑克牌，将牌堆第一张放到桌子上，再将接下来的牌堆的第一张放到牌底，如此往复；

    最后桌子上的牌顺序为： (牌底) 1,2,3,4,5,6,7,8,9,10,11,12,13 (牌顶)；

    问：原来那堆牌的顺序，用函数实现。
  思路：
    正向（操作堆排获取桌牌）： 拿取堆牌的顶牌作为桌牌(顺序为从左到右排列)，接着将堆牌的顶牌放到牌底，循环往复得到桌牌。
    逆向（操作桌排获取堆牌）： 拿取桌牌的顶牌作为堆牌(顺序为从左到右排列)，接着将堆牌的底牌放到牌顶，循环往复得到堆牌。
 * */ 
// 根据桌牌获取堆牌
function getPilePoke(deskArr){
  const pileArr = [];
  let i = 1;
  while(deskArr.length) {
    if(i % 2 === 0 ) {
      let bottomItem = pileArr.shift(); 
      pileArr.push(bottomItem)
    } else {
      let topItem = deskArr.pop(); 
      pileArr.push(topItem)
    }
    i++;
  }
  return pileArr;
}
// 根据堆牌获取桌牌
function getDeskPoke(pileArr){
  const deskArr = [];
  let i = 1;
  while(pileArr.length) {
    if(i % 2 === 0 ) {
      let bottomItem = pileArr.pop(); 
      pileArr.unshift(bottomItem)
    } else {
      let topItem = pileArr.pop(); 
      deskArr.push(topItem)
    }
    i++;
  }
  return deskArr;
}

console.log('堆牌为：', getPilePoke([1,2,3,4,5,6,7,8,9,10,11,12,13]));
console.log('桌牌为：', getDeskPoke([7, 10, 6, 13, 5, 9, 4, 11, 3, 8, 2, 12, 1]));


function wait() {
	return new Promise(resolve =>
		setTimeout(resolve, 10 * 1000)
	)
}

/**
 * await 究竟做了什么,?
 * ````
 * await foo();
 * 执行代码...
 * ```
 * 类似于Promise.resolve(foo()).then(()=>{ 执行代码... })
 * */ 
async function main() {
	console.time();
	const x = await wait(); // 每个都是都执行完才结束,包括setTimeout（10*1000）的执行时间
	const y = await wait(); // 执行顺序 x->y->z 同步执行，x 与 setTimeout 属于同步执行
	const z = await wait();
	console.timeEnd(); // default: 30099.47705078125ms
	
	console.time();
	const x1 = wait(); // x1,y1,z1 同时异步执行， 包括setTimeout（10*1000）的执行时间
	const y1 = wait(); // x1 与 setTimeout 属于同步执行
	const z1 = wait(); // 三个任务发起的时候没有await，可以认为是同时发起了三个异步。之后各自await任务的结果。结果按最高耗时计算，由于三个耗时一样。所以结果是 10 * 1000ms
	await x1;
	await y1;
	await z1;
	console.timeEnd(); // default: 10000.67822265625ms
	
	console.time();
	const x2 = wait(); // x2,y2,z2 同步执行，但是不包括setTimeout（10*1000）的执行时间
	const y2 = wait(); // x2 与 setTimeout 属于异步执行
	const z2 = wait();
	x2,y2,z2;
	console.timeEnd(); // default: 0.065185546875ms
}
// main();


/**
 * setTimeout实现setInterval
 * */ 
