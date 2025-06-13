$/*
  同构渲染
*/ 

const ElementVNode = {
  type: 'div',
  props: {
    id: 'foo',
  },
  children: [
    { type: 'p', children: 'hello' },
  ]
}

/*
  自闭和标签
*/ 

const VOID_TAGS = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',');


/**
 * 将虚拟节点渲染为HTML字符串
 * @param {*} vnode 虚拟节点
 */ 
function renderElementVNode(vnode) {
  const { type: tag, props, children } = vnode;
  const isVoidElement = VOID_TAGS.includes(tag);

  let returnStr = `<${tag}`;

  if(props) {
    returnStr += renderAttributes(props);
  }

  returnStr += isVoidElement ? '/>' : '>';

  if(typeof children === 'string') {
    returnStr += children
  } else {
    children.forEach(child => {
      returnStr += renderElementVNode(child)
    });
  }

  returnStr += `</${tag}>`;
  
  return returnStr;
}

// 应该忽略的属性
const shouldIgnoreProp = ['key', 'ref'];

/**
 * 对props的处理
 * @param {*} props 
 */ 
function renderAttributes(props) {
  let returnStr = '';
  for (const key in props) {
    // 检测属性名称，如果是事件或应该被忽略的属性，则忽略它
    if (shouldIgnoreProp.includes(key) || /^on[^a-z]/.test(key)) {
      continue;
    }

    const value = props[key];

    returnStr += renderDynamicAttr(key, value);
  }

  return returnStr
}

function renderDynamicAttr(params) {
  
}

