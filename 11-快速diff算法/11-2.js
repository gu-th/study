/**
 * @title 判断需要移动的 DOM
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
    while (j <= oldEnd) {
      unmount(oldChildren[j++])
    }
  } else {
    // 判断节点是否需要移动
    // 构造 source 数组, 用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引
    // 用来计算最长递增子序列，并辅助完成 DOM 移动操作

    // 两层遍历时间复杂度高
    // for (let i = oldStart; i <= oldEnd; i++) {
    //   const oldVNode = oldChildren[i]
    //   for (let k = newStart; j <= newEnd; j++) {
    //     const newVNode = newChildren[k]
    //     if (oldVNode.key === newVNode.key) {
    //       // 找到相同 key 的 调用 patch 函数更新
    //       patch(oldVNode.el, newVNode.el, container)
    //       // 填充数组
    //       source[k - newStart] = i
    //     }
    //   }
    // }

    // 新的一组子结点中剩余未处理的数量
    const count = oldEnd - j + 1
    const source = new Array(count)
    source.fill(-1)
    // 起始索引
    const oldStart = j
    const newStart = j

    // 是否需要移动节点
    let moved = false
    // 遍历旧的一组子节点时，遇到的最大索引值 k
    let pos = 0

    // 构建索引表
    const keyIndex = {}
    for (let i = newStart; i <= newEnd; i++) {
      // 记录新的一组节点的索引 key: index
      keyIndex[newChildren[i].key] = i
    }

    // 更新过的节点数量
    let patched = 0

    // 遍历旧的一组节点中剩余未处理的节点
    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i]

      // 如果更新过的节点数量 小于等于 需要更新的节点数量，则执行更新
      if (patched <= count) {
        // 找到索引
        const k = keyIndex[oldVNode.key]
        if (typeof k !== 'undefined') {
          newVNode = newChildren[k]
          patch(oldVNode, newVNode, container)
  
          // 每更新一个节点 就+1
          patched++
  
          // 填充 source 数组
          source[k - newStart] = i
          // 判断节点是否需要移动
          if (k < pos) {
            moved = true
          } else {
            pos = k
          }
  
        } else {
          // 没找到
          unmount(oldVNode)
        }
      } else {
        // 更新过的节点数量 大于 需要更新的节点数量，则卸载多余节点
        unmount(oldVNode)
      }
    }


  }
}
