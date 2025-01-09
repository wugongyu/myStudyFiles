// component config 组件形式1--函数形式
const MyComponent = function() {
  return {
    tag: 'div',
    prop: {
      onClick: () =>{
        alert('MyComponent')
      }
    },
    children: 'children text',
  }
}

// virtual dom 
const vnode = {
  tag: MyComponent,
}
// 组件形式2--对象形式
const MyComponent2 = {
  render: () => ({
    tag: 'div',
    prop: {
      onClick: () =>{
        alert('MyComponent')
      }
    },
    children: 'children text',
  })
}

// virtual dom 
const vnode2 = {
  tag: MyComponent2,
}
// 渲染器
function renderer(vnode, container) {
  if(typeof vnode.tag === 'string') {
    // vnode --标签元素
    mountElement(vnode, container)
  } 
  // else if(typeof vnode.tag === 'function') 
  else if(typeof vnode.tag === 'object')
  {
    // vnode -- 组件
    mountComponent(vnode, container)
  }
}

function mountElement(vnode, container) {
  const { tag, prop, children } = vnode;
  const el = document.createElement(tag);
  for (const key in prop) {
    if (Object.hasOwnProperty.call(prop, key)) {
      if(/^on/.test(key)){
        el.addEventListener(
          key.substring(2).toLowerCase(), // onClick -> click
          prop[key],
        )
      }
    }
  }

  if(typeof children === 'string') {
    el.appendChild(document.createTextNode(children));
  } else if(Array.isArray(children)) {
    children.forEach(child => renderer(child, el))
  }

  container.appendChild(el)
}

function mountComponent(vnode, container) {
  // const subTree = vnode.tag(); // 获取到组件要渲染的内容（虚拟DOM）
  const subTree = vnode.tag.render();
  renderer(subTree, container);
}