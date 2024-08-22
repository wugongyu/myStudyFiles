/*函数组合*/ 
// 依赖09_curry.js中的curry方法
function compose() {
  var args = [].slice.call(arguments);
  var startIndex = args.length - 1;
  return function() {
    var i = startIndex;
    var result = args[i].apply(this, arguments);
    while(i--) {
      result = args[i].call(this, result);
    }
    return result;
  }
}

// pointFree
function toUpperCase(x) {
  return x.toUpperCase();
}
function hello(x) {
  return 'HELLO, ' + x;
}

var greet = compose(hello, toUpperCase);
console.log(greet('melody'));


// input: 'kevin daisy kelly'，output: 'K.D.K'
function initials(str) {
  return str.split(' ').map(item => item.slice(0, 1).toUpperCase()).join('.');
}
// console.log(initials('kevin daisy kelly'));

var split = curry(function(separator, str) {
  return str.split(separator);
})

var getHeadStr = curry(function(str) {
  return str.slice(0, 1);
})

var toUpperCase = curry(function(str) {
  return str.toUpperCase();
});

var map = curry(function(fn, arr) {
  return arr.map(fn);
});

var join = curry(function(joinStr, arr) {
  return arr.join(joinStr);
})

var initials = compose(join('.'), map(compose(toUpperCase, getHeadStr)), split(' '));

console.log(initials('kevin daisy kelly'));

// 写一个名为 getIncompleteTaskSummaries 的函数，接收一个 username 作为参数，从服务器获取数据，
// 然后筛选出这个用户的未完成的任务的 ids、priorities、titles、和 dueDate 数据，并且按照日期升序排序。
var data = {
  result: "SUCCESS",
  tasks: [
      {id: 104, complete: false,            priority: "high",
                dueDate: "2023-11-29",      username: "Scott",
                title: "Do something",      created: "9/22/2023"},
      {id: 105, complete: false,            priority: "medium",
                dueDate: "2023-11-22",      username: "Lena",
                title: "Do something else", created: "9/22/2023"},
      {id: 107, complete: true,             priority: "high",
                dueDate: "2023-11-22",      username: "Mike",
                title: "Fix the foo",       created: "9/22/2023"},
      {id: 108, complete: false,            priority: "low",
                dueDate: "2023-11-15",      username: "Punam",
                title: "Adjust the bar",    created: "9/25/2023"},
      {id: 110, complete: false,            priority: "medium",
                dueDate: "2023-11-15",      username: "Scott",
                title: "Rename everything", created: "10/2/2023"},
      {id: 112, complete: true,             priority: "high",
                dueDate: "2023-11-27",      username: "Lena",
                title: "Alter all quuxes",  created: "10/5/2023"}
  ]
};

var getProperty = curry(function(name, obj) {
  return obj[name];
});

var isPropertyEqual = curry(function(name, value, obj) {
  return obj[name] === value;
});

var filter = curry(function(fn, arr) {
  arr = arr || [];
  return arr.filter(fn);
});

var pickByPropertyName = curry(function(props, obj){
  var result = {};
  for (var index = 0; index < props.length; index++) {
    result[props[index]] = obj[props[index]];
  }
  return result;
});

var sortBy = curry(function(fn, arr) {
  return arr.sort(function(a, b) {
    a = fn(a);
    b = fn(b);
    return a < b ? -1 : a > b ? 1 : 0;
  })
});

var fetchData = function() {
  return Promise.resolve(data);
}

var getIncompleteTaskSummaries = function(username) {
  return fetchData()
    .then(getProperty('tasks'))
    .then(filter(isPropertyEqual('username', username)))
    .then(filter(isPropertyEqual('complete', false)))
    .then(map(pickByPropertyName(['id', 'dueDate', 'title', 'priority'])))
    .then(sortBy(getProperty('dueDate')))
}

// 利用compose
var getIncompleteTaskSummaries2 = function(username) {
  return fetchData()
    .then(
      compose(
        sortBy(getProperty('dueDate')),
        map(pickByPropertyName(['id', 'dueDate', 'title', 'priority'])),
        filter(isPropertyEqual('complete', false)),
        filter(isPropertyEqual('username', username)),
        filter(isPropertyEqual('username', username)),
        getProperty('tasks'),
      ))
}
console.log(getIncompleteTaskSummaries('Scott'));
console.log(getIncompleteTaskSummaries2('Lena'));

