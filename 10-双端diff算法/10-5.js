/**
 * @title 移除不存在的元素
 */

/**
 * @title 添加元素
 */

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
    // 增加两个分支判断，如果头尾是 undefined 说明该节点被处理过了，就跳到下一位置
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx]
    } else if (oldStartVNode.key === newStartVNode.key) {
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
    } else {
      // 四轮比较都未命中
      // 遍历旧节点，寻找与 newStartVNode 相同 key 的元素
      const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key)
      // idxInOld 大于 0 即找到了可复用的节点
      if (idxInOld >= 0) {
        // 对应位置的 vnode 就是需要移动的节点
        const vnodeToMove = oldChildren[idxInOld]
        // 打补丁
        patch(vnodeToMove, newStartVNode, container)
        // 移动节点
        insert(vnodeToMove.el, container, oldStartVNode.el)
        // 因为 idxInOld 位置的节点对应的 dom 已经移动，所以将这里设置为 undefined
        oldChildren[idxInOld] = undefined
        // 更新 newStartIdx
        newStartVNode = newChildren[++newStartIdx]
      } else {
        // 在旧的一组子节点中没有找到可复用的子节点，说明该节点是个新增节点
        // 将 newStartVNode 作为新节点挂载到头部，
        patch(null, newStartVNode, container, oldStartVNode.el)
      }
      newStartVNode = newChildren[++newStartIdx]
    
    }
  }

  // 检查索引值，满足条件，说明有新的节点遗留 需要进行挂载
  if (oldEndIdx < oldStartIdx && newEndIdx <= newStartIdx) {
    for (let  i = newStartIdx;  i <= newEndIdx;  i++) {
      patch(null, newChildren[i], container, oldStartVNode.el)
    }
  } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    // 移除操作
    for (let  i = oldStartIdx;  i <= oldEndIdx;  i++) {
      unmount(oldChildren[i])
    }
  }

}
