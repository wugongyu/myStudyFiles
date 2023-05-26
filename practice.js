class LazyManClass {
  constructor(name) {
    this.taskList = [];
    this.name = name;
    console.log(`Hi I am ${this.name}`);
    setTimeout(() => {
      this.next();
    }, 0)
  }
  eat(thing) {
    var that = this;
    // 立即执行函数是为了在内部函数还没有执行的时候就
    // 已经为内部函数绑定好了对应参数的值，如果不用立即函数的话也可以用bind方法
    // var fn = function (tName){
    //   console.log(`I am eating ${tName}`)
    //   this.next()
    //  }.bind(null, thing);
    var fn = (function(tName){
      return function() {
        console.log(`I am eating ${tName}`);
        that.next();
      }
    })(thing);
    this.taskList.push(fn);
    return this;
  }
  sleep(time) {
    var that = this;
    var fn = (function(t){
      return function() {
        setTimeout(() => {
          console.log(`等待了${t}秒...`);
          that.next();
        }, t * 1000)
      }
    })(time);
    this.taskList.push(fn);
    return this;
  }
  sleepFirst(time) {
    var that = this;
    var fn = (function(t){
      return function() {
        setTimeout(() => {
          console.log(`等待了${t}秒...`);
          that.next();
        }, t * 1000)
      }
    })(time);
    this.taskList.unshift(fn);
    return this;
  }
  next() {
    var fn = this.taskList.shift();
    fn && fn();
  }
}

function LazyMan(name) {
  return new LazyManClass(name);
}
LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(4).eat('junk food');