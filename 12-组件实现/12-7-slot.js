/**
 * @title 插槽
 * 渲染插槽的过程，就是调用插槽函数并渲染其返回内容的过程
 */

function mountComponent(vnode, container, anchor) {
  // ...

  // 直接使用编译好的 vnode.children 对象作为 slot 对象即可
  const slots = vnode.children || {}

  const instance = {
    state,
    props: shadowReactive(props),
    isMounted: false,
    subTree: null,
    // 将插槽添加到组件实例上
    slots,
  }

  // 将 slot 对象添加到 setupContext 中
  const setupContext = { attr, emit, slots }
  
  // ...

  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props, slots } = t
      if (k === '$slots') {
        return slots
      }
      // ...
    },
    set(t, k, v, r) {
      // ...
    },
  })
  // ...
}
