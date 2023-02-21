/**
 * @title 双端原理
 * 同时对新旧两组子节点的两个端点进行比较
 * 1. 两个首节点比较
 * 2. 两个尾节点比较
 * 3. 新尾旧头比较
 * 4. 旧头新尾比较
 * 四步比较, 相同的节点, 就是对应真是 dom 可以复用的节点, 先移动节点, 然后更新索引, 再进行下一轮比较
 */

function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    // 封装 patchKeyedChildren 函数处理两组子节点
    patchKeyedChildren(n1, n2, container)
  } else {
    // ...
  }
}

function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children
  // 四个索引值
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  // 四个索引值指向的 vnode 节点
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = oldChildren[newStartIdx]
  let newEndVNode = oldChildren[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // 新旧节点都在头部， 所以不需要移动，只打补丁更新索引即可
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    } else if (oldEndVNode.key === newEndVNode.key) {
      patch(oldEndVNode, newEndVNode, container)
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = oldChildren[--newEndIdx]
    } else if (oldStartVNode.key === newEndVNode.key) {
      patch(oldStartVNode, newEndVNode, container)
      // 将旧头部对应的 dom 移动到 旧的尾部 dom 后边
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 打补丁
      patch(oldEndVNode, newStartVNode, container)
      // oldEndVNode.el 移动到 oldStartVNode.el 前面
      insert(oldEndVNode.el, container, oldStartVNode.el)
      // 移动完, 更新索引 指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx]
      oldStartVNode = oldChildren[++newStartIdx]
    }
  }

}
