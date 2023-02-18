/**
 * @title 移动元素
 */

function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children

    // 存储寻找过程中遇到的最大索引值
    let lastIndex = 0

    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      let j = 0
      for (j; j < oldChildren; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 如果找到具有相同 key 的两个节点，说明可以复用，但仍需要调用 patch 函数更新内容
            // 先获取 newNode 的前一个 vNode 即 prevVNode
            const prevVNode = newChildren[i - 1]
            if (prevVNode) {
              // 因为要将 newVNode 对应的真实 DOM 移动到 prevVNode 对应的真实 DOM 后边
              // 所以要获取 prevVNode 对应的真实 DOM 的下一个兄弟节点，并将其作为锚点
              const anchor = prevVNode.el.nextSibling

              // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面，
              // 也就是 prevVNode 对应真实 DOM 的后面
              insert(newVNode.el, container, anchor)
            }
          } else {
            // 当前找到的节点在旧 children 中的索引不小于最大索引 lastIndex
            // 则更新 lastIndex
            lastIndex = j
          }
          break
        }
      }
    }
  } else {
    // ...
  }
}

function insert(el, parent, anchor = null) {
  // insertBefore 需要锚点元素 anchor
  parent.insertBefore(el, anchor)
}
