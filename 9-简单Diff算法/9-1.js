/**
 * @title 减少 DOM 操作的性能开销
 */

const oldvnode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' },
  ],
}
const newvnode = {
  type: 'div',
  children: [
    { type: 'p', children: '4' },
    { type: 'p', children: '5' },
    { type: 'p', children: '6' },
    { type: 'p', children: '7' },
  ],
}
/**
 * 更新以上节点时, 卸载三次旧节点, 挂载三次新节点, 需要执行 6 次的 DOM 操作
 * 观察发现 更新前后改变的只有 p 标签的文本节点内容, 所以直接更新 p 标签的内容, 这样只需要三次 DOM 操作即可
 * 同时 新旧节点数量可能不一致, 所以遍历节点不应该总是遍历旧的一组子节点或是新的一组子节点, 而应该遍历较短的一组
 * 这样能够尽可能多地调用 patch 函数进行更新. 然后再对比新旧两组子节点长度, 新的一组更长说明有新的需要挂载, 否则说明旧的一组需要卸载
 * 实现如下:
 */ 
function patchChildren(n1, n2, container) {
  if (typeof n1.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children
    const newChildren = n2.children
    // 新旧一组子节点的长度
    const oldLen = oldChildren.length
    const newLen = newChildren.length
    // 找较短的一组子节点长度, 作为公共长度
    const commonLen = Math.min(oldLen, newLen)
    // 遍历
    for (let  i = 0;  i < commonLen;  i++) {
      patch(oldChildren[i], newChildren[i])
    }
    // newLen > oldLen 有新节点需要挂载
    if (newLen > oldLen) {
      for (let  i = commonLen;  i < newLen;  i++) {
        patch(null, newChildren[i])
      }
    } else if (oldLen > newLen) {
      // oldLen > newLen 有旧节点需要卸载
      for (let  i = commonLen;  i < oldLen;  i++) {
        unmount(oldChildren[i])
      }
    }
  } else {
    // ...
  }
}

