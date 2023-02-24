/**
 * @title 组件状态与自更新
 */

// 组件
const myComponent = {
  // 组件名称 可选
  name: 'myComponent',
  data() {
    return { foo: 'I hope the world is full of love and peace !!!' }
  },
  // 组件的渲染函数，返回值必须是虚拟 DOM
  render() {
    return {
      type: 'div',
      // 在渲染函数内使用组件状态
      children: `I say: ${this.foo}`
    }
  },
}
// 用 vnode 描述组件
const CompVNode = {
  type: myComponent,
  // ...
}

function patch(n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  const { type } = n2
  if (typeof type === 'string') {
    // ...
  } else if (type === Text) {
    // ...
  } else if (type === Fragment) {
    // ...
  } else if (typeof type === 'object') {
    // vnode.type 是对象时，说明描述的是组件
    if (!n1) {
      // 挂载组件
      mountComponent(n2, container, anchor)
    } else {
      // 更新组件
      patchComponent(n1, n2, container)
    }
  }
}

function mountComponent(vnode, container, anchor) {
  // 通过 vnode 获取组件的选项对象
  const componentOptions = vnode.type
  // 获取组件渲染函数
  const { render, data } = componentOptions
  // 调用 data 函数得到原始数据， 并调用 reactive 函数包装成响应式数据
  const state = reactive(data())
  // 响应式数据变化时，需要能够触发更新
  effect(() => {
    // 执行渲染函数，获取组件的渲染内容，即 render 函数返回的 虚拟 DOM
    // 调用 render 函数时，将其 this 设置为 state，从而 render 函数内部可以通过 this 访问组件自身状态数据
    const subTree = render.call(state, state)
    // 调用 patch 函数挂载组件描述的内容，即 subTree 
    // ! 每次更新都会进行全新的挂载，而不是打补丁，正确实现应该是每次更新时用新的 subtree 与上一次渲染的 subTree 打补丁
    patch(null, subTree, container, anchor)
  }, {
    // 调度器，当响应式数据变化时，副作用函数不是立即执行，而会被调度器调度，最后在一个微任务队列中执行
    scheduler: queueJob
  })
}

// 创建任务队列
const queue = new Set()
// 用Promise.resolve()创建一个Promise实例, 用它将任务添加到微任务队列
const p = Promise.resolve()
// 标志代表是否正在刷新队列
let isFlushing = false

function queueJob(job) {
  // 将 job 添加到队列中
  queue.add(job)
  // 如果没开始刷新队列，就刷新
  if (!isFlushing) {
    // 置为 true 避免重复刷新
    isFlushing= true
    // 在微任务中刷新缓冲队列
    p.then(() => {
      try {
        // 执行队列中的任务
        queue.forEach(job => job())
      } finally {
        // 重置状态
        isFlushing = false
        queue.length = 0
      }
    })
  }
}
