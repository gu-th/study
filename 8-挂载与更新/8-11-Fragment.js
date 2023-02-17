/**
 * @title Fragment
 * Fragment 是 Vue.js 3 中新增的一个 vnode 类型
 * Vue.js 3 使用 Fragment 描述多根节点模板, 它的 children 存储的内容就是模板中所有根节点
 */

const Fragment = Symbol()
const vnode = {
  type: Fragment,
  children: [
    { type: 'li', children: '1' },
    { type: 'li', children: '2' },
    { type: 'li', children: '3' },
  ],
}

// 当渲染器渲染 Fragment 时, 由于 Fragment 本身并不渲染任何内容, 所以渲染器只会渲染 Fragment 的子节点
function patch(n1, n2, container) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  const { type } = n2
  if (typeof type === 'string') {
    // ...
  } else if (type === Text) {
    // ...
  } else if (typeof type === 'Fragment') {
    if (!n1) {
      // 如果旧 vnode 不存在, 则只需要将 Fragment 的 children 逐个挂载即可
      n2.children.forEach((c) => patch(null, c, container))
    } else {
      // 如果旧 vnode 存在, 则只需要更新 Fragment 的 children
      patchChildren(n1, n2, container)
    }
  }
}

function unmount(vnode) {
  // 在卸载时, 如果 vnode 类型为 Fragment 则需要卸载其 children
  if (vnode.type === Fragment) {
    vnode.children.forEach((c) => unmount(c))
    return
  }
  const parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}
