var data = {};
function defineReactive(data, key, val){
  // var dep = []; // 依赖
  var dep = new Dep();
  // 变化追踪
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      // this.dep.push(window.target); // 收集依赖（假定依赖为window.target的一个函数）
      this.dep.depend()
      return data[key];
    },
    set: function(newVal) {
      if(val === newVal) {
        return
      }
      this.dep.notify();
      // for (let i = 0; i < this.dep.length; i++) {
      //   // this.dep[i](val, newVal); // 触发依赖
      // }
      data[key] = newVal
    }
  })
}

function remove(arr, item) {
  if(!arr.length) return;
  const index = arr.indexOf(item);
  if(index > -1) {
    arr.splice(index, 1);
  }
}

class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    remove(this.subs, sub)
  }
  depend() {
    if(window.target) {
      this.addSub(window.target)
    }
  }
  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}