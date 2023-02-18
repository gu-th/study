/**
 * @title DOM 复用与 key 的作用
 */

const oldvnode = {
  type: 'div',
  children: [{ type: 'p', children: '1' }, { type: 'p', children: '2' }, { type: 'p', children: '3' }],
}
const newvnode = {
  type: 'div',
  children: [{ type: 'p', children: '3' }, { type: 'p', children: '1' }, { type: 'p', children: '2' }]
}
/**
 * 按 9-1 代码更新以上节点时，遍历对比节点，发现每个位置的节点类型都不一样，就会执行三次卸载，三次挂载的操作
 * 实际上，两组子节点只是顺序不同，因此最优方案是通过DOM的移动来完成子节点的更新
 * 通过 DOM 的移动来完成更新，必须要保证一个前提：新旧两组子节点中的确存在可复用的节点
 */

const oldvnode2 = {
  type: 'div',
  children: [{ type: 'p', children: '1' }, { type: 'p', children: '2' }, { type: 'p', children: '3' }],
}
const newvnode2 = {
  type: 'div',
  children: [{ type: 'p', children: '3' }, { type: 'p', children: '1' }, { type: 'p', children: '2' }]
}
/**
 * 观察上面两组子节点，发现所有节点的 vnode.type 属性值都相同，导致无法确定新旧两组子节点中节点的对应关系，也就无法得知应该进行怎样的 DOM 移动才能完成更新
 * 因此需要引入额外的 key 来作为 vnode 标识
 * 只要两个虚拟节点的 type 属性值和 key 属性值都相同，就认为它们是相同的，即可以进行 DOM 复用
 */

const oldVNode = { type: 'p', key: 1, children: 'text 1' }
const newVNode = { type: 'p', key: 1, children: 'text 2' }

/**
 * 这两个虚拟节点拥有相同的 key 值和 vnode.type 属性值。所以在更新时可以复用 DOM 元素，即只需要通过移动操作来完成更新。
 * 但仍需要对这两个虚拟节点进行打补丁操作，因为新的虚拟节点（newVNode）的文本子节点的内容已经改变了
 * 因此，在讨论如何移动 DOM 之前，我们需要先完成打补丁操作，代码如下：
 */


function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children

    for (let  i = 0;  i < newChildren.length;  i++) {
      const newVNode = newChildren[i]
      for (let j = 0; j < oldChildren; j++) {
        const oldVNode = oldChildren[j]
        // 如果找到具有相同 key 的两个节点，说明可以复用，但仍需要调用 patch 函数更新内容
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container)
          break
        }
      }
    }
  } else {
    // ...
  }
}