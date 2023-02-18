/**
 * @title 移除不存在的元素
 * 更新子节点时，除了新增元素，还会有被删除的情况
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
      // ... 更新即新增操作
    }
    // 更新完成后，遍历旧的一组子节点
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i]
      // 用旧的子节点 oldVNode 去新的一组子节点中寻找具有相同 key 的节点
      const has = newChildren.find((vnode) => vnode.key === oldVNode.key)
      if (!has) {
        // 如果没有找到具有相同 key 的节点，则需要删除该节点
        // 调用 unmount 函数卸载
        unmount(oldVNode)
      }
    }
  } else {
    // ...
  }
}
