/*
  vue的内建组件
*/


/**
 * KeepAlive组件
 * */ 
const KeepAlive = {
  __isKeepAlive: true, // KeepAlive组件独有的属性
  props: {
    include: RegExp, // 显式地配置应该被缓存的组件（name）匹配规则
    exclude: RegExp, // 显式地配置不应该被缓存的组件（name）匹配规则
    max: Number, // 缓存的容量
  },
  setup(props, {slots}) {
    /*
      缓存不存在时会设置新缓存，因此会导致缓存不断增加，极端情况下占用大量内存
      优化：设置⼀个缓存阈值，当缓存数量超过指定阈值时对缓存进⾏修剪。
      “最新⼀次访问”的缓存修剪策略的核⼼在于，需要把当前访问（或渲染）的组件作为最新⼀次渲染的组件，并且该组件在缓存修剪
      过程中始终是安全的，即不会被修剪。
    */ 

    const cache = new Map(); // 创建缓存对象，key: vnode.type, value: vnode
    const instance = currentInstance;

    /*
      keepAliveCtx为KeepAlive组件独有的由渲染器注入的对象，
      其包含一些渲染器的内部方法，例如move函数（将DOM移动到另一个容器中）等。
    */ 
    const { move, createElement } = instance.keepAliveCtx; 

    const storageContainer = createElement('div'); // 创建隐藏容器

    // 在实例上添加两个内部函数以便在渲染器中被调用
    instance._deActive = (vnode) => {
      move(storageContainer, vnode); // 使组件失活，即把组件所渲染的内容移动到隐藏容器中
    }
    instance._activate = (vnode, container, anchor) => {
      move(container, vnode, anchor); // 激活组件，即把组件所渲染的内容从隐藏容器中搬运回原来的容器
    }

    return () => {
      let rawVNode = slots.default(); // KeepAlive的默认插槽即为被KeepAlive的组件
      
      // 非组件，直接渲染即可（非组件的虚拟节点无法被keepalive）
      if(typeof rawVNode.type !== 'object') {
        return rawVNode
      }

      const name = rawVNode.type.name; // 内部组件name

      if(name && ((props.include && !props.include.test(name)) ||
      (props.exclude && props.exclude.test(name)))) {
        // 不用keepAlive的组件，直接渲染“内部组件”
        return rawVNode;
      }

      const cacheVNode = cache.get(rawVNode.type); // 在挂载时先获取缓存的节点

      if(cacheVNode) {
        // 有缓存组件，不进行挂载而是激活，继承组件实例
        rawVNode.component = cacheVNode.component;
        rawVNode.keptAlive = true; // keptAlive：当前组件已被激活标志
      } else {
        // 缓存不存在
        cache.set(rawVNode.type, rawVNode); // 将组件添加至缓存中
      }

      /*
        当前内部组件需要被keepalive的标志，提示渲染器当前组件不能被“真卸载”，
        而是调用内部的_deActive方法使其“失活”
      */ 
      rawVNode.shouldKeepAlive = true;

      rawVNode.keepAliveInstance = instance;

      return rawVNode; // 渲染函数返回最终要渲染的组件
    }
  }
}


/*
  2. Teleport组件
*/ 

const Teleport = {
  __isTeleport: true, // Teleport组件独有属性
  props: {
    to: String | Document, // 容器，挂载点
  },
  /**
   * Teleport组件的自定义渲染逻辑
   * @param {*} n1 旧虚拟节点
   * @param {*} n2 新虚拟节点
   * @param {*} container 挂载容器
   * @param {*} anchor 锚点
   * @param {*} internals 渲染器的内部方法
   */
  process(n1, n2, container, anchor, internals) {
    const { patch, patchChildren, move } = internals;

    if(!n1) {
      // 旧节点不存在，进行挂载

      const targetProp = n2.props.to;
      // 获取挂载点
      const target = typeof targetProp === 'string' ?
        document.querySelector(targetProp) : targetProp;
      
      // 将n2.children逐一渲染到挂载点即可
      n2.children.forEach(element => {
        patch(null, element, target, anchor)
      });
    } else {
      // 更新
      patchChildren(n1, n2, container);

      // 新旧的to参数不同，需对内容进行移动
      if(n1.props.to !== n2.props.to) {
        const newTargetProp = n2.props.to;
        // 获取新容器
        const newTarget = typeof newTargetProp === 'string' ?
          document.querySelector(newTargetProp) : newTargetProp;
        
        // 移动到新容器上
        n2.children.forEach(c => move(newTarget, c))
      }
    }
  }
}

function nextFrame(callbackFn) {
  return requestAnimationFrame(() => {
    requestAnimationFrame(callbackFn);
  })
}

/*
  3. Transition组件
*/ 
const Transition = {
  name: 'Transition',
  setup(props, { slots }) {
    return () => {
      const innerVNode = slots.default(); // 通过默认插槽获取到需要过度的元素

      innerVNode.transition = {
        beforeEnter(el) {
          // 设置初始状态
          el.classList.add('enter-from');
          el.classList.add('enter-active');
        },
        enter(el) {
          // 在下一帧切换到结束状态
          nextFrame(() => {
            el.classList.remove('enter-from');
            el.classList.add('enter-to');
            // 监听transitionend事件完成收尾工作
            el.addEventListener('transitionend', () => {
              el.classList.remove('enter-to');
              el.classList.remove('enter-active');
            })
          })
        },
        leave(el, performRemove) {
          // 设置离场过渡初始状态
          el.classList.add('leave-from');
          el.classList.add('leave-active');

          document.body.offsetHeight; // 强制reflow，使得初始状态生效

          // 在下一帧修改状态
          nextFrame(() => {
            el.classList.remove('leave-from');
            el.classList.add('leave-to');
             // 监听transitionend事件完成收尾工作
            el.addEventListener('transitionend', () => {
              el.classList.remove('leave-to');
              el.classList.remove('leave-active');
              performRemove(); // 完成dom的卸载
            })
          })


        }
      }
      return innerVNode;
    }
  }
}