/*
 * 解析器
 * */ 

// 文本模式
const TextModes = {
  DATA: 'DATA',
  RCDATA: 'RCDATA',
  RAWTEXT: 'RAWTEXT',
  CDATA: 'CDATA',
}

/**
 * 解析器函数
 * @param {*} str 模板
 */ 
function parse(str) {
  const context = {
    source: str, // 模板内容，用于在解析过程中进行消费
    mode: TextModes.DATA,
    // 消费指定数量的字符
    advanceBy(num) {
      context.source = context.source.slice(num); // 截取num个字符后的模板内容，并替换当前模板内容
    },
    advanceSpaces() {
      // 匹配连续空白字符
      const match = /^[\t\t\n\f ]+/.exec(context.source);
      if(match) {
        context.advanceBy(match[0].length); // 消费空白字符
      }
    }
  }

  const nodes = parseChildren(context, []); // 这里为解析器的核心

  // 解析器返回Root根节点
  return {
    type: 'Root',
    children: nodes,
  }
}

/**
 * 解析子节点，返回解析后的子节点(内部为状态机)
 * @param {*} context 上下文对象
 * @param {*} ancestors 由父代节点构成的节点栈
 */ 
function parseChildren(context, ancestors) {
  let nodes = []; // 存储子节点，作为最终返回值
  const { mode, source } = context;
  while(!isEnd(context, ancestors)) {
    let node;
    // 只有DATA和RCDATA模式才支持插值节点的解析
    if(mode === TextModes.DATA || mode === TextModes.RCDATA) {

      // DATA模式支持标签节点的解析
      if(mode === TextModes.DATA && source[0] === '<') {
        if(source[1] === '!') {
          if(source.startsWith('<!==')) {
            // 注释
            node = parseComment(context);
          } else if(source.startsWith('<![CDATA]')) {
            // CDATA
            // node = parseCDATA(context, ancestors);
          }
        } else if(source[1] === '/') {
          // 结束标签，需抛出错误
          // 状态机遭遇闭合标签，抛出错误，因为它缺少与之对应的开始标签
          console.error('无效的结束标签');
        } else if(/[a-z]/i.test(source[1])) {
          // 标签
          node = parseElement(context, ancestors);
        }
      } else if(context.source.startsWith('{{')) {
        // 解析插值
        node = parseInterpolation(context);
      }
    }

    // 非DATA模式且非RCDATA模式，说明处于其他模式，一切内容作为文本处理
    if(!node) {
      // 解析文本节点
      node = parseText(context);
    }
    nodes.push(node);
  }

  return nodes;
}

/**
 * 状态机停止条件的判断函数
 * 状态机的停止时机：
 * 1. 当模板内容被解析完毕时；
 * 2. 在遇到结束标签时，取得⽗级节点栈栈顶的节点作为⽗节点，检查该结束标签是否与⽗节点的标签同名，如果相同，则状态机停⽌运⾏
 * @param {*} context 上下文对象
 * @param {*} ancestors 由父代节点构成的节点栈
 */ 
function isEnd(context, ancestors) {
  if(!context.source) return true; // 模板内容被解析完毕，停止
  // const parent = ancestors[ancestors.length - 1];

  // 遇到结束标签，且结束标签与父级标签节点同名，停止
  // if(parent && context.source.startsWith(`</${parent.tag}`)) {
  //   return true;
  // }

  // 优化：只要⽗级节点栈中存在与当前遇到的结束标签同名的节点，就停⽌状态机
  for (let i = ancestors.length - 1; i >=0; --i) {
    if(context.source.startsWith(`</${ancestors[i].tag}`)) {
      return true;
    }
    
  }
}

/**
 * 解析注释
 * @param {*} context 
 */ 
function parseComment(context) {
  const { advanceBy } = context;

  advanceBy('<!--'.length); // 消费注释的开始部分

  const closeIndex = context.source.indexOf('-->');

  if(closeIndex < 0) {
    console.error('注释缺少结束边界');
  }

  const content = context.source.slice(0, closeIndex); // 注释内容

  advanceBy(content.length); // 消费内容
  advanceBy('-->'.length); // 消费注释结束不菲

  // 返回注释节点
  return {
    type: 'Comment',
    content,
  }
}

/**
 * 解析CDATA
 * @param {*} context 
 */ 
function parseCDATA(context, ancestors) {
  
}

/**
 * 解析标签
 * @param {*} context 上下文对象
 * @param {*} ancestors 由父代节点构成的节点栈 
 */ 
function parseElement(context,ancestors) {
  // 具体做了三件事
  // 1. 解析开始标签
  const element = parseTag(context);
  if(element.isSelfClosing) return element; // 自闭和标签

  if(element.tag === 'textarea' || element.tag === 'title') {
    context.mode = TextModes.RCDATA;
  } else if(/style|xmp|noembed|noframes|noscript/.test(element.tag)) {
    context.mode = TextModes.RAWTEXT;
  } else {
    context.mode = TextModes.DATA;
  }

  ancestors.push(element);

  element.children = parseChildren(context, ancestors); // 2. 递归调用，进行子节点解析

  ancestors.pop();

  if(context.source.startsWith(`</${element.tag}`)) {
    // 3. 解析结束标签
    parseTag(context, 'end');
  } else {
    console.error(`${element.tag} 标签缺少闭合标签`);
  }
  
  return element;
}

/**
 * 解析标签
 * @param {*} context 上下文对象
 * @param {String} type 标签类型 start--开始标签，end --结束标签
 */ 
function parseTag(context, type = 'start') {
  const { advanceBy, advanceSpaces } = context;

  const match = type === 'start' ? 
  /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source) :
  /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source);

  const tag = match[1]; // 匹配的是标签名称
  advanceBy(match[0].length); // 消费正则表达式匹配的全部内容，例如'<div'这段内容
  advanceSpaces(); // 消耗标签中无用的连续空白字符

  const props = parseAttributes(context);

  const isSelfClosing = context.source.startsWith('/>'); // 
  advanceBy(isSelfClosing ? 2 : 1); // 如果自闭和标签，消费‘/>’ 否则消费‘>’

  // 返回标签节点
  return {
    type: 'Element',
    tag, // 标签名称
    props, // 标签属性
    children: [], // 子节点
    isSelfClosing, // 是否自闭和标志
  }
}

/**
 * 解析插值
 * 解析器在解析插值时，只需要将⽂本插值的开始定界符与结束定界符之间的内容提取出来，作为 JavaScript 表达式即可
 * @param {*} context 
 */ 
function parseInterpolation(context) {
  const { advanceBy } = context;

  advanceBy('{{'.length); // 消费开始定界符
  
  const closeIndex = context.source.indexOf('}}'); // 结束定界符索引

  if(closeIndex < 0) {
    console.error('插值缺少结束定界符');
  }

  const content = context.source.slice(0, closeIndex); // 截取插值表达式

  advanceBy(content.length);

  advanceBy('}}'.length); // 消费结束定界符

  // 返回插值节点
  return {
    type: 'Interpolation',
    // 内容为一个表达式节点
    content: {
      type: 'Expression',
      content: decodeHtml(content), // 经过html解码后的插值表达式
    }
  }
}

/**
 * 解析文本
 * @param {*} context 
 */ 
function parseText(context) {
  const { advanceBy } = context;

  let endIndex = context.source.length; // 文本内容结尾索引

  const ltIndex = context.source.indexOf('<'); // 字符<的索引

  const delimiterIndex = context.source.indexOf('{{'); // 定界符{{的索引

  if(ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex; // 取较小一个作为结尾索引
  }

  if(delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex; // 取较小一个作为结尾索引
  }

  const content = context.source.slice(0, endIndex);

  advanceBy(content.length); // 消耗文本内容

  // 返回文本节点
  return {
    type: 'Text',
    content: decodeHtml(content),
  }
}


/**
 * 解析属性或指令
 * @param {*} context 
 */ 
function parseAttributes(context) {
  const { advanceBy, advanceSpaces } = context;
  const props = [];
  while(!context.source.startsWith('>') && !context.source.startsWith('/>')) {
    // 解析属性或指令
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source); // 匹配属性名称

    const name = match[0]; // 属性名

    advanceBy(name.length); // 消费属性名称

    advanceSpaces(); // 消费属性名称与等于号之间的空白符

    advanceBy(1); // 消费等于号

    advanceSpaces(); // 消费等于号与属性值之间的空白符

    let value = ''; // 属性值

    const quote = context.source[0]; // 获取当前模板内容第一个字符

    const isQuoted = quote === '"' || quote === "'"; // 判断属性值是否被引号引用

    if(isQuoted) {
      advanceBy(1); // 消费第一个引号
      const endQuoteIndex = context.source.indexOf(quote);
      if(endQuoteIndex > -1) {
        value = context.source.slice(0, endQuoteIndex);
        advanceBy(value.length); // 消费属性值
        advanceBy(1); // 消费第二个引号
      } else {
        // 第二个引号缺失
        console.error('缺少引号')
      }
    } else {
      // 属性值没有被引号引用，下一个空白字符之前的内容全部作为属性值
      const match = /^[^\t\r\n\f >]+/.exec(context.source);
      value = match[0];
      advanceBy(value.length);
    }

    advanceSpaces(); // 消费属性值后面的空白符

    props.push({
      type: 'Attribute',
      name,
      value,
    })

  }

  return props;
}

/**
 * HTML实体引用表
 * */ 
const namedCharacterReferences = {
  "gt": ">",
  "gt;": ">",
  "lt": "<",
  "lt;": "<",
  "ltcc;": "⪦"
}

/*
  HTML 数字字符引用实体对应的替换码点
  如果存在对应的替换码点，则渲染该替换码点对应的字符，否则
直接渲染原码点对应的字符
*/ 
const CCR_REPLACEMENTS = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178
}

/**
 * 解码HTML实体
 * @param {*} rawText 需被解码的文本内容
 * @param {Boolean} asAttribute 文本内容是否作为属性值，默认否
 */ 
function decodeHtml(rawText, asAttribute = false) {
  let offset = 0;
  const end = rawText.length;
  let decodedText = ''; // 解码后的文本
  let maxCRNameLength = 0; // 引用表中实体名称的最大长度

  // 用于消费指定长度的文本
  function advance(length) {
    offset += length;
    rawText = rawText.slice(length);
  }

  // 消费字符串，直至处理完毕为止
  while (offset < end) {
    /*
      匹配字符引用的开始部分，若匹配成功，head[0]有三种可能：
      1. head[0] === "&" 该字符引用为命名字符引用
      2. head[0] === "&#" 该字符引用为用十进制表示的数字字符引用
      3. head[0] === "&#x" 该字符引用为十六进制表示的数字字符
    */ 
    const head = /&(?:#x?)?/i.exec(rawText);

    // 没有匹配，说明没有需要解码的内容
    if(!head) {
      const remaining = end - offset; // 计算剩余内容长度
      decodedText += rawText.slice(0, remaining); // 将剩余内容加到decodeText上
      advance(remaining); // 消费剩余内容
      break;
    }

    decodedText += rawText.slice(0, head.index); // head.index 为匹配字符&在rawText中的位置索引

    advance(head.index); // 消费&之前的内容

    // 1. 命名字符引用
    if(head[0] === '&') {
      /*
        命名字符引⽤的解码⽅案可以总结为两种。
        当存在分号时：执⾏完整匹配。
        当省略分号时：执⾏最短匹配。
      */ 

      let name = '';
      let value;

      // 合法的命名字符引用： &的下一个字符必须是ASCII字母或数字
      if(/[0-9a-z]/i.test(rawText[1])) {
        // 根据引用表计算实体名称的最大长度
        if(!maxCRNameLength) {
          maxCRNameLength = Object.keys(namedCharacterReferences).reduce((prev, cur) => Math.max(prev, cur.length), 0);
        }

        for (let l = maxCRNameLength; !value && l > 0; --l) {
          name = rawText.slice(1, l); // 字符&到最大长度之间的字符作为实体名称
          value = (namedCharacterReferences)[name]; // 查找到对应的实体值
        }

        // 查找到对应项的值，说明解码成功
        if(value) {
          const semi = name.endsWith(';'); // 检查实体名称最后一个匹配字符是否为分号

          /*
            如果解码的文本作为属性值，最后一个字符不是分号，
            且最后一个匹配字符的下一个字符为等于号（=），ASCII字母或数字，
            出于历史原因，将字符&和实体名称name作为普通文本
          */ 
          if(asAttribute && !semi && /[=a-z0-9]/i.test(rawText[name.length + 1] || '')) {
            decodedText += '&' + name;
            advance(1 + name.length); // 消费字符& + name
          } else {
            // 其他情况，正常解码，并将解码后的内容拼接到decodedText上
            decodedText += value;
            advance(1 + name.length);
          }
        } else {
          // 解码失败

          decodedText += '&' + name;
          advance(1 + name.length);
        }
      } else {
        // 字符& 的下一个字符不是ASCII字母或数字，则将字符&作为普通文本
        decodedText += '&';
        advance(1);
      }
    } else{
      // 2. 数字字符引用
      const hex = head[0] === '&#x'; // 判断十六进制|十进制
      const pattern = hex ? /^&#x([0-9a-f]+);?/i : /^&#([0-9]+);?/

      const body = pattern.exec(rawText); // body[1]为unicode码点

      // 匹配成功，调用String.fromCodePoint进行解码
      if(body) {
        // 将码点字符串转为数字
        const cp = Number.parseInt(body[1], hex ? 16 : 10);

        // 码点 0xfffd 对应的符号是 �
        // 码点的合法性检查
        if(cp === 0) {
          // 码点为0x00替换为0xfffd
          cp = 0xfffd;
        } else if(cp > 0x10ffff) {
          // 码点超过unicode的最大值，替换为0xfffd
          cp = 0xfffd;
        } else if(cp >= 0xd800 && cp <= 0xdfff) {
          /*
            （Surrogate Pair是UTF-16中用于扩展字符而使用的编码方式，是一种采用四个字节(两个UTF-16编码)来表示一个字符）
            代理对（surrogate pair）范围内，这也是⼀个
            解析错误，解析器会将码点值替换为 0xFFFD，其中 surrogate
            pair 是预留给 UTF-16 的码位，其范围是：[0xD800,
            0xDFFF]。
          */ 
          cp = 0xfffd;
        } else if((cp >= 0xfdd0 && cp <= 0xfdef) || (cp && 0xfffe) === 0xfffe) {
          /*
            noncharacter 代表 Unicode 永久保留的码点，⽤于 Unicode 内部
          */ 
          // 则什么都不做，交由平台处理
          // noop
        } else if((cp >= 0x01 && cp <= 0x08) ||
          cp === 0x0b ||
          (cp >= 0x0d && cp <= 0x1f) ||
          (cp >= 0x7f && cp <= 0x9f)
        ) {
          /*
            控制字符集（control character）的的范围是：[0x01, 0x1f] 加上 [0x7f, 0x9f];
            且去点ASCII空白符： 0x09(TAB), 0x0A(LF), 0x0c(FF);
            0x0D(CR)虽然也是空白符，但需包含
          */ 
          

          // 在CCR_REPLACEMENTS查找替换码点
          cp = CCR_REPLACEMENTS[cp] || cp;
        }

        decodedText += String.fromCodePoint(cp); // 解码并追加到decodedText上
        advance(body[0].length); // 消费
      } else {
        // 无匹配，不解码，直接追加并消费
        decodedText += head[0];
        advance(head[0].length);
      }

    }
  }

  return decodedText;
}


const template = `<div :id="dynamicId" @click="handler" v-on:mousedown="onMouseDown" >text</div>`;

const testAst = parse(template);

console.log(testAst, 'parse template  --- testAst');


