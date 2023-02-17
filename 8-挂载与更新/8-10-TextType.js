/**
 * @title 文本节点 和 注释节点
 * 前述内容只包括了描述普通标签的 vnode
 * 如果用 vnode 描述 注释节点和文本节点, 需要人为创造一些标识, 因为文本节点和注释节点不同于普通标签节点, 它们没有标签
 *
 * 如下为文本节点示例, 注释节点与之类似, 使用 document.createComment() 函数创建注释节点元素即可
 */

// 创建一个描述文本节点的 type 标识
const Text = Symbol()
const vnode1 = {
  type: Text,
  children: '我是文本内容',
}
// 创建一个描述注释节点的 type 标识
const Comment = Symbol()
const vnode2 = {
  type: Comment,
  children: '我是注释内容',
}

function patch(n1, n2, container) {
  if (n1 && n1.type !== n2.type) {
    // 如果新旧 vnode 类型不同, 则直接卸载旧 vnode
    unmount(n1)
    n1 = null
  }
  // 即使新旧 vnode 描述的内容相同, 但还需要进一步确实类型是否相同, 因为 vnode 可以描述普通标签, 还可以描述组件, Fragment 等
  // 对不同类型的 vnode 需要提供不同的挂载或打补丁的处理方式
  const { type } = n2
  // 如果 n2.type 是字符串类型, 则描述的是普通标签元素
  if (typeof type === 'string') {
    if (!n1) {
      mountElement(n2, container)
    } else {
      patchElement(n1, n2)
    }
  } else if (type === Text) {
    // start  如果新 vnode 类型是 Text , 说明描述的是文本节点
    // 没有旧节点, 则进行挂载
    if (!n1) {
      // 创建文本节点
      // const el = document.createTextNode(n2.children)
      const el = createText(n2.children)
      // 将文本节点插入容器中
      insert(el, container)
    } else {
      // 旧 vnode 存在, 只需用新文本节点的文本内容替换旧文本节点即可
      const el = (n2.el = n1.el)
      if (n2.children !== n1.children) {
        // el.nodeValue = n2.children
        setText(el, n2.children)
      }
    }
    // end
  } else if (typeof type === 'object') {
    // 如果 n2.type 是对象类型, 则描述的是组件
  } else if (typeof type === 'xxx') {
    // ... 处理其他类型 vnode
  }
}

const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  createText(text) {
    return document.createTextNode(text)
  },
  setText(el, text) {
    el.nodeValue = text
  },
  patchProps(el, key, nextValue) {
    // ...
  },
})