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

const tupleArr: [string, string, boolean] = ['1', '2', true]; // 元组

const handler = (num: number): number | undefined => {
  return num;
}

const numHandler = (a: number = 0, b?: number): number => {
  if(!b) {
    return a;
  }
  return a+b;
} // 必选参数位于可选参数前边，且可选参数不可使用默认值

type voidFun = () => void;
const fun: voidFun = () => {
  return 123;
}

// fun() * 1; // error

function voidFun2(): void {
  // return '123'; // error
  return;
}

const errHandler = (): never => {
  throw new Error('something go wrong!');
}

const circleFun = (): never => {
  while(true) {
    console.log('in circulation');
  }
} // 如果一个函数抛出了异常或者陷入了死循环，那么该函数无法正常返回一个值，因此该函数的返回值类型就是never

interface PersonType {
  name: string;
  age: number;
  sex: number;
  callback?: () => void,
}

interface StudentType extends PersonType {
  school?: string;
}

const student: PersonType = {
  name: 'lil',
  age: 10,
  sex: 1,
}

type Country = {
  name: string;
  capital: string;
}

interface Country2 {
  name: string;
  capital: string;
}

type World = {
  name: string,
}

type BigWorld = World & Country;

class MyCountry implements Country {
  name = 'zhongguo';
  capital = 'beijing';
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const point1: Point = new Point(1, 2); // 类名表示的是实例的类型，而非类自身的类型
interface PointConstructor {
  new (x: number, y: number): Point
} // 类的自身类型就是一个构造函数，可以单独定义一个接口来表示。
function createPoint(PointClass: typeof Point, x: number, y: number) {
  return new PointClass(x, y);// 可用typeof获取类自身类型
}
function createPoint2(PointClass: PointConstructor, x: number, y: number) {
  return new PointClass(x, y);
}

class Person {
  name: string;
  age: number;
}

class Customer {
  name: string;
}

const p: Customer = new Person(); // right
// const c: Person = new Customer(); // error

// 泛型
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

getFirst<Number>([1, 2,3]);
getFirst([22,33]);


function combine<T>(arg1: T[], arg2: T[]): T[] {
  return arg1.concat(arg2)
}

combine<string | number>([1, 2, 3], ['he', 'ss']);

// 对于变量形式定义的函数的泛型写法
const combine2: <T>(arg1:  T[], arg2: T[]) => T[] = (arg1, arg2) => {
  return arg1.concat(arg2);
}

// 接口的泛型
interface Box<T> {
  width: number;
  height: number;
  contents: T;
}

type BoxType<T> = {
  width: number;
  height: number;
  contents: T;
}

const largeBox: Box<string> = {
  width: 100,
  height: 100,
  contents: 'box'
}

class BoxClass<T, U> {
  width: T;
  height: T;
  content: U;
}

// 泛型可嵌套
type OrNull<T> = T | null;
type OneOrMany<T> = T | T[];
type OrNullOrOneOrMany<T> = OrNull<OneOrMany<T>>;

const enum colorList {
  GREEN = 2,
  BLUE, // 3
  YELLOW, // 4
}

const yellow = colorList.YELLOW; // 4
const yellowKey = colorList['4']; // YELLOW

const enum numList {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 3,
  FOUR = 4,
};

// ONE | TWO | THREE | FOUR
type NumType = keyof typeof numList; // keyof 运算符可以取出 Enum 结构的所有成员名，作为联合类型返回。

type T = 'a' | 'b' | 'c';

let foo = 'a';
/**类型断言*/ 
let bar: T = foo as T; // 语法1（推荐）
let bar2: T = <T>foo;

interface PointType {
  x: number;
}
interface FullPointTpe extends PointType {
  y: number;
}
let p0: PointType = { x: 0, y: 0 } as PointType;
let p1: PointType = { x: 0, y: 0 } as FullPointTpe;

let unknownVal: unknown = 'this is unknown value';
// let u1: string = unknownVal; // error
let u1: string = unknownVal as string;

const n = 1;
// const s = n as string; // ERROR, string 与number俩两种类型不能充分重叠，不能进行类型断言

const s = n as unknown as string;

type Language = 'Javascript' | 'typescript' | 'python';

function setLanguage(l: Language) {
  return l;
}

let lan1 = 'Javascript'; // 这里的lan1类型为string
// setLanguage(lan1) // error 类型“string”的参数不能赋给类型“Language”的参数
const lan2 = 'typescript';
setLanguage(lan2); // right
let lan3 = 'python' as const;
setLanguage(lan3); // right

const arr = [1, 2, 4, 6];
const arrTwo = [1, 6];
const arrTuple = [2, 8] as const;
function add(...numArr:number[]) {
  return numArr.reduce((pre, cur) => {
    return pre + cur;
  }, 0)
}

function addTwo(x: number, y: number) {
  return x + y;
}

add(...arr);
// addTwo(...arrTwo); // error--扩张参数必须具有元组类型或传递给 rest 参数
addTwo(...arrTuple); // right

/**断言函数*/

function isString(val: unknown): asserts val is string {
  if(typeof val !== 'string') throw new Error("Not a String");
  // 以下不会报错，ts 不会检查断言与实际的类型检查是否一致
  // if(typeof val !== 'number') throw new Error("Not a Number");
  // asserts 语句等同于返回类型为void，故返回值为除null,undefined类型以外的值会报错
  // return true; // error
}