/*
  编译器
*/ 

// 定义状态机的状态
const State = {
  initial: 1, // 初始状态
  tagOpen: 2, // 标签开始状态
  tagName: 3, // 标签名称状态
  text: 4, // 文本状态
  tagEnd: 5, // 结束标签状态
  tagEndName: 6, // 结束标签名称状态
}

/**
 * 判断是否是字母
 * @param {*} char 
 */ 
function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z';
}

/**
 * 接受模板字符串作为参数，并根据⼀定的规则将整个字符串切割为⼀个个 Token，并返回，
 * 这⾥的Token 可以视作词法记号。
 * @param {*} str 
 */ 
function tokenize(str) {
  let currentState = State.initial; // 状态机的当前状态：初始状态
  const tokens = [];
  const chars = []; // 缓存字符

  // 循坏开启状态机，只要模板字符串没有被消费尽，自动机 会一直运行
  while (str) {
    const char = str[0]; // 查看第一个字符（只查看，未消费）

    switch(currentState) {
      // 初始状态
      case State.initial:
        if(char === '<') {
          currentState = State.tagOpen; // 1. 状态机切换到标签开始状态
          str = str.slice(1); // 2. 消费字符
        } else if(isAlpha(char)) {
          currentState = State.text; // 1. 遇到字母，切换到文本状态
          chars.push(char); // 2. 当前字母缓存到chars数组
          str = str.slice(1); // 3. 消费字符 
        }
        break;

      // 标签开始状态
      case State.tagOpen:
        if(isAlpha(char)) {
          currentState = State.tagName; // 1. 遇到字母，切换到标签名称状态
          chars.push(char); // 2. 字符缓存
          str = str.slice(1); // 3. 消费字符
        } else if(char === '/') {
          currentState = State.tagEnd; // 1. 遇到结束字符/，切换到结束标签状态
          str = str.slice(1); // 2. 消费字符
        }
        break;

      // 标签名称状态
      case State.tagName:
        if(isAlpha(char)) {
          chars.push(char); // 1. 遇到字母，无需变更状态，需缓存字符
          str = str.slice(1); // 2. 消费字符
        } else if(char === '>') {
          currentState = State.initial; // 1. 遇到>字符，切换到初始状态
          tokens.push({
            type: 'tag',
            name: chars.join(''),
          }); // 2. 创建一个标签token，此时chars中缓存的字符即为标签名称
          chars.length = 0; // 3. 清空chars数组
          str = str.slice(1); // 4. 消费当前字符
        }
        break;

      // 文本状态
      case State.text:
        if(isAlpha(char)) {
          chars.push(char); // 1. 当前字符为字母，缓存字符
          str = str.slice(1); // 2. 消费字符
        } else if(char === '<') {
          currentState = State.tagOpen; // 1. 遇到字符<，切换到标签开始状态
          tokens.push({
            type: 'text',
            content: chars.join('')
          }); // 2. 创建文本token，此时chars中缓存的字符为文本内容
          chars.length = 0; // 3. 清空chars数组
          str = str.slice(1); // 4. 消费字符
        }
        break;

      // 标签结束状态
      case State.tagEnd:
        if(isAlpha(char)) {
          currentState = State.tagEndName; // 1. 遇到字母，切换到结束标签名称状态
          chars.push(char); // 2. 缓存字符
          str = str.slice(1); // 3. 消费字符
        }
        break;
      
      // 标签名称结束状态
      case State.tagEndName:
        if(isAlpha(char)) {
          chars.push(char); // 1. 遇到字母，无需变更状态，需缓存字符
          str = str.slice(1); // 2. 消费字符
        } else if(char === '>') {
          currentState = State.initial; // 1. 切换状态
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          }); // 2. 添加结束标签token
          chars.length = 0; // 3. 清空chars数组
          str = str.slice(1)
        }
        break;
      default:
        break;
    }
  }
  return tokens;
}

const tokens = tokenize(`<div><p>Vue</p><p>Template</p></div>`)
console.log(tokens, 'tokens');


/**
 * parse 解析器函数
 * 完成对模板的词法分析和语法分析，得到模板 AST
 * @param {*} templateStr 字符串模板
 */
function parse(templateStr) {
  // 对模板进行标记化
  const tokens = tokenize(templateStr);
  // 创建root根节点
  const root = {
    type: 'Root',
    children: [],
  }
  const elementStack = [root];
  while(tokens.length) {
    const currentToken = tokens[0];
    const parent = elementStack[elementStack.length - 1]; // 获取当前栈顶节点作为父节点
    switch (currentToken.type) {
      // 开始标签
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: currentToken.name,
          children: [],
        }; // 创建Element类型的AST
        elementStack.push(elementNode); // 将当前节点压入栈
        parent.children.push(elementNode); // 将当前节点添加到父节点的children中
        break;

      // 文本标签
      case 'text':
        const textNode = {
          type: 'Text',
          content: currentToken.content,
        };// 创建Text类型的AST
        parent.children.push(textNode);
        break;
    
      //  结束标签
      case 'tagEnd':
        elementStack.pop(); // 将栈顶节点弹出
        break;

      default:
        break;
    }
    tokens.shift(); // 消费已扫描过的token
  }

  return root;
} 


/**
 * 打印当前AST中节点的信息
 * @param {*} node 
 * @param {*} indent 
 */ 
function dump(node, indent = 0) {
  const type = node.type;
  const describe = type === 'Root' ? '' : (type === 'Element' ? node.tag : node.content);

  console.log(`${'-'.repeat(indent)}${type}: ${describe}`);

  if(node.children) {
    // 递归打印子节点
    node.children.forEach(element => {
      dump(element, indent + 2);
    });
  }
}


/**
 * 深度优先遍历AST
 * @param {*} ast 抽象语法树
 * @param {*} context 上下文对象
 * @param {Array} context.nodeTransforms 任意多个与节点相关的转换函数
 */ 
function traverseNode(ast, context) {

  context.currentNode = ast;

  const exitFns = []; // 增加退出阶段的回调函数数组

  const transforms = context.nodeTransforms; // context.nodeTransforms 存储的是对节点操作和访问的方法函数

  for (let i = 0; i < transforms.length; i++) {
    // 转换函数可以返回另一个函数，该函数作为推出阶段的回调函数
    const onExit = transforms[i](context.currentNode, context);
    if(onExit) {
      exitFns.push(onExit);
    }
    if(!context.currentNode) return; // 任何转换函数都可能移除当前节点，因此每个转换函数执行完毕后，若当前节点已被移除，直接返回
  }

  const children = context.currentNode.children;
  if(children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode; // 递归调用转换子节点是，将当前节点设置为父节点
      context.childIndex = i; // 设置位置索引
      traverseNode(children[i], context)
    }
  } 

  // 最后执行缓存到exitFns中的回调函数
  let i = exitFns.length;
  while(i--) {
    // 反序执行
    exitFns[i]();
  }
}

/**
 * 转换函数
 * ast转换为js ast
 * @param {*} ast 
 */ 
function transform(ast) {
  const context = {
    currentNode: null, // 当前正在转换的节点
    childIndex: 0, // 当前节点在父节点的children中的位置索引
    parent: null, // 当前转换节点的父节点
    nodeTransforms: [transformText], // 转换回调函数，如果注册了多个转换函数，则它们的注册顺序将决定代码的执⾏结果
    // 替换节点函数，参数为新节点
    replaceNode(node) {
      context.parent.children[context.childIndex] = node; // 替换节点
      context.currentNode = node; // 更新当前节点
    },
    // 删除当前节点
    removeNode() {
      if(context.parent) {
        context.parent.children.splice(context.childIndex, 1); // 利用索引删除当前节点
        context.currentNode = null; // 置空当前节点
      }
    }
  }
  traverseNode(ast, context);
  console.log(dump(ast));
}


// function transformText(node, context) {
//   if(node.type === 'Text') {
//     context.removeNode();
//   }
// }

// function transformElement(node, context) {
//   /*
//   在编写转换函数时，可以将转换逻辑编写在退
// 出阶段的回调函数中，从⽽保证在对当前访问的节点进⾏转换之前，
// 其⼦节点⼀定全部处理完毕了*/ 
//   return () => {

//   }
// }

/*
// 渲染函数，返回一个h函数，参数为：字符串字面量，数组
function render() {
  return h('div', [])
}
*/ 

/*描述函数声明节点示例：JavaScript AST 代码，它是对渲染函数代码
的完整描述*/ 
const FunctionDeclareNode = {
  type: 'FunctionDecl', // 代表该节点为函数声明
  id: {
    type: 'Identifier',
    name: 'render', // 存储标识符名称，在这里即为渲染函数的名称
  }, // 函数名称， 为一个标识符，标识符本身也是一个节点
  params: [], // 参数
  body: [
    {
      type: 'ReturnStatement',
      // 最外层的h函数调用
      return: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'h'
        }, // 被调用函数的名称，为一个标识符
        arguments: [
          // 第一个参数是字符串字面量
          {
            type: 'StringLiteral',
            value: 'div',
          },
          // 第二个参数是一个数组
          {
            type: 'ArrayExpression',
            elements: [
              // 数组的第一个元素是h函数的调用
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h'}, 
                arguments: [
                  { type: 'StringLiteral', value: 'p', },
                  { type: 'StringLiteral', value: 'vue', },
                ]
              },
              // 数组的第二个元素也是h函数的调用
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h'}, 
                arguments: [
                  { type: 'StringLiteral', value: 'p', },
                  { type: 'StringLiteral', value: 'Template', },
                ]
              }
            ], // 数组中的元素
          }
        ], // 参数
      }, // 函数的返回语句
    }
  ], // 渲染函数的函数体
}

/*来描述函数调⽤语句节点*/ 
const CallExp = {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'h'
  }, // 被调用函数的名称，为一个标识符
  arguments: [], // 参数
}

/*描述字符串字面量节点*/ 
const Str = {
  type: 'StringLiteral',
  value: 'div',
}

/*描述数组*/
const Arr = {
  type: 'ArrayExpression',
  elements: [], // 数组中的元素
}

/**
 * 
 * 创建StringLiteral类型的节点
 * @param {*} value 
 * @returns 
 */ 
function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value,
  }
}

/**
 * 
 * 创建Identifier类型的节点
 * @param {*} name 
 * @returns 
 */ 
function createIdentifier(name) {
  return {
    type: 'Identifier',
    name,
  }
}

/**
 * 创建ArrayExpression节点
 * @param {*} elements 
 * @returns 
 */ 
function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements, // 数组中的元素
  }
}

/**
 * 创建CallExpression节点
 * @param {String} callee 回调函数名称
 * @param {*} arguments 参数
 * @returns 
 */ 
function createCallExpression(callee, arguments) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments,
  }
}

/**
 * 转为文本节点（即把模板转换成 h 函数的调⽤）
 * @param {*} node 
 * @returns 
 */ 
function transformText(node) {
  if(node.type !== 'Text') {
    return;
  }

  /**
   *  文本节点对应的js AST即为一个字符串字面量
   * */ 
  node.jsNode = createStringLiteral(node.content);
}

/**
 * 转换标签节点（即把模板转换成 h 函数的调⽤）
 * @param {*} node 
 * @param {*} context 
 * @returns 
 */ 
function transformElement(node, context) {
  /*
  在编写转换函数时，可以将转换逻辑编写在退
出阶段的回调函数中，从⽽保证在对当前访问的节点进⾏转换之前，
其⼦节点⼀定全部处理完毕了*/ 
  return () => {
    if(node.type !== 'Element') return;

    /*
      1.创建h函数调用语句，h函数调用的第一个参数为标签名称
    */ 
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ]);

    /*
      2.处理h函数调用的参数
    */ 
    if(node.children.length === 1) {
      // 当前标签节点只有一个子节点，是用node.jsNode作为参数
      callExp.arguments.push(node.jsNode);
    } else {
      // 当前标签节点有多个子节点，创建一个ArrayExpression作为参数
      callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)));
    }

    /*
      3. 将当前标签对应的js AS添加到jsNode属性下
    */ 
    node.jsNode = callExp;
  }
}

/**
 * 根节点的转换
 * @param {*} node 
 * @returns 
 */ 
function transformRoot(node) {
  return () => {
    if(node.type !== 'Root') return; // 非根节点

    const vnode_JS_AST = node.children[0].jsNode; // 根节点的第一个子节点即为模板的根节点（此处暂不考虑多个根节点情况）

    /*
      创建render函数的声明语句节点，将vnode_JS_AST作为render函数的返回语句
    */ 
    node.jsNode = {
      type: 'FunctionDecl',
      id: createIdentifier('render'),
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnode_JS_AST,
        }
      ]
    }

  }
}

/**
 * 代码生成，即根据js ast生成渲染函数的代码
 * 代码生成的本质是字符串的拼接艺术
 * @param {*} node 
 */ 
function generate(node) {
  const context = {
    code: '', // 最终生成的渲染函数代码
    push(code) {
      // 完成代码的拼接
      context.code += code;
    },
    currentIndent: 0, // 当前缩进的级别，0-无缩进
    newLine() {
      // 换行函数，在代码字符串后面追加换行符\n
      // 换行时，需保留缩进：追加currentIndent * 2 个空格字符
      context.code += '\n' + '  '.repeat(context.currentIndent);
    },
    indent() {
      // 缩进：currentIndent自增后，调用换行函数
      context.currentIndent ++;
      context.newLine();
    },
    deIndent() {
      // 取消缩进：currentIndent自减后，调用换行函数
      context.currentIndent --;
      context.newLine();
    }
  }

  genNode(node, context); // 完成代码生成工作

  return context.node;
}

/**
 * 完成代码生成工作函数(根据JavaScript AST 节点生成对应的js代码)
 * @param {*} node JavaScript AST 节点
 * @param {*} context 上下文对象
 */ 
function genNode(node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context);
      break;
    case 'ReturnStatement':
      genReturnStatement(node, context);
      break;
    case 'CallExpression':
      genCallExpression(node, context);
      break;
    case 'StringLiteral':
      genStringLiteral(node, context);
      break;
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break;
    default:
      break;
  }
}

/**
 * 生成函数声明语句js代码
 * @param {*} node js ast节点
 * @param {*} context 上下文对象
 */ 
function genFunctionDecl(node, context) {
  const { push, indent, deIndent } = context;
  push(`function ${node.id.name}`); // node.id.name -> 函数的名称
  push('(');
  genNodeList(node.params, context); // 为函数的参数生成代码
  push(') ');
  push('{');
  // 缩进
  indent();
  node.body.forEach(n => genNode(n, context)); // 为函数体生辰代码
  // 取消缩进
  deIndent();
  push('}');
}

/**
 * 为函数的参数⽣成对应的代码
 * @param {*} nodes 
 * @param {*} context 
 */ 
function genNodeList(nodes, context) {
  const {push} = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    genNode(node, context);
    if(i < nodes.length - 1) {
      // 每处理完⼀个节点，需要在⽣成的代码后⾯拼接逗号字符
      push(', ');
    }
    
  }
}

/**
 * 生成函数返回的js代码
 * @param {*} node 
 * @param {*} context 
 */ 
function genReturnStatement(node, context) {
  const { push } = context;
  push(`return `); // 追加return关键字以及空格
  genNode(node.return, context);
}

/**
 * 生成回调函数调用的js代码
 * @param {*} node 
 * @param {*} context 
 */ 
function genCallExpression(node, context) {
  const { push } = context;
  const { callee, arguments: args } = node;
  push(`${callee.name}(`); // 生成函数调用代码
  genNodeList(args, context); // 生成参数代码
  push(')');// 补全括号
}

/**
 * 生成字符串字面量js代码
 * @param {*} node 
 * @param {*} context 
 */ 
function genStringLiteral(node, context) {
  const { push } = context;
  push(`'${node.value}'`);
}

/**
 * 生成数组表达式js代码
 * @param {*} node 
 * @param {*} context 
 */ 
function genArrayExpression(node, context) {
  const { push } = context;
  push('[');
  genNodeList(node.elements, context); // 为数组元素生成代码
  push(']');
}

/**
 * 编译器
 * @param {*} template 
 * @returns 
 */ 
function compile(template) {
  const ast = parse(template); // 模板AST
  transform(ast); // 模板AST转换为js AST
  const code = generate(ast.jsNode); // 代码生成
  return code;
}



let ast = parse(`<div><p>Vue</p><p>Template</p></div>`);
// console.log(dump(ast));
transform(ast);
