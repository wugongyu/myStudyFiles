export class Vue {

}

var data = {};

export function isObject(val) {
  return typeof val === 'object';
}

export function hasOwn(value, key) {
  if(!isObject(value)) return false;
  // 需检查是否包含原型上的属性，可用 in 检查，只检查自身属性，用Object.hasOwn 或 Object.hasOwnProperty
  return Object.hasOwn(value, key);
}

function remove(arr, item) {
  if(!arr.length) return;
  const index = arr.indexOf(item);
  if(index > -1) {
    arr.splice(index, 1);
  }
}

/**
 * 解析简单路径
 * */ 
const baseReg = /[^\w.$]/
export function parsePath(path) {
  if(baseReg.test(path)) return;
  const segments = path.split('.');
  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      const element = segments[i];
      if(!obj) return;
      obj = obj[element];
    }
    return obj;
  }
}

/** 
 * 为value创建Observer实例
 * 如果创建成功，直接返回新创建的Observer实例
 * 若已存在Observer实例，则直接返回已创建的实例 
*/
export function observe(value, asRootData) {
  if(!isObject(value)) return;
  let ob;
  if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 存在__ob__说明数据是响应式的
    ob = value.__ob__;
  } else {
    // 进行响应式数据的转换
    ob = new Observer(value);
  }
  return ob;
}

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  })
}


function protoArgument(target, src, keys) {
  target.__proto__ = src;
}

// 在浏览器不支持__proto__时，直接在数组上挂载拦截器中重定义的数组方法
function copyArgument(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    defineReactive(target, key, src[key]);
  }
}

/**判断所传入的值是否为一个有效的数组索引
 * 一个有效的数组索引是一个在 0 到 2^32 - 2（即 4294967294）之间的整数，
 * 且作为字符串属性名时，其规范化形式与自身严格相等
 * （即不能有前导零、正负号、空格、小数点或其他非数字字符）
*/
const MAX_ARR_INDEX_VALUE = 4294967294;
function isValidArrayIndex(val) {
  if(typeof val === 'number') {
    return Number.isInteger(val) && val >=0 && val <= MAX_ARR_INDEX_VALUE;
  }
  if(typeof val === 'string') {
    const num = Number(val);
    // 这里num.toString() === val的全等判断会自动排除前导零、空格、正负号、小数点、科学计数法等非法格式
    return Number.isInteger(num) && num >=0 && num <= MAX_ARR_INDEX_VALUE && num.toString() === val;
  }
  // 其他类型（布尔值、对象、函数、undefined、null、BigInt 等）均不是有效索引
  return false;
}

/*******************************core function start***********************************/ 
// 将数据转换为响应式数据
export function defineReactive(data, key, val){
  // 递归属性，转换为响应式
  if(isObject(val)) {
    new Observer(val)
  }
  // var dep = []; // 依赖
  /*
    数组的响应式转换处理，对于数组，在其数据上增加一个__ob__属性，
    通过__ob__可以获取到Observer实例，从而可以获取到数据对应的依赖
  */ 
  let childOb = observe(val); 
  let dep = new Dep();
  // 变化追踪
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      // this.dep.push(window.target); // 收集依赖（假定依赖为window.target的一个函数）
      // this.dep.depend()
      dep.depend(); // 依赖收集
      if(childOb) {
        childOb.dep.depend(); // 收集数组的依赖
      }
      return val;
    },
    set: function(newVal) {
      if(val === newVal) {
        return
      }
      // this.dep.notify();
      // for (let i = 0; i < this.dep.length; i++) {
      //   // this.dep[i](val, newVal); // 触发依赖
      // }
      // data[key] = newVal
      val = newVal;
      dep.notify();// 依赖通知
    }
  })
}

let uid = 0;
// 依赖管理
export class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if(index > -1) {
      return this.subs.splice(index, 1);
    }
  }
  depend() {
    if(window.target) {
      // this.addSub(window.target)
      window.target.addDep(this); // 
    }
  }
  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

const seenObjects = new Set(); // 记录已监听数据对象，保证不会重复收集依赖
/*
递归实现数据的深度监听
*/ 
export function traverse(val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
} 

function _traverse(val, seen) {
  let i, keys;
  const isArr = Array.isArray(val);
  if((!isArr && !isObject(val)) || Object.isFrozen(val)) return;
  if(val.__ob__) {
    const depId = val.__ob__.dep.id;
    if(seen.has(depId)) return;
    seen.add(depId);
  }
  if(isArr) {
    i = val.length;
    while(i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while(i--) _traverse(val[keys[i]], seen);
  }
}

// 变化监测vm.$watch('a.b.c', function(newVal, oldVal){  // do something })
export default class Watcher {
  constructor(vm, expOrFn, callback, options) {
    this.vm = vm;

    if(options) {
      this.deep = options.deep;
    }

    this.deps = []; 
    this.depIds = new Set();
    // 执行this.getter，可以读取watcher所依赖的具体数据
    // expOrFn支持传入函数
    if(typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      /*
        这里的parsePath方法用于处理传入的
        字符串（vm的data中对应的数据路径），
        将传入的字符串用.分割成数组，
        然后循环数组一层一层读取数据，
        最后拿到的obj就是目标读取数据
      */ 
      this.getter = parsePath(expOrFn); 
    }
    this.callback = callback;
    this.value = this.get();
  }

  get() {
    window.target = this; // 指向了当前的watcher实例
    // 这里获取到目标数据，也就是触发两个getter，从而可以将对应的依赖（指向当前watcher实例）添加到了Dep中
    let value = this.getter.call(this.vm, this.vm);
    if(this.deep) {
      // 使用traverse函数递归value的所有子值来触发收集依赖的功能
      traverse(value);
    }
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.callback.call(this.vm, this.value, oldValue)
  }

  /**
   * 在watcher中需要记录自己订阅了谁，及watcher实例被收集进了那些dep里
   * addDep即记录watcher实例所订阅的dep
   * */ 
  addDep(dep) {
    const id = dep.id;
    this.depIds.add(id);
    this.deps.push(dep);
    dep.addSub(this);
  }

  /**
   * 将自身从依赖列表中移除掉
   * */ 
  teardown() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].removeSub(this);
    } 
  }
}

/*
递归侦测所有key
Observer类会附加到每一个被侦测的object上，
一旦被附加上，Observer会将object所有属性转换为getter/setter形式
来收集属性的依赖，并且当属性发生变化时会通知这些依赖
*/ 

const arrayProto = Array.prototype;

// 创建一个对象集成数组原型链
export const arrayMethods = Object.create(arrayProto);

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function(method) {
  const original = arrayProto[method];
  // 使用Object.defineProperty将那些改变数组自身的方法进行封装
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      let inserted; // 新增方法所对应的元素
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.splice(2); // 剔除前面两个参数
          break
        default:
          break;
      }
      // 数组变更时可以通过this访问到__ob__
      const ob = this.__ob__;
      if(inserted) {
        // 存在新增元素
        ob.observeArray(inserted); // 将新增元素转换为响应式的
      }
      // 向依赖发送变更通知
      ob.dep.notify();
      return original.apply(this, args);
    },
    enumerable: false,
    writable: true,
    configurable: true,
  })
})

const hasProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

export class Observer {
  constructor(value) {
    this.value = value;

    // 新增数组依赖列表
    this.dep = new Dep();
    def(value, '__ob__', this); // 把__ob__绑定在值上，并且指向当前的Observer实例

    if(Array.isArray(value)) {
      // 转换数组数据为响应式数据
      // value.__proto__ = arrayMethods; // 不是所有浏览器都支持属性访问原型
      const argument = hasProto ? protoArgument : copyArgument;
      argument(value, arrayMethods, arrayKeys);
      this.observeArray(value); // 数组子集同样也转换为响应式
    } else {
      this.walk(value)
    }
  }

  /**
   * walk会将每一个属性都转化为getter/setter形式来侦听变化
   * （只有数据类型为Object时被调用）
   * */ 
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      defineReactive(obj, key, obj[key]);
    }
  }

  /**
   * 将数组中的每一项数据转换为响应式数据
   * */ 
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]); // 相当于递归将数组中的每一个元素执行一遍new Observer()
    }
  }
}

Vue.prototype.$watch = function(expOrFn, cb, options) {
  const vm = this;
  options = options || {};
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if(options.immediate) {
    cb.call(vm, watcher.value);
  }
  return function unwatch() {
    watcher.teardown();
  }
}

Vue.prototype.$set = function(target, key, val) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  // 已存在于对象中的值
  if(key in target && !(key in target.prototype)) {
    target[key] = val;
    return val;
  }

  // 新增属性
  const ob = target.__ob__;
  if(target._isVue || (ob && ob.vmCount)) {
    // 注意target不能是vue.js实例或vue.js实例的跟数据对象
    process.env.NODE_ENV !== 'production' && warn(
      'avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option'
    );
    return val;
  }
  if(!ob) {
    // 原对象非响应式数据，直接返回
    target[key] = val;
    return val
  }
  // 将数据转化为响应式数据并进行视图通知
  defineReactive(target, key, val);
  ob.dep.notify();
  return val;
}

Vue.prototype.$delete = function(target, key) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1); // 数组使用splice方法，数组拦截器会自动向依赖发送通知
    return
  }
  const ob = target.__ob__;
  // 注意target不能是vue.js实例或vue.js实例的跟数据对象
  if(target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return;
  }
  if(!hasOwn(target, key)) return; // 删除的为非自身对象
  delete target[key];
  if(!ob) return; // target为非响应式数据
  ob.dep.notify();
}
/*
  XML/HTML 标签名的匹配模式，首字符为字母或下划线， 
  后续字符可以是零个或多个“单词字符”（包括字母、数字、下划线）、连字符 - 或点号 .
*/ 
const ncname = '[a-zA-Z_][\\w\\-\\.]*'; 
/*
构建一个捕获带可选命名空间前缀的标签名的模式
用于提取完整的带命名空间的标签名（如 ns:div）或不带命名空间的标签名（如 div）
*/ 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
/*
匹配开始标签的起始部分
*/ 
const startTagOpen = new RegExp(`^<${qnameCapture}`);
/*
匹配开始标签的闭合部分
*/ 
const startTagClose = /^\s*(\/?)>/;


/*
匹配标签属性
^                        # 行首
\s*                      # 可选的空白字符
(                        # 捕获组1：属性名
  [^\s"'<>\/=]+          # 一个或多个非空白、非引号、非尖括号、非斜杠、非等号的字符
)
(?:                      # 非捕获组，表示可选的等号与值部分
  \s*                    # 可选的空白
  (=)                    # 捕获组2：等号
  \s*                    # 可选的空白
  (?:                    # 非捕获组，值的三种格式
    "([^"]*)"+           # 双引号值：捕获组3（双引号内的内容）
    |                    # 或
    '([^']*)'+           # 单引号值：捕获组4（单引号内的内容）
    |                    # 或
    ([^\s"'=<>`]+)       # 无引号值：捕获组5，一个或多个非空白、非引号、非等号、非尖括号、非反引号的字符
  )
)?                       # 整个等号与值部分可选（因此可匹配布尔属性）

在正则表达式中，^（脱字符）有两种主要用途，具体取决于它在正则表达式中的位置：
1. 在字符类（方括号 []）外部时：匹配字符串的开头
2. 在字符类（方括号 []）内部且紧跟在 [ 之后时：表示取反
*/ 
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// 结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

// 注释标签
const comment = /^<!--/;

// 条件注释
const conditionalComment = /^<!\[/;

// DOCTYPE
const doctype = /^<!DOCTYPE[^<]+>/i;


let html = '<div id="12324"></div>'; // 即HTML模板

function advance(n) {
  html = html.substring(n);
}

/**
 * 解析开始标签
 * */ 
function parseStartTag() {
  // 解析标签名
  const start = html.match(startTagOpen);
  if(start) {
    const match = {
      tagName: start[1],
      attrs: [],
    }
    advance(start[0].length);

    // 解析标签属性
    let end, attr
    while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
      advance(attr[0].length);
      match.attrs.push(attr)
    }

    // 是否自闭和标签
    if(end) {
      match.unarySlash = end[1];
      advance(end[0].length);
      return match;
    }
  }
}

// 其他类型截取的伪代码
// 截取结束标签
const endTagMatch = html.match(endTag);
if(endTagMatch) {
  advance(endTagMatch[0].length);
  // 触发钩子函数
  options.end(endTagMatch[1]);
  // continue;
}

// 截取注释
if(comment.test(html)) {
  const commentEnd = html.indexOf('-->');
  if(commentEnd >= 0) {
    if(options.shouldKeepComment) {
      // 触发钩子函数
      options.comment(html.substring(4, commentEnd));
    }
    advance(commentEnd + 3);
    // continue;
    // ……
  }
}

// 截取条件注释，形如'<![if !IE]><link href=""><![endif]>';
if(conditionalComment.test(html)) {
  const conditionalCommentEnd = html.indexOf(']>');
  if(conditionalCommentEnd >= 0) {
    advance(conditionalCommentEnd + 2);
    // continue
  }
}

// 截取DOCTYPE
const doctypeMatch = html.match(doctype);
if(doctypeMatch) {
  advance(doctypeMatch[0].length);
  // continue
}

// 截取文本
while(html) {
  let text, rest, next;
  let textEnd = html.indexOf('<'); // 文本截取的结束位置
  if(textEnd >= 0) {
    rest = html.slice(textEnd);
    while(!endTag.test(rest) &&
    !startTagOpen.test(rest)&&
    !comment.test(rest) &&
    !conditionalComment.test(rest)) {
      next = rest.indexOf('<', 1); // 如果<在纯文本中，将它视为纯文本对待
      if(next < 0) break;
      textEnd += next;
      rest = html.slice(textEnd);
    }
    text = html.substring(0, textEnd);
    advance(textEnd)
  }

  if(textEnd < 0) {
    // 整个模板都是文本
    text = html;
    html = '';
  }

  // 触发钩子函数
  if(options.chars && text) {
    options.chars(text);
  }
}

// 纯文本内容元素的处理
while(html) {
  if(!lastTag || !isPlainTextElement(lastTag)) {
    // lastTag--父元素 
    // 父元素为正常元素的处理逻辑
  } else {
    // 父元素为script style textarea的处理逻辑
    const stackedTag = lastTag.toLowerCase();
    const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp(
      '([\\s\\S]*?)(</'+ stackedTag + '[^>]*>)', 'i'
    )); // 结束标签的正则
    const res = html.replace(reStackedTag, function(all, text) {
      // text为结束标签前的所有内容
      if(options.chars) {
        options.chars(text); // 触发钩子函数
      }
      return ''; // 将匹配到的内容截取掉
    })
    html = res;
  }
}

/*
  解析器
*/ 
export function parseHtml(html, options) {
  while(html) {
    if(!lastTag || !isPlainTextElement(lastTag)) {
      // lastTag--父元素 
      // 父元素为正常元素的处理逻辑
      let textEnd = html.indexOf('<');
      // 通过<的位置区分标签类
      if(textEnd === 0) {
        // 注释
        if(comment.test(html)) {
          
          continue;
        }

        // 条件注释
        if(conditionalComment.test(html)) {
          continue;
        }

        // DOCTYPE
        const doctypeMatch = html.match(doctype);
        if(doctypeMatch) {
          continue;
        }

        // 结束标签
        const endTagMatch = html.match(endTag);
        if(endTagMatch) {
          continue;
        }

        // 开始标签
        const startTagMatch = parseStartTag();
        if(startTagMatch) {
          continue
        }
      } 

      // 处理文本类
      let text, next, rest;
      if(textEnd >= 0) {
        // 解析文本
      }

      // 全文本
      if(textEnd < 0) {
        text = html;
        html = ''
      }

      if(options.chars && text) {
        options.chars(text)
      }
    } else {
      // 父元素为script style textarea的处理逻辑
    }
  }
}

// 文本解析器
export function parseText(text) {
  /*
  匹配以 {{ 开头，以 }} 结尾的字符串，中间可以是任意字符（包括换行），
  并且采用非贪婪模式，即匹配最短的可能内容。并将中间的内容捕获到第一个捕获组中。
  全局标志 g 表示会找到所有匹配项，而不只是第一个。
  */ 
  const tagReg = /\{\{((?:.|\n)+?)\}\}/g;
  if(!tagReg.test(text)) {
    return;
  }

  const tokens = [];

  let lastIndex = tagReg.lastIndex = 0; // 注意test之后会更新lastIndex，此处需重置
  let match, index;
  while((match = tagReg.exec(text))) {
    index = match.index;
    if(lastIndex < index) {
      // 把花括号前边的文本先添加到token中
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    // 将变量修改为_s(x)的形式
    tokens.push(`_s(${match[1].trim()})`);

    // 设置lastIndex
    lastIndex = index + match[0].length;
  }

  // 变量处理完毕后，最后一个变量右侧仍有文本，将文本添加到数组中
  if(lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }

  return tokens.join('+');
}


// 优化器——标记静态节点
export function optimize(root) {
  if(!root) return;
  markStatic(root); // 标记所有静态节点
  markStaticRoot(root); // 标记所有静态根节点
}

function markStatic(node) {
  node.static = isStatic(node);
  if(node.type === 1) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      markStatic(child);

      if(!child.static) {
        node.static = false;
      }
    }
  }
}

function markStaticRoot(node) {
  if(node.type === '1') {
    if(node.static && !(
      node.children.length === 1
      && node.children[0].type === 3)) {
        node.staticRoot = true;
        return;
    } else {
      node.staticRoot = false;
    }
    if(node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        markStaticRoot(child);
      }
    }
  }
}

// 判断节点是否为静态节点的方法 伪代码
function isStatic(node) {
  if(node.type === '2') {
    return false;
  }

  if(node.type === '3') {
    return true
  }

  return !!(node.pre || (
    !node.hasBindings && 
    !node.if && !node.for && 
    !isBuiltInTag(node.tag) &&  // 不是内置标签
    isPlatformReservedTag(node.tag) && // 不是组件
    !isDirectChildOfTemplateFor(node) && 
    Object.keys(node).every(isStaticKey)
  ))

}

/**
 * 代码生成器=》生成元素节点
 * @param {ASTElement} el 
 * @param {CodegenState} state 
 * @returns {String}
 */ 
function genElement(el, state) {
  const data = el.plain ? undefined : genData(el, state);
  const children = genChildren(el, state);
  code = `_c('${el.tag}'${data ? `,${data}` : ''}${children ? `,${children}` : ''})`;
  return code;
}

/**
 * 代码生成器=》生成文本节点
 * @param {ASTElement} el 
 * @returns {String}
 */ 
function genText(el) {
  // 判断是否为动态文本，JSON.stringify给静态文本包装一层字符串
  return `_v(${el.type === 2 ? el.expression : JSON.stringify(el.text)})`;
}

/**
 * 代码生成器=》生成注释节点
 * @param {ASTElement} el 
 * @returns {String}
 */ 
function genComment(el) {
  return `_e(${JSON.stringify(el.text)})`;
}

/**
 * 生成节点的属性数据
 * @param {ASTElement} el 
 * @param {CodegenState} state 
 * @returns {String}
 */ 
function genData(el, state) {
  let data = '{';
  if(el.key) {
    data += `key: ${el.key},`;
  }
  if(el.ref) {
    data += `ref: ${el.ref},`;
  }
  if(el.pre) {
    data += `pre: ${el.pre},`;
  }

  // 类似的其他情况 ……
  data = data.replace(/,$/, '') + '}';
  return data;
}

/**
 * 生成子节点列表
 * @param {ASTElement} el 
 * @param {CodegenState} state 
 * @returns {Array}
 */ 
function genChildren(el, state) {
  const children = el.children;
  if(children.length) {
    return `[${children.map(c => genNode(c, state)).join(',')}]`;
  }
}

/**
 * @param {ASTElement} el 
 * @param {CodegenState} state 
 * @returns {*}
 */ 
function genNode(el, state) {
  if(el.type === 1) {
    return genElement(el, state);
  } 
  if(el.type === 3 && el.isComment) {
    return genComment(el)
  } else {
    return genText(el);
  }
}
/*******************************core function end***********************************/ 