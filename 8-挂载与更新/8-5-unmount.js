/**
 * @title 卸载
 * 卸载操作发生在更新阶段, 更新是指在初次挂载完成后, 后续渲染会触发更新
 * 首次挂载完成后, 后续渲染如果传递了 null 作为新 node , 即什么都不渲染, 此时 需要卸载之前渲染的内容
 * 通过 innderHTML 清空容器并不严谨, 原因如下:
 *  - 容器内容可能由某个或多个组件渲染, 卸载发生时, 应正确的调用这些组件的 beforeUnmount, unmounted 等生命周期函数
 *  - 即使内容不是由组件渲染的, 有的元素存在自定义指令, 我们应该在卸载操作发生时正确的执行对应的指令函数钩子
 *  - 使用 innerHTML 清空容器元素内容另一个缺陷是, 不会移除绑定在 DOM 元素上的事件处理函数
 * 正确的卸载方式是: 根据 vnode 对象获取与其相关联的真是元素, 然后使用原生 DOM 操作方法将该 DOM 元素移除
 * 因此需要在 vnode 与真是 DOM 元素之间建立联系
 *
 */

function mountElement(vnode, container) {
  // 让 vnode.el 引用真实的 dom 元素
  const el = (vnode.el = createElement(vnode.type))
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }
  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key])
    }
  }
  insert(el, container)
}

function render(vnode, container) {
  if (vnode) {
    patch(container._vnode, vnode, container)
  } else {
    if (container._vnode) {
      // 根据 vnode 获取要卸载的真实 dom 元素
      const el = container._vnode.el
      // 调用 unmount 函数卸载 vnode
      unmount(container._vnode)
    }
  }
  container._vnode = vnode
}

/**
 * 卸载是比较常见的基本操作, 封装到 unmount 函数中
 * 在 unmount 函数内, 有机会调用绑定在 dom 元素上的指令钩子函数, 如 beforeUnmount unmounted 等
 * 当 unmount 函数执行时, 有机会检测虚拟节点 vnode 的类型. 如果该虚拟节点描述的是组件, 则可以调用组件相关的生命周期函数
 */
function unmount(vnode) {
  // 获取 el 的父元素
  const parent = el.parentNode
  // 调用 removeChild 移除元素
  if (parent) parent.removeChild(el)
}
