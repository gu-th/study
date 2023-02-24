/**
 * @title 渲染组件
 */
// 组件
const myComponent = {
  // 组件名称 可选
  name: 'myComponent',
  // 组件的渲染函数，返回值必须是虚拟 DOM
  render() {
    return {
      type: 'div',
      children: '文本内容'
    }
  },
  data() {
    return { foo: 1 }
  }
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
  const { render } = componentOptions
  // 执行渲染函数，获取组件的渲染内容，即 render 函数返回的 虚拟 DOM
  const subTree = render()
  // 调用 patch 函数挂载组件描述的内容，即 subTree
  patch(null, subTree, container, anchor)
}