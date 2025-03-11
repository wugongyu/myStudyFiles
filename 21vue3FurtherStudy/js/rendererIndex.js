const { effect, ref } = VueReactivity;

const Text = Symbol(); // 文本节点标识
const Comment = Symbol(); // 注释节点标识
const Fragment = Symbol(); // 多根节点模板标识
const currentInstance = null; // 存储当前正在被初始化的组件实例

/** 
  渲染器
*/ 
// function renderer(domStr, container) {

// }

/**
   * 判断是否可设置为dom属性
   * @param el DOM元素
   * @param key 属性名
   * @param value 属性值
   * */ 
function shouldSetAsDomProps(el, key, value) {
  if(key === 'form' && el.tagName === 'INPUT') return false; // input html元素的form属性只读，因而不可设置属性
  return key in el; // 兜底判断--设置的属性是否DOM属性
}

/**
 * 对class值进行序列化
 * */ 
function normalizeClass(classes) {
  return 'a b c';
}

/**
 * 创建一个渲染器
 * @param options 将操作DOM的api作为配置选项传入
 * */ 
function createRenderer(options = {}) {
  const {
    createElement,
    appendChild,
    removeChild,
    setElementText,
    insert,
    patchProps,
    createText,
    setText,
    createComment,
  } = options; // 获取操作DOM的api
  /**
   * 卸载操作
   * */
  function unmount(vnode) {
    const needTransition = vnode.transition;

    if (vnode.type === Fragment) {
      vnode.children.forEach(child => unmount(child));
      return;
    } else if (typeof vnode.type === 'object') {
      if (vnode.shouldKeepAlive) {
        // 当前组件需要被keepalive,不能直接卸载，而是调用_deActive方法使其失活
        vnode.keepAliveInstance._deActive(vnode);
      } else {
        // 对于组件的卸载，本质上是要卸载组件所渲染的内容，即subTree
        unmount(vnode.component.subTree);
      }
      return;
    }
    const el = vnode.el;
    const parent = el.parentNode;
    if (parent) {
      const performRemove = () => removeChild(parent, el); // 封装卸载操作
      if(needTransition) {
        vnode.transition.leave(el, performRemove); 
      } else {
        performRemove(); // 无需过渡处理，直接执行卸载操作
      }
    }
  }

  /**
   * 挂载操作
   * @param {*} vnode 挂载虚拟节点
   * @param {*} container 挂载容器
   * @returns
   */
  function render(vnode, container) {
    console.log(vnode, container, 'in render');
    if (!container) return;
    if (vnode) {
      // 新的vnode存在，与旧vnode一起进行打补丁（差异化更新操作）
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 旧vnode存在且新vnode不存在，说明是卸载操作
        unmount(container._vnode);
      }
    }
    container._vnode = vnode; // 更新存储旧的vnode
  }

  /**
    打补丁 | 挂载
    @param n1 旧vnode
    @param n2 新vnode
    @param container 容器
    @param anchor 挂载元素时的锚点元素
  */
  function patch(n1, n2, container, anchor) {
    console.log(n1, n2, container, 'in patch');
    // n1存在，对比新旧vnode的类型
    if (n1 && n1.type !== n2.type) {
      // 两个vnode类型不相同，先卸载n1
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;

    if (typeof type === 'string') {
      // 字符串类型，代表的是普通html标签
      if (!n1) {
        // 旧节点不存在，进行挂载
        mountElement(n2, container, anchor);
      } else {
        // 打补丁
        patchElement(n1, n2);
      }
    } else if (type === Text) {
      // 文本节点
      if (!n1) {
        // 挂载 文本节点
        const el = (n2.el = createText(n2.children));
        insert(container, el);
      } else {
        // 更新文本节点
        if (n2.children !== n1.children) {
          const el = (n2.el = n1.el);
          setText(el, n2.children);
        }
      }
    } else if (type === Comment) {
      // 注释节点
      if (!n1) {
        // 挂载
        const el = (n2.el = createComment(n2.children));
        insert(container, el);
      } else {
        // 更新注释节点
        if (n2.children !== n1.children) {
          const el = (n2.el = n1.el);
          setText(el, n2.children);
        }
      }
    } else if (type === Fragment) {
      // Fragment组件： Fragment 本⾝并不会渲染任何 DOM 元素。所以，只需要渲染⼀个 Fragment 的所有⼦节点即可
      if (!n1) {
        // 逐个挂载
        n2.children.forEach(child => {
          patch(null, child, container);
        });
      } else {
        // 更新
        patchChildren(n1, n2, container);
      }
    } else if(typeof type === 'object' && type.__isTeleport) {
      /*
      内建的Teleport组件：将渲染器的操作交接给Teleport中的process函数
      */ 
      type.process(n1, n2, container, anchor, {
        patch,
        patchChildren,
        unmount,
        move(container, vnode,  anchor) {
          insert(container, vnode.component 
            ? vnode.component.subTree.el // 移动一个组件
            : vnode.el, // 移动普通元素
          anchor);
        }
      })

    } else if (typeof type === 'object' || typeof type === 'function') {
      // 对象类型，代表vnode描述的是有状态组件
      // 函数类型，代表的是无状态的函数式组件
      if (!n1) {
        if (n2.keptAlive) {
          // 当前组件KeepAlive，keptAlive为true即已被缓存，无需重新挂载，使用_activate方法来激活组件即可
          n2.keepAliveInstance._activate(n2, container, anchor);
        } else {
          // 组件挂载
          mountComponent(n2, container, anchor);
        }
      } else {
        patchComponent(n1, n2, anchor);
      }
    } else {
      // 其他类型的vnode
    }
  }

  /**
   * 挂载html标签元素
   * @param vnode 虚拟Dom节点
   * @param container 容器
   * @param anchor 锚点元素
   * */
  function mountElement(vnode, container, anchor) {
    console.log('in mountElement', vnode, container);

    const el = (vnode.el = createElement(vnode.type)); // 使得vnode与真实DOM元素之间建立联系

    // 处理子节点children
    // 1.子节点类型为字符串--即子节点为文本节点
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(childVNode => {
        patch(null, childVNode, el);
      });
    }

    // 处理dom属性 props
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }

    // 判断一个vnode是否需要过渡
    const needTransition = vnode.transition;
    if(needTransition) {
      vnode.transition.beforeEnter(el); // 挂载元素之前， 调用transition中的钩子函数，并将dom元素作为参数传递
    }

    insert(container, el, anchor); // 将元素添加到容器上

    if(needTransition) {
      vnode.transition.enter(el); // 挂载元素后，调用transition.enter 钩子函数
    }
  }

  /**
    打补丁--差异更新函数
    @param n1 旧vnode
    @param n2 新vnode
  */
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;

    // 更新props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }

    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }

    // 更新子节点
    patchChildren(n1, n2, el);
  }

  const queue = new Set(); // 任务缓存队列（Set数据结构可去重）
  let isFlushing = false; // 是否正在刷新任务列表的标志
  const p = Promise.resolve();

  /**
   * 组件更新的调度器
   * */
  function queueJob(job) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      // 在微任务中刷新缓冲队列
      p.then(() => {
        try {
          queue.forEach(fn => fn()); // 执行任务队列中的任务
        } finally {
          isFlushing = false;
          queue.clear = 0;
        }
      });
    }
  }

  /**
   * 处理组件props
   * @param options 组件props选项
   * @param propsData 传递的props数据
   * */
  function resolveProps(options, propsData) {
    const props = {};
    const attrs = {};
    for (const key in propsData) {
      // 候对事件类型的 props做特殊处理
      if (key in options || key.startsWith('on')) {
        props[key] = propsData[key];
      } else {
        attrs[key] = propsData[key];
      }
    }
    return [props, attrs];
  }

  /**
   * 校验组件props是否发生了变化
   * */
  function hasPropsChanged(prevProps, nextProps) {
    const nextPropsKeys = Object.keys(nextProps);
    const prevPropsKeys = Object.keys(prevProps);
    if (nextPropsKeys.length !== prevPropsKeys.length) return true; // 新旧props长度发生了变化
    for (let i = 0; i < nextPropsKeys.length; i++) {
      const propItemKey = nextPropsKeys[i];
      if (prevProps[propItemKey] !== nextProps[propItemKey]) return true; // 新旧props中，相同key的值不同，说明发生了变化
    }
    return false;
  }

  /**
   * 设置当前正在初始化的组件实例
   * @param {*} instance
   */
  function setCurrentInstance(instance) {
    currentInstance = instance;
  }

  /**
   * 注册生命周期钩子函数方法
   * @param {*} fn
   */
  function onMounted(fn) {
    if (currentInstance) {
      currentInstance.mounted.push(fn); // 将⽣命周期函数添加到 instance.mounted 数组中
    } else {
      console.error('onMounted函数只能在setup函数中调用');
    }
  }

  /**
   * 挂载组件
   * @param vnode 组件节点
   * @param container 容器
   * @param anchor 挂载元素时的锚点元素
   * */
  function mountComponent(vnode, container, anchor) {
    const isFunctional = typeof vnode.type === 'function';
    let componentOptions = vnode.type;
    if (isFunctional) {
      // // 如果是函数式组件，则将 vnode.type 作为渲染函数，将vnode.type.props 作为 props 选项定义即可
      componentOptions = {
        render: vnode.type,
        props: vnode.type.props,
      };
    }

    const {
      render,
      data,
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated, // 获取组件生命周期钩子函数
      props: propsOptions,
      setup,
    } = componentOptions || {};

    beforeCreate && beforeCreate();

    const state = data ? reactive(data()) : null; // 将原始数据报装成响应式数据

    const [props, attrs] = resolveProps(propsOptions, vnode.props);

    const slots = vnode.children || {}; // 插槽内容

    // 组件实例（对象），它包含组件有关的状态信息
    const instance = {
      state,
      isMounted: false, // 组件是否已经被挂载的标志
      subTree: null, // 组件所渲染的内容，即子树
      props: shallowReactive(props),
      slots,
      mounted: [], // 用来存放通过onMounted添加到生命周期钩子函数
      keepAliveCtx: null, // KeepAlive组件所独有的属性
    };

    const isKeepAlive = vnode.type.__isKeepAlive;
    if(isKeepAlive) {
      instance.keepAliveCtx = {
        move(container, vnode, anchor) {
          // 将组件渲染的内容移动到指定容器中
          insert(container, vnode.component.subTree.el, anchor);
        },
        createElement,
      }
    }

    vnode.component = instance;

    /**
     *
     * @param {String} eventName 事件名
     * @param  {...any} payload 事件参数
     */
    function emit(eventName, ...payload) {
      const eventPropName = `on${eventName[0].toUpperCase() + eventName.slice(1)}`; // change -> onChange
      const handler = instance.props[eventPropName];
      if (handler) {
        handler(payload);
      } else {
        console.error('事件不存在');
      }
    }

    const setupContext = {
      attrs,
      emit,
    }; // setup 上下文对象

    setCurrentInstance(instance); // 在setup函数执行之前设置当前instance
    const setupResult = setup(shallowReadonly(instance.props), setupContext); // setup函数返回的结果
    setCurrentInstance(null); // 在setup函数执行之后置空当前instance

    let setupState = null; // setup函数返回的对象数据

    if (typeof setupResult === 'function') {
      if (render) console.error('setup函数返回渲染函数，render选项将被忽略');
      render = setupResult;
    } else {
      setupState = setupResult;
    }

    /*
  由于 props 数据与组件⾃⾝的状态数据都需要暴露到渲染函数中，并使得渲染函数能够通过 this 访问它们，因此我们需要封装⼀
  个渲染上下⽂对象
  */

    // 创建渲染上下文对象，本质上是利用proxy实现对实例instance的代理
    const renderContext = new Proxy(instance, {
      get(target, key, receiver) {
        const { props, state, slots } = target;
        if (key === '$slots') return slots; // 能够通过 this.$slots 来访问插槽内容
        if (state && key in state) {
          return state[key];
        } else if (key in props) {
          return props[key];
        } else if (setupState && key in setupState) {
          // 支持对setup中返回的数据的读取
          return setupState[key];
        } else {
          console.error('不存在');
        }
      },
      set(target, key, value, receiver) {
        const { props, state } = target;
        if (state && key in state) {
          state[key] = value;
        } else if (key in props) {
          console.error(`Attempting to mutate prop ${key}, props readonly`);
        } else if (setupState && key in setupState) {
          // 支持对setup中返回的数据的读取
          setupState[key] = value;
        } else {
          console.error('不存在');
        }
      },
    });

    // created && created.call(state);

    /*
  拦截数据状态的读取和设置操作，每当在渲染函数或⽣命周期钩⼦中通过 this 来读取数据时，都
会优先从组件的⾃⾝状态中读取，如果组件本⾝并没有对应的数据，
则再从 props 数据中读取（除了状态数据，还包括在methods里定义的方法， computed里定义的数据也要放进渲染上下文对象中）
  */
    created && created.call(renderContext);

    // 把渲染任务包装到effect中，当组件自身状态发生变化时，触发组件进行自更新
    effect(
      () => {
        // const subTree = render.call(state, state); // 获取到组件所对应的虚拟DOM节点，同时将this指向state，使得render函数内部可以访问组件自身状态数据
        const subTree = render.call(renderContext, renderContext);

        if (!instance.isMounted) {
          instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext)); // 遍历 instance.mounted 数组并逐个执⾏即可

          // beforeMount && beforeMount.call(state);
          beforeMount && beforeMount.call(renderContext);

          // 初次挂载
          patch(null, subTree, container, anchor); // 挂载组件节点内容
          instance.isMounted = true; // 更新标志

          // mounted && mounted.call(state)
          mounted && mounted.call(renderContext);
        } else {
          // beforeUpdate && beforeUpdate.call(state);
          beforeUpdate && beforeUpdate.call(renderContext);
          patch(instance.subTree, subTree, container, anchor); // 打补丁

          // updated && updated.call(state);
          updated && updated.call(renderContext);
        }
        instance.subTree = subTree; // 更新组件实例的子树
      },
      {
        schedular: queueJob, // 指定副作用函数的调度器
      },
    );
  }

  /**
   * 更新组件
   * */
  function patchComponent(n1, n2, anchor) {
    const instance = (n2.component = n1.component); // 获取组件实例
    const { props } = instance; // 由于props是浅响应数据，所以更新props数据会触发组件重新渲染

    // // 调⽤ hasPropsChanged 检测为⼦组件传递的 props 是否发⽣变化，如果没有变化，则不需要更新
    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props);

      // 更新props
      for (const key in nextProps) {
        props[key] = nextProps[key];
      }

      // 删除不存在的props
      for (const key in props) {
        if (!(key in nextProps)) {
          delete props[key];
        }
      }
    }
  }

  /**
   * 简单DIFF算法
   * @param n1 旧vnode
   * @param n2 新vnode
   * @param container 容器
   * */
  function simpleDiff(n1, n2, container) {
    console.log('patch children diff', n1, n2, container);
    // 旧子节点也为一组子节点时，此处涉及到核心diff算法
    const newVNodeChildren = n2.children;
    const oldVNodeChildren = n1.children;
    let lastIndex = 0; // 最大索引值
    for (let i = 0; i < newVNodeChildren.length; i++) {
      const newNode = newVNodeChildren[i];
      let find = false; // 新子节点是否存在于旧子节点组中的标志
      for (let j = 0; j < oldVNodeChildren.length; j++) {
        const oldNode = oldVNodeChildren[j];
        if (oldNode.key === newNode.key) {
          find = true;
          // 节点key相同，可复用
          patch(oldNode, newNode, container);
          if (j < lastIndex) {
            // 在旧vnode中的索引小于最大索引值，需要移动真实DOM
            const prevVNode = newVNodeChildren[i - 1]; // 如果prevVNode不存在，代表当前vnode为第一个节点
            if (prevVNode) {
              const anchor = prevVNode.el.nextSibling; // 获取prevVNode所对应的真实dom的下一个兄弟节点，并把它作为锚点
              insert(container, newNode.el, anchor); // 将newNode对应的真实DOM插入到anchor锚点元素前面，也就是prevVNode对应的真实DOM后边
            }
          } else {
            // 无需移动，直接更新最大索引值
            lastIndex = j;
          }
          break; // 找到可复用节点后跳出当前内循环
        }
      }

      if (!find) {
        // 新增节点
        const prevVNode = newVNodeChildren[i - 1];
        let anchor;
        if (prevVNode) {
          // prevVNode，如果存在，则使⽤它对应的真实 DOM 的下⼀个兄弟节点作为锚点元素
          anchor = prevVNode.el.nextSibling;
        } else {
          // 容器元素的 container.firstChild 作为锚点元素
          anchor = container.firstChild;
        }
        // 挂载新节点
        patch(null, newNode, container, anchor);
      }
    }

    // 遍历旧节点组，找出不存在于新节点组的节点，并进行卸载操作
    for (let i = 0; i < oldVNodeChildren.length; i++) {
      const oldNode = oldVNodeChildren[i];
      const has = newVNodeChildren.find(item => item.key === oldNode.key);
      if (!has) {
        unmount(oldNode);
      }
    }
  }

  /**
   * 双端DIFF算法
   * @param n1 旧vnode
   * @param n2 新vnode
   * @param container 容器
   * */
  function towTerminalDiff(n1, n2, container) {
    let oldVNodeChildren = n1.children;
    let newVNodeChildren = n2.children;

    // 四个端点索引
    let oldStartIndex = 0;
    let oldEndIndex = oldVNodeChildren.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newVNodeChildren.length - 1;

    // 四个端点索引指向的节点
    let oldStartVNode = oldVNodeChildren[oldStartIndex];
    let oldEndVNode = oldVNodeChildren[oldEndIndex];
    let newStartVNode = newVNodeChildren[newStartIndex];
    let newEndVNode = newVNodeChildren[newEndIndex];

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 增加两个判断分⽀，如果头尾部节点为 undefined，则说明该节点已经被处理过了，直接跳到下⼀个位置
      if (!oldStartVNode) {
        oldStartVNode = oldVNodeChildren[++oldStartIndex];
      } else if (!oldEndVNode) {
        oldEndVNode = oldVNodeChildren[--oldEndIndex];
      } else if (oldStartVNode.key === newStartVNode.key) {
        // 新旧头部节点可复用，仅对新旧节点打补丁，不移动DOM元素位置
        patch(oldStartVNode, newStartVNode, container);
        oldStartVNode = oldVNodeChildren[++oldStartIndex];
        newStartVNode = newVNodeChildren[++newStartIndex];
      } else if (oldEndVNode.key === newEndVNode.key) {
        // 新旧尾部节点可复用，仅对新旧节点打补丁，不移动DOM元素位置
        patch(oldEndVNode, newEndVNode, container);
        oldEndVNode = oldVNodeChildren[--oldEndIndex];
        newEndVNode = newVNodeChildren[--newEndIndex];
      } else if (oldStartVNode.key === newEndVNode.key) {
        // 旧头部节点与新尾部节点，可复用
        patch(oldStartVNode, newEndVNode, container); // 打补丁
        insert(container, oldStartVNode.el, oldEndVNode.el.nextSibling); // 头部节点移动到尾部节点之后，即头部节点移动到尾部节点的下一个兄弟节点之前
        oldStartVNode = oldVNodeChildren[++oldStartIndex];
        newEndVNode = newVNodeChildren[--newEndIndex];
      } else if (oldEndVNode.key === newStartVNode.key) {
        // 旧尾部节点与新头部节点，可复用
        patch(oldEndVNode, newStartVNode, container); // 打补丁
        insert(container, oldEndVNode.el, oldStartVNode.el); // 尾部节点DOM元素移动到头部节点DOM元素前边

        /*更新节点与索引*/
        oldEndVNode = oldVNodeChildren[--oldEndIndex];
        newStartVNode = newVNodeChildren[++newStartIndex];
      } else {
        // 没有找到前四种可复用的节点的情况，在此处理
        // 遍历旧的⼀组⼦节点，试图寻找与 newStartVNode 拥有相同 key 值的节点
        // idxInOld 就是新的⼀组⼦节点的头部节点在旧的⼀组⼦节点中的索引
        const idxInOld = oldVNodeChildren.find(item => item.key === newStartVNode.key);

        if (idxInOld > 0) {
          // 找到可复用节点
          const oldVNodeToMove = oldVNodeChildren[idxInOld];
          patch(oldVNodeToMove, newStartVNode, container); // 打补丁
          insert(container, oldVNodeToMove.el, oldStartVNode.el); // 当前节点DOM元素移动到第一个节点DOM元素之前

          // 由于位置 idxInOld 处的节点所对应的真实 DOM 已经移动到了别处，因此将其虚拟DOM设置为 undefined
          oldVNodeChildren[idxInOld] = undefined;
        } else {
          // 没有找到，说明当前newStartVNode为新增节点
          // 将 newStartVNode 作为新节点挂载到头部，使⽤当前头部节点oldStartVNode.el 作为锚点
          patch(null, newStartVNode, container, oldStartVNode.el); // 挂载新节点
        }
        newStartVNode = newVNodeChildren[++newStartIndex]; // 新的⼀组⼦节点中的头部节点已经处理完毕，因此将索引前进到下⼀个位置
      }
    }

    // 循环结束后
    if (oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex) {
      // 增加对遗漏的新增节点的处理
      // 索引值位于 newStartIndex 和 newEndIndex 这个区间内的节点都是新节点。
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        patch(null, newVNodeChildren[i], container, oldStartVNode.el); // 循环挂载新增节点
      }
    } else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
      // 移除节点
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        unmount(oldVNodeChildren[i]);
      }
    }
  }

  /**
   * 快速diff算法
   * @param n1 旧vnode
   * @param n2 新vnode
   * @param container 容器
   * */
  function fastDiff(n1, n2, container) {
    let oldVNodeChildren = n1.children;
    let newVNodeChildren = n2.children;

    // 更新相同的前置节点
    let j = 0;
    let newVNode = newVNodeChildren[j];
    let oldVNode = oldVNodeChildren[j];
    while (newVNode.key === oldVNode.key) {
      patch(oldVNode, newVNode, container);
      j++;
      newVNode = newVNodeChildren[j];
      oldVNode = oldVNodeChildren[j];
    }

    // 更新相同的后置节点
    let oldVNodeEndIndex = oldVNodeChildren.length - 1;
    let newVNodeEndIndex = newVNodeChildren.length - 1;
    newVNode = newVNodeChildren[newVNodeEndIndex];
    oldVNode = oldVNodeChildren[oldVNodeEndIndex];
    while (newVNode.key === oldVNode.key) {
      patch(oldVNode, newVNode, container);
      newVNode = newVNodeChildren[--newVNodeEndIndex];
      oldVNode = oldVNodeChildren[--oldVNodeEndIndex];
    }

    // 未被处理的新增节点(j ~ newVNodeEndIndex之间的节点)
    if (j > oldVNodeEndIndex && j <= newVNodeEndIndex) {
      const anchorIndex = newVNodeEndIndex + 1;

      // 当节点为尾部节点时，无需提供锚点元素
      const anchor =
        anchorIndex < newVNodeChildren.length ? newVNodeChildren[anchorIndex].el : null;

      while (j <= newVNodeEndIndex) {
        patch(null, newVNodeChildren[j++], container, anchor); // 挂载新节点
      }
    } else if (j > newVNodeEndIndex && j <= oldVNodeEndIndex) {
      // 卸载未被处理的旧节点（j~oldVNodeEndIndex之间的节点）
      while (j <= oldVNodeEndIndex) {
        unmount(oldVNodeChildren[j++]);
      }
    } else {
      // 处理非理想情况

      const count = newVNodeEndIndex - j + 1; // 新子节点中剩余未处理节点数量
      const sources = new Array(count);
      sources.fill(-1);

      const oldStartIndex = j;
      const newStartIndex = j;

      /*
    优化：构建索引表
    优化的⽬的，我们
    可以为新的⼀组⼦节点构建⼀张索引表，⽤来存储节点的 key 和节点
    位置索引之间的映射
    */
      const keyIndex = {};
      let moved = false; // 是否需要移动节点
      let pos = 0; // 遍历旧的⼀组⼦节点的过程中遇到的最⼤索引值 k
      let patched = 0; // 已更新过的节点数量

      for (let i = newStartIndex; i <= newVNodeEndIndex; i++) {
        keyIndex[newVNodeChildren[i].key] = i;
      }

      for (let i = oldStartIndex; i < oldVNodeEndIndex; i++) {
        oldVNode = oldVNodeChildren[i];

        // 更新过的节点数量⼩于等于需要更新的节点数量，则执⾏更新
        if (patched < count) {
          // 快速找到当前旧节点在新子节点组中的位置
          const k = keyIndex[oldVNode.key];
          if (typeof k !== undefined) {
            newVNode = newVNodeChildren[k];
            patch(oldNode, newVNode, container);
            sources[k - newStartIndex] = i;
            patched++;
            /*
          简单Diff 算法时曾提到，如果在遍历过程中遇到的索引值呈现递增趋势，
          则说明不需要移动节点，反之则需要
          */
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            unmount(oldVNode);
          }
          // for (let k = newStartIndex; k < newVNodeEndIndex; k++) {
          //   const newVNode = newVNodeChildren[k];

          //   if(newVNode.key === oldVNode.key) { // 找到相同的可复用的节点
          //     patch(oldVNode, newVNode, container);
          //     sources[k - newStartIndex] = i; // 填充source数据，具体值是新⼦节点在旧的⼀组⼦节点中的位置索引
          //   }
          // }
        } else {
          // 更新过的节点数量大于需要更新的节点数量，则执⾏卸载
          unmount(oldVNode);
        }
      }

      // 根据source计算出其最长递增子序列，以便于进行DOM移动操作

      // 进行移动操作
      if (moved) {
        const seq = getSequence(sources);
        let s = seq.length - 1; // s指向最长递增子序列的最后一个元素
        let i = count - 1; // i指向新子节点的最后一个元素

        for (i; i >= 0; i--) {
          if (sources[i] === -1) {
            // 新节点，进行挂载
            const pos = newStartIndex + i;
            const newVNode = newVNodeChildren[pos];
            const nextPos = pos + 1; // 当前节点的下一个节点索引为值
            const anchor = nextPos < newVNodeChildren.length ? newVNodeChildren[nextPos].el : null;
            patch(null, newVNode, container, anchor);
          } else if (i !== seq[s]) {
            // 移动元素
            const pos = newStartIndex + i;
            const newVNode = newVNodeChildren[pos];
            const nextPos = pos + 1; // 当前节点的下一个节点索引为值
            const anchor = nextPos < newVNodeChildren.length ? newVNodeChildren[nextPos].el : null;
            insert(newVNode.el, container, anchor);
          } else {
            // i === seq[s] 最长递增子序列中对应的DOM元素不需要进行移动
            s--;
          }
        }
      }
    }
  }

  /**
   * 获取数组的最长递增子序列
   * @param arr 数组
   * @returns Array 最长递增子序列在arr中的序号数组
   * */
  function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = ((u + v) / 2) | 0;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }

  /**
   * 子元素打补丁（差异更新）
   * @param n1 旧vnode
   * @param n2 新vnode
   * @param container 容器
   * */
  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      // 1. 新子节点为文本节点时

      // 当旧子节点为一组子节点时，需逐个卸载
      if (Array.isArray(n1.children)) {
        n1.children.forEach(child => {
          unmount(child);
        });
      }

      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      // 2. 新子节点为一组子节点时，使用diff算法进行运算
      if (Array.isArray(n1.children)) {
        simpleDiff(n1, n2, container);
      } else {
        // 将容器内容情况，逐个挂载新子节点
        setElementText(container, '');
        n2.children.forEach(child => {
          patch(null, child, container);
        });
      }
    } else {
      // 3. 新子节点不存在

      if (Array.isArray(n1.children)) {
        // 旧子节点为一组子节点，逐个卸载
        n1.children.forEach(child => unmount(child));
      } else if (typeof n1.children === 'string') {
        // 旧子节点为文本节点，清空容器内容
        setElementText(container, '');
      }
    }
  }

  return {
    render,
  };
}

/*
createRenderer传入配置项目的：把对dom元素的操作设置为与平台无关（即可依据平台进行配置传参）
*/
const renderer = createRenderer({
  /**创建元素*/ 
  createElement(tag) {
    return document.createElement(tag);
  },
  /**设置元素文本*/ 
  setElementText(el, text) {
    el.textContent = text;
  },
  appendChild(container, el) {
    container && container.appendChild(el);
  },
  removeChild(parent, child) {
    parent && parent.removeChild(child);
  },
  /**
   * 
   * @param {*} container 容器
   * @param {*} el 被插入元素
   * @param {*} anchor 被插入位置 
   */ 
  insert(container, el, anchor=null) {
    container.insertBefore(el, anchor);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  createComment(comment) {
    return document.createComment(comment);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  // 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
  patchProps(el, key, prevValue, nextValue) {
    if(/^on/.test(key)){
      const name = key.slice(2).toLowerCase();
      let invokers = el._vei || (el._vei = {}); // el._vei为对象，防止多事件覆盖问题
      let invoker = invokers[key]; // 获取伪造的事件处理函数，vei -- vue event invoker
      if(nextValue) {
        if(!invoker) {
          // 构建新的invoker
          invoker = el._vei[key] = (e) => { 
            if(e.timeStamp < invoker.attached) return; // 如果事件触发时间小于事件绑定时间，则不执行事件处理函数
            // 触发真正的事件处理函数
            if(Array.isArray(invoker.value)) {
              // 元素可以绑定多个同类型事件
              invoker.value.forEach(invokerEvent => {
                invokerEvent(e);
              })
            } else {
              invoker.value(e);
            }
          }
          invoker.value = nextValue; // 将真正的事件处理函数赋值给invoker.value
          invoker.attached = performance.now(); // 存储事件处理函数被绑定的时间
          el.addEventListener(name, invoker); // 绑定事件
        } else {
          // 更新invoker
          invoker.value = nextValue;
        }
      } else if(invoker) {
        // 新的事件绑定函数不存在，解绑之前绑定的invoker
        el.removeEventListener(name, invoker);
      }
    } else if(key === 'class') {
      // 对class属性进行特殊处理
      el.className = nextValue; // 使用el.className设置属性的性能最优
    } else if (shouldSetAsDomProps(el, key, nextValue)) {
      // 判断key是否属于可设置的DOM元素属性
      const type = typeof el[key]; // DOM属性类型
      
      if(type === 'boolean' && nextValue === '') {
        // 属性为布尔类型且值为空，将值矫正为true
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      // 如果要设置的属性值没有对应的DOM属性，则直接使用setAttribute进行设置
      el.setAttribute(key, nextValue);
    }
  }
});

const vnode = {
  type: 'h1',
  children: 'test vnode',
  props: {
    id: 'header',
    onClick: function(e) {
      alert('click');
    }
  },
  class: normalizeClass([
    'test-class hello',
    { test2: true }
  ]),
}

const textVnode = {
  type: Text,
  children: 'texxxxt',
}

const commentVnode = {
  type: Comment,
  children: 'comment'
}

const fragmentVnode = {
  type: 'ul',
  children: [
    {
      type: Fragment,
      children: [
        { type: 'li', children: 'list1' },
        { type: 'li', children: 'list2' },
        { type: 'li', children: 'list3' },
        { type: 'li', children: 'list4' }
      ]
    }
  ]
}


// effect(() => {
//   renderer.render(vnode, document.querySelector('#app'));
// });

const oldNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: 'hello', key: 3 },
  ]
};

const newNode = {
  type: 'div',
  children: [
    { type: 'p', children: 'world', key: 3 },
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
  ]
}

renderer.render(oldNode, document.querySelector('#magic-diff'));

setTimeout(() => {
  renderer.render(newNode, document.querySelector('#magic-diff'));
}, 3000)

const MyComponent = {
  name: 'MyComponent',
  // data函数定义组件自身的状态
  data: function() {
    return {
      text: 'test text'
    }
  },
  setup(props, setupContext) {
    // 1. 返回一个函数，作为组件的渲染函数
    // return () => {
    //   return {
    //     type: 'div',
    //     children: `我是setup文本内容`
    //   }
    // }

    // 2. 返回一个对象，对象中的数据将暴露给模板使用
    const count = ref(0);

    // 注册生命周期函数
    onMounted(() => {
      console.log('mounted 1')
    })
    // 可以注册多个
    onMounted(() => {
      console.log('mounted 2')
    })
    return {
      count,
    }
  },
  // 组件的渲染函数，其返回值必须为虚拟DOM对象
  render() {
    return {
      type: 'div',
      children: `我是文本内容${this.text}，count: ${this.count}`
    }
  }
}

