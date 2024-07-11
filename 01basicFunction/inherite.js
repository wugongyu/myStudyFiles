/**
 * 继承
 * */ 

// es5的继承
function Supper() {}
function Sub() {}
Sub.prototype = new Supper();
Sub.prototype.constructor = Sub;
var sub = new Sub();
Sub.__proto__ === Function.prototype;

// es6的继承
class SupperEs6 {}
class SubEs6 extends SupperEs6 {

}
let subEs6 = new SubEs6();

/**
 * 实现一个new
 * 1、创建一个对象，对象的__proto__指向函数的prototype属性
 * 2、this指向所创建的对象
 * 3、返回该创建对象 
 * 如果构造函数返回一个非基本类型的值，则返回这个值，否则返回前面创建的对象
 * */ 

function _new(fn, ...args) {
  const obj = {};
  Object.setPrototypeOf(obj, fn.prototype);
  const result = fn.apply(obj, args);
  // 根据规范，如果构造函数返回一个非基本类型的值，则返回这个值，否则返回前面创建的对象
  return result instanceof Object ? result : obj;
}