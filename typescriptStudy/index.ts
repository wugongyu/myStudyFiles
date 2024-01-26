let x: symbol = Symbol();
let y: symbol = Symbol();
console.log(x === y) // false

const uniqueX: unique symbol = Symbol(); // unique symbol只能用const声明，即该类型的变量值不可修改
// const uniqueY: unique symbol = uniqueX; // error 不能将类型“typeof uniqueX”分配给类型“typeof uniqueY”
const uniqueY: typeof uniqueX = uniqueX; // right


const hello: 'hello' = 'hello';
const world: 'world' = 'world';
// hello === world; // error

let symbolX: symbol = uniqueX; // unique symbol是symbol的子类型，子类可以赋值给父类，反之不可。
// const uniqueZ: unique symbol = symbolX; // error