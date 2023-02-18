/**
 * @title 添加新元素
 * 在新的一组子节点中，如果有多出来的新节点，需要在更新时将它正确的挂载，主要分为两步：
 * 1. 找到新增节点
 * 2. 将新增节点挂载到正确位置
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

      // 在第一层循环中定义变量 find，代表是否在旧的一组子节点中找到可复用的节点
      let find = false
      for (j; j < oldChildren; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          // 找到可复用的节点，find 置为 true
          find = true
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
      // 到这里 find 还是 false， 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点，即当前 newVNode 是新增节点，需要挂载
      if (!find) {
        // 要挂载到正确的位置，需要先获取锚点元素
        // 获取当前 newVNode 的前一个 vnode 节点
        const prevVNode = newChildren[i - 1]
        let anchor = null
        if (prevVNode) {
          // 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
          anchor = prevVNode.el.nextSibling
        } else {
          // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点
          // 此时使用容器元素的 firstChild 作为锚点
          anchor = container.firstChild
        }
        patch(null, newVNode, container, anchor)
      }
    }
  } else {
    // ...
  }
}

// 修改 patch 函数接收第四个参数，即锚点元素
function patch(n1, n2, container, anchor) {
  // ...
  if (typeof type === 'string') {
    if (!n1) {
      // 挂载时将锚点元素作为第三个参数传递给 mountElement
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  } else if (type === Text) {
    // ...
  } else if (type === Fragment) {
    // ...
  }
}

// 修改 mountElement 函数接收第三个参数 锚点元素
function mountElement(vnode, container, anchor) {
  // ...
  
  // 插入节点时，将锚点元素传递给 insert 函数
  insert(el, container, anchor)
}
