/**
 * @title 渲染器
 * 渲染器的作用是把虚拟DOM渲染为特定平台的真是元素
 * renderer 表示渲染器
 * render 表示渲染
 */

function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      // 如果新的 vnode 存在，与旧的 vnode 一起传给 patch 函数 打补丁
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 旧的 vnode 存在，但新 vnode 不存在，说明是卸载 (unmount) 操作
        container.innerHTML = ''
      }
    }
    // 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
    container._vnode = vnode
  }

  /**
   * 
   * @param {*} n1 旧 vnode 
   * @param {*} n2 新 vnode
   * @param {*} container 容器
   * 
   * patch 不仅用来打补丁，还可以用来执行挂载，
   * 在首次渲染时，container._vnode 不存在，所以，传给 patch 的 n1 也是 undefined
   * 此时 patch 函数会忽略 n1， 直接将 n2 的内容渲染到容器中完成挂载操作
   */
  function patch(n1, n2, container) {
    // ....
  }

  return {
    render
  }
}