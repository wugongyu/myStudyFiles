var x = Symbol();
var y = Symbol();
console.log(x === y); // false
var uniqueX = Symbol(); // unique symbol只能用const声明，即该类型的变量值不可修改
// const uniqueY: unique symbol = uniqueX; // error 不能将类型“typeof uniqueX”分配给类型“typeof uniqueY”
var uniqueY = uniqueX; // right
var hello = 'hello';
var world = 'world';
// hello === world; // error
