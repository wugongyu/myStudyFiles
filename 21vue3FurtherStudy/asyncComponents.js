/**
 * 
 * 定义异步组件，本质为一个高阶组件，返回的是一个包装组件
 * @param {Object} options options 可以是配置项，也可以是加载器
 * @param {*} options.loader 异步组件加载器
 * @param {*} options.timeout 超时时长
 * @param {*} options.errorComponent 指定出错时要渲染的组件
 * @param {*} options.delay 展示loading组件的延迟时间，单位ms
 * @param {*} options.loadingComponent 指定延时展示的加载组件
 * @param {Function} options.onError 异常回调函数
 * @returns 
 */ 
function defineAsyncComponent(options) {
  if(typeof options === 'function') {
    options = {
      loader: options, // options若为加载器，将其格式化为配置项对象
    }
  }
  const { loader } = options;
  let InnerComp = null; // 存储异步加载的组件

  /*
    封装load函数用来加载异步组件
    将新的 Promise 实例的 resolve 和 reject 分别封装为 retry 函数和 fail 函数，并
    将它们作为 onError 回调函数的参数。这样，⽤户就可以在错误发⽣时主动选择重试或直接抛出错误。
  */
  let retires = 0; // 记录重试次数
  function load() {
    return loader().catch((err) => {
      // 捕获加载器的错误
      if(options.onError) {
        // 如果用户指定了错误回调函数，将控制权交给用户
        return new Promise((resolve, reject) => {

          // 重试
          const retry = () => {
            resolve(load());
            retires++;
          }

          // 失败
          const fail = () => {
            reject(err);
          }

          options.onError(retry, fail, retires)
        })
      } else {
        throw err
      }
    })
  }

  // 返回一个包装组件
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      let loaded = ref(false); // 加载完成标志
      let error = shallowRef(null); // 定义 error，当错误发⽣时，⽤来存储错误对象
      let loading = ref(false); // 是否正在加载中的标志

      let loadingTimer = null;
      if(options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true;
        }, options.delay)
      } else {
        loading.value = true;
      }
      
      load().then(c => {
        InnerComp = c;
        loaded.value = true; // 加载完成
      }).catch((err) => {
        error.value = err
      }).finally(() => {
        // ⽆论组件加载成功与否，都要清除延迟定时器
        loading.value = false;
        clearTimeout(loadingTimer)
      });

      let timer = null;
      if(options.timeout) {
        // 开启定时器，设置超时标志
        timer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout} ms`)
          error.value = err;
        }, options.timeout);
      }

      onUnmounted(() => {
        clearTimeout(timer)
      }); // 包装组件被卸载时清除定时器

      // 占位内容
      const placeholder = {
        type: Text,
        children: '',
      }

      // setup返回一个渲染器函数： 异步组件加载成功，则渲染该组件，否则渲染一个占位内容
      return () => {
        if(loaded.value) {
          // 组件异步加载成功
          return {
            type: InnerComp
          }
        } else if(error.value && options.errorComponent) {
          return {
            type: options.errorComponent,
            props: {
              error: error.value,
            }
          };
        } else if(loading.value && options.loadingComponent) {
          return {
            type: options.loadingComponent
          }
        }
        return placeholder;
      }
    }
  }
}

const AsyncComp = defineAsyncComponent({
  loader: () => new Promise(), // 加载器
  delay: 200, // 展示loading组件的延迟时间，单位ms
  loadingComponent: {
    setup() {
      return () => {
        return {
          type: 'h2',
          children: 'Loading...'
        }
      }
    }
  }, // loading 组件
  timeout: 2000, // 超时时⻓，其单位为 ms
  errorComponent: {
    setup() {
      return () => {
        return {
          type: 'span',
          children: 'err'
        }
      }
    }
  }, // 指定出错时要渲染的组件
})