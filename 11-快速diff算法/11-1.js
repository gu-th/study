/**
 * @title 相同前置元素与后置元素
 */

function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children
  const oldChildren = n1.children

  // 更新相同的前置节点 索引 j 指向新旧两组节点的开头
  let j = 0
  let oldVNode = oldChildren[j]
  let newVNode = newChildren[j]
  // 循环向后遍历，直至遇到
  while (oldVNode.key === newVNode.key) {
    // 调用 patch 函数进行更新
    patch(oldVNode, newVNode, container)
    // 更新索引
    j++
    oldVNode = oldChildren[j]
    newVNode = newChildren[j]
  }

  // 更新相同的后置节点
  // 旧节点最后一个索引 
  let oldEnd = oldChildren.length - 1
  // 新节点最后一个索引
  let newEnd = newChildren.length - 1
  
  oldVNode = oldChildren[oldEnd]
  newVNode = newChildren[newEnd]

  while (oldVNode.key === newVNode.key) {
    patch(oldVNode, newVNode)
    oldEnd--
    newEnd--
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]
  }

  // 预处理完毕，满足以下条件 说明 j ~ newEnd 之间的节点是新增的
  if (j > oldEnd && j <= newEnd) {
    // 锚点的索引 
    const anchorIndex = newEnd + 1
    // 锚点元素
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
    // 循环调用 patch 逐个新增
    while (j <= anchorIndex) {
      patch(null, newChildren[j++], container, anchor)
    }
  } else if (j > newEnd && j <= oldEnd) {
    //  j~ oldEnd 是需要删除的节点
    while(j <= oldEnd) {
      unmount(oldChildren[j++])
    }
  }

}