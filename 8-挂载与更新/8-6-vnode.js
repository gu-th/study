/**
 * @title vnode 类型
 * 在后续调用 render 函数渲染空内容 (null) 时, 会执行卸载操作
 * 如果传递了新 vnode 会把新旧 vnode 传给 patch 函数进行打补丁, 但在打补丁之前 要保证新旧 vnode 类型一致
 * 因为不同类型的元素都有特定的属性, 比如 <p></p> 和 <input type="submit"></input> type 属性是 input 特有的, p元素没有
 * 所以在这种情况下, 需要先卸载旧的元素, 再渲染新的 元素
 *
 */

function patch(n1, n2, container) {
  if (n1 && n1.type !== n2.type) {
    // 如果新旧 vnode 类型不同, 则直接卸载旧 vnode
    unmount(n1)
    n1 = null
  }
  // 即使新旧 vnode 描述的内容相同, 但还需要进一步确实类型是否相同, 因为 vnode 可以描述普通标签, 还可以描述组件, Fragment 等
  // 对不同类型的 vnode 需要提供不同的挂载或打补丁的处理方式
  const { type } = n2
  // 如果 n2.type 是字符串类型, 则描述的是普通标签元素
  if (typeof type === 'string') {
    if (!n1) {
      mountElement(n2, container)
    } else {
      patchElement(n1, n2)
    }
  } else if (typeof type === 'object') {
    // 如果 n2.type 是对象类型, 则描述的是组件
  } else if (typeof type === 'xxx') {
    // ... 处理其他类型 vnode
  }
}
