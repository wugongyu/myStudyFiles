var value = 2;

var foo = {
  value: 1,
};
function bar() {
  console.log(this.value);
}
function bar1(name, age) {
  this.habit = 'swimming';
  console.log(name);
  console.log(age);
  console.log(this.value);
}

function bar2(name, age) {
  this.habit = 'swimming';
  return {
    name: name,
    age: age,
    value: this.value,
  }
}

bar.call(foo); // 1
bar1.call(foo, 'zzz', 18);
console.log('-------');
bar.call(null); // undefined ?
console.log('-------');

console.log(bar2.call(foo, 'kate', 24))

/*
1. 将函数设为对象的属性
2. 执行该函数
3. 删除该函数
*/ 
Function.prototype.call2 = function(context) {
  context.fn = this;
  context.fn();
  delete context.fn();
}

bar.call2(foo); // 1

/*
实现call 给定参数 执行函数
参数长度不确定，从Arguments对象中取值（第一个参数为绑定的对象），
第二个到最后一个为给定的参数，并将这些参数放在一个数组中
把参数数组放在要执行的函数参数中
使用eval 方法拼成一个函数，并执行
*/ 

Function.prototype.call3 = function(context) {
  context.fn = this;
  var args = [];
  for (var index = 1; index < arguments.length; index++) {
    args.push('arguments[' + index + ']'); // 最终目的是为了拼出一个参数字符串,
  }
  // args 结果为["arguments[1]", "arguments[2]", ...]
  eval('context.fn(' + args + ')');// 在eval中，args 自动调用 args.toString()方法
  delete context.fn;
}

bar1.call3(foo, 'tttt', '20')

/*
注意，call方法传入的对象值可能为null, 此时函数内的this指向window,
且函数可能会有返回值，
优化最终版
*/ 

Function.prototype.call4 = function(context) {
  var context = context || window;
  /*
  fn为自定义函数名 如果context本来就有fn成员。
  优化方法：使用Symbol进行命名，但symbol是es6里的方法，而call是es3的方法
  */ 
  context.fn = this;
  // 将函数本身作为属性添加到 context 上
  // var fn = Symbol('fn');
  // context[fn] = this;
  var args = [];
  for (var index = 1; index < arguments.length; index++) {
    args.push('arguments[' + index +']');
  }
  var result = eval('context.fn(' + args + ')');
  delete context.fn;
  return result;
} 

console.log('---custom call4 function--');

console.log(bar2.call4(null));

console.log(bar2.call4(foo, 'zs', 26));
console.log('---custom call4 function--');

Function.prototype.apply1 = function(context, arr) {
  var context = Object(context) || window;
  context.fn = this;
  var result
  if(!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var index = 0; index < arr.length; index++) {
      args.push('arr[' + index + ']');
    }
    result = eval('context.fn(' + args + ')');
  }
  delete context.fn;
  return result;
}

console.log(bar2.apply(foo, ['apple', 29]));
console.log(bar2.apply1(foo, ['apple1', 13]));


Function.prototype.bind1 = function(context) {
  var self = this;
  return function() {
    return self.apply(context);
  }
}

// 参数处理
Function.prototype.bind2 = function(context) {
  var self = this;
  // 获取第二个-最后一个参数
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // 此处arguments为返回函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(context, args.concat(bindArgs));
  }
}

console.log('------bind---------');

bindFoo = bar.bind(foo);
bindFoo(); // 1

bindFoo1 = bar.bind1(foo);
bindFoo1();

bindFoo2 = bar2.bind(foo, 'XXHHH');
console.log(bindFoo2(18));

bindFoo3 = bar2.bind2(foo, 'XXHHH2');
console.log(bindFoo3(19));

console.log('------bind new------');
bindFoo4 = bar1.bind(foo, 'bindNew');
bar1.prototype.friend = 'kt';
var bindFoo4Obj = new bindFoo4(33);
console.log(bindFoo4Obj, 'bindFoo4Obj', bindFoo4Obj.friend, bindFoo4Obj.habit);


Function.prototype.bind3 = function(context) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    /*
    当fBound作为构造函数时，this指向构造函数实例，此时将绑定函数的this指向该实例，可以让实例获得绑定函数上的值
    当fBound作为普通函数时，this指向window
    */ 
    return self.apply(this instanceof fBound ? this : context, args.concat(bindArgs));
  }
  fBound.prototype = this.prototype;
  return fBound;
}

bindFoo5 = bar1.bind3(foo, 'bindNew1');
bar1.prototype.friend = 'kt1';
var bindFoo5Obj = new bindFoo5(33);
console.log(bindFoo5Obj, 'bindFoo5Obj', bindFoo5Obj.friend, bindFoo5Obj.habit);


/*
问题解决与优化
1.fBound.prototype = this.prototype; 这里修改fBound原型时，会直接修改绑定函数的原型（通过一个空函数来进行中转）
2. 调用bind的不是函数时，报错处理
3. 兼容处理
Function.prototype.bind = Function.prototype.bind || function () {
    ……
};
*/ 

Function.prototype.bind4 = function(context) {
  if(typeof this !== 'function') {
    throw new Error('Function.prototype.bind4: what is trying to be bound is not callable');
  }
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fNop = function() {

  }
  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(this instanceof fNop ? this : context, args.concat(bindArgs))
  }
  fNop.prototype = this.prototype;
  fBound.prototype = new fNop();
  return fBound;
}

console.log('-------分隔线------');

console.log('------new-------');


function objectFactory() {
  var Constructor = [].shift.call(arguments); // 取得外部传入的构造器，且shift会改变原arguments
  var objInstance = Object.create(Constructor.prototype); // 创建一个对象实例，且实例的__proto__指向构造函数的prototype
  var ret = Constructor.apply(objInstance, arguments); // 构造器的this指向对象实例objInstance
  return typeof ret === 'object' ? ret || objInstance : objInstance; // 判断返回的值是不是一个对象，如果是一个对象，就返回这个对象，如果没有，该返回什么就返回什么。
}

function MyConstructor(name, age) {
  this.strength = 60;
  this.name = name;
  this.age = age;
  // return {
  //   name: name,
  //   age: age,
  // }
  // return 'string'
}

MyConstructor.prototype.friend = 'kathy';
MyConstructor.prototype.sayHello = function() {
  console.log('name is' + this.name);
}
var objInstance1 = new MyConstructor('zs', 14);
console.log(objInstance1.__proto__ === MyConstructor.prototype);

var objInstance2 = objectFactory(MyConstructor, 'ls ', 22);
objInstance2.sayHello();


console.log('-----创建对象----');

// 组合模式（构造函数+原型）
function Person(name) {
  this.name = name;
}

Person.prototype = {
  constructor: Person,
  getName: function() {
    console.log('name is:' + this.name);    
  }
}

var p1 = new Person('lll');
console.log(p1.name);
p1.getName();

// 工厂模式
function createPerson(name) {
  var o = new Object();
  o.name = name;
  o.getName = function() {
    console.log('name:' + this.name); 
  }
  return o;
}

// 构造函数
function PersonCreator(name) {
  this.name = name;
  this.getName = function() {
    console.log('name:'+ this.name);
  }
}




console.log('-----继承----');


// 原型链继承
function Parent() {
  this.name = 'name';
}

Parent.prototype.getName = function() {
  console.log(this.name);
}

function Child() {

}

Child.prototype = new Parent();

var child1 = new Child();
child1.getName();

// 经典继承（借用构造函数继承）
function Parent1(name) {
  this.name = name;
}
function Child1(name) {
  Parent1.call(this, name)
}


var child11 = new Child1('tazy');
var child12 = new Child1('kk');
console.log(child11.name + '--child11');
console.log(child12.name + '--child12');


// 组合继承

function ParentCombine(name) {
  this.name = name;
  this.colors = ['red', 'green', 'blue'];
}
ParentCombine.prototype.getName = function() {
  console.log(this.name);
}
function ChildCombine(name, age) {
  this.age = age;
  ParentCombine.call(this, name);
}
ChildCombine.prototype = new ParentCombine();


var childCombine = new ChildCombine('tessss');
childCombine.getName();
console.log(childCombine.colors);

var childCombine1 = new ChildCombine('tessss1');
childCombine1.getName();
childCombine1.colors.push('black')
console.log(childCombine1.colors);


// 原型式继承
function createObj(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

var cObj = {
  name: 'test',
  list: ['list1', 'list2'],
}

var cObj1 = createObj(cObj);
var cObj2 = createObj(cObj);
cObj1.name = 'cObj1';
cObj1.list.push('list4');

cObj2.name = 'cObj2';
console.log(cObj1, cObj1.list);
console.log(cObj2, cObj2.list);


// 寄生组合式继承
function prototype(child, parent) {
  var protoTypeObj = createObj(parent.prototype); // 获取父构造函数的原型对象
  protoTypeObj.constructor = child; // 修正该原型对象的构造器
  child.prototype = protoTypeObj; // 原型对象赋值作为子构造函数的原型对象，从而实现继承
}

function ParentCombineOpt(name) {
  this.name = name;
  this.colors = ['red', 'green', 'blue'];
}
ParentCombineOpt.prototype.getName = function() {
  console.log(this.name);
}
function ChildCombineOpt(name, age) {
  this.age = age;
  ParentCombineOpt.call(this, name);
}
prototype(ChildCombineOpt, ParentCombineOpt);
var optChild = new ChildCombineOpt('optChild', 11);
console.log(optChild)

console.log(String(-0)); // 0
console.log(String(0)); // 0
console.log(String(Infinity)); // Infinity
console.log(String(-Infinity)); // -Infinity
console.log(String(122244)); // 122244
console.log(String(NaN)); // NaN











