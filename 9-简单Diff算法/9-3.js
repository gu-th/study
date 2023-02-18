/**
 * @title 找到需要移动的元素
 * 9-2 通过 key 找到了可以复用的元素， 9-3 要找到需要移动的元素，即新旧两组节点中 key 相同但索引位置不同的节点
 */


function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children

    // 存储寻找过程中遇到的最大索引值
    let lastIndex = 0

    for (let  i = 0;  i < newChildren.length;  i++) {
      const newVNode = newChildren[i]
      for (let j = 0; j < oldChildren; j++) {
        const oldVNode = oldChildren[j]
        // 如果找到具有相同 key 的两个节点，说明可以复用，但仍需要调用 patch 函数更新内容
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 当前找到的节点在旧 children 中的索引小于最大索引 lastIndex
            // 说明当前 oldVNode 对应的真实 DOM 需要移动
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