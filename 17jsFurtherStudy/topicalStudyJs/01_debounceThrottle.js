var container = document.getElementById('container');
var count = 1;
var _ = {};
function getActionCount() {
  container.innerHTML = count++;
}
// container.onmousemove = getActionCount;
// var setUseAction = debounce(getActionCount, 1000, true);
// container.onmousemove = setUseAction;
// document.getElementById('button').addEventListener('click', function() {
//   setUseAction.cancel();
// })

/*防抖*/ 
function debounce(func, wait, immediate) {
  var timeout, result;
  var debounced = function() {
    var context = this;
    var args = arguments;
    if(timeout) clearTimeout(timeout);
    if(immediate) {
      // 如果已经执行过，不再执行。
      var callNow = !timeout;
      timeout = setTimeout(function() {
        timeout = null;
      }, wait);
      if(callNow) {
        result = func.apply(context, args);
      }
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait)
    }
    return result;
  }
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  }
  return debounced;
}

// var setUseAction = throttle(getActionCount, 3000, {
//   trailing: false
// });
// container.onmousemove = setUseAction;
// document.getElementById('button').addEventListener('click', function() {

// })

/*节流*/ 
// 利用时间戳
function throttle1(func, wait) {
  var context, args;
  var previous = 0;
  return function() {
    var now = +new Date(); // 获取当前时间戳
    args = arguments;
    context = this;
    if(now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  }
}

// 设置定时器
function throttle2(func, wait) {
  var context, args;
  var timeout;
  return function() {
    context = this;
    args = arguments;
    if(!timeout) {
      timeout = setTimeout(function(){
        func.apply(context, args);
        timeout = null;
      }, wait)
    }
  }
}

// 两者结合： 鼠标移入能立刻执行，停止触发的时候还能再执行一次
function throttle3(func, wait) {
  var context, args, timeout;
  var previous = 0;
  var later = function() {
    previous = +new Date();
    timeout = null;
    func.apply(context, args);
  }
  var throttled = function() {
    var now = +new Date();
    context = this;
    args = arguments
    // 下次触发func剩余的时间
    var remaining = wait - (now - previous);
    // 无剩余时间或修改了系统时间
    if(remaining <= 0 || remaining > wait) {
      if(timeout){
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if(!timeout) {
      timeout = setTimeout(later, remaining);
    }
  }
  return throttled;
}
/*
优化
设置个 options 作为第三个参数，然后根据传的值判断到底哪种效果，约定:
leading：false 表示禁用第一次执行
trailing: false 表示禁用停止触发的回调
*/ 
function throttle(func, wait, options) {
  var context, args, timeout;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = (options.leading === false) ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if(!timeout) {
      context = args = null;
    }
  }
  var throttled = function() {
    context = this;
    args = arguments;
    var now = +new Date();
    if(!previous && options.leading === false) {
      previous = now;
    }
    var remaining = wait - (now - previous);
    if(remaining <= 0 || remaining > wait) {
      if(timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if(!timeout) context = args = null;
    } else if(!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  }
  throttled.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  }
  return throttled;
}

function throttleFinal(func, wait, options) {
  var context, args, timeout;
  var previous = 0;
  if(!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if(!timeout) {
      context = args = null;
    }
  }
  var throttled = function() {
    context = this;
    args = arguments;
    var now = new Date().getTime();
    if(!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    if(remaining <= 0 || remaining > wait) {
      if(timeout) {
        clearTimeout(timeout);
        timeout = null;
        if(!timeout) context = args = null;
      }
      previous = now;
      func.apply(context, args);
    } else if(!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  }
  throttled.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  }
}