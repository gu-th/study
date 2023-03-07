/**
 * @title 注册声明周期
 * setup 函数中调用 onMounted 函数即可注册 mounted 声明周期钩子函数，
 * 需要维护一个 currentInstance 变量存储当前的组件实例，每当初始化组件并执行组件的 setup 函数之前
 * 现将组件 currentInstance 设为当前组件实例，在执行 setup 函数
 * 这样就可以通过 currentInstance 获取当前正在被初始化的实例，从而将那些通过 onMounted（生命周期）函数注册的钩子函数与组件实例进行关联
 *
 */

// 全局变量，存储当前正在被实例化的组件实例
let currentInstance = null
// 该方法接收组件实例作为参数，并将该实例设置为 currentInstance
function setCurrentInstance(instance) {
  currentInstance = instance
}

function mountComponent(vnode, container, anchor) {
  // ...
  const instance = {
    state,
    props: shadowReactive(props),
    isMounted: false,
    subTree: null,
    slots,
    // 组件实例中添加 mounted 数组，存储通过 onMounted 函数注册的生命周期钩子函数
    mounted: [],
  }
  // ...

  const setupContext = { attrs, emit, slots }
  // 调用 setup 函数前，设置当前组件实例
  setCurrentInstance(instance)
  // 执行 setup 函数
  const setupResult = setup(shadowReadonly(instance, props), setupContext)
  // setup 函数执行完毕后，重置当前组件实例
  setCurrentInstance(null)

  // ...

  effect(() => {
    const subTree = render.call(renderContext, renderContext)
    if (!instance.isMounted) {
      // ...

      // 遍历 instance.mounted 数组并执行即可
      instance.mounted && instance.mounted.forEach((hook) => hook.call(renderContext))
    } else {
      // ...
    }
    instance.subTree = subTree
  },{
    scheduler: queueJob
  })
}

function onMounted(fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn)
  } else {
    console.error('onMounted 函数只能在 setup 中调用')
  }
}
