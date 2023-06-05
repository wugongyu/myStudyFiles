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