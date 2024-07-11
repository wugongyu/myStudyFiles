var count = 1;
var container = document.getElementById('container');
function addCount(e) {
  console.log(this, e);
  container.innerHTML  = ++count;
}
container.onmousemove = debounce(addCount, 1000);

// 防抖
function debounce(fn, wait, imediate) {
  var timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // 修正fn的this指向并且传参
      fn.apply(this, arguments);
    }, wait)
  }
}
 
// 节流
function throttle(fn, wait){
  var canrun = true;
  return function() {
    if(!canrun) return;
    canrun = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      canrun = true;
    }, wait);
  }

}