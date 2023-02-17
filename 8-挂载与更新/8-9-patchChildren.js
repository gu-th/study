/**
 * @title 更新子节点 patchChildren
 * 在之前的内容中可知，挂载子节点时，要先区分类型
 * 若 vnode.children 是字符串，说明元素具有文本子节点，若 vnode.children 是数组，说明元素具有多个子节点
 * 只有子节点的类型是规范化的，才有利于编写更新逻辑，所以需要区分子节点类型
 * 对一个元素来讲，子节点有以下三种情况：
 * 1. 没有子节点 此时 vnode.children 为 null
 * 2. 有文本子节点，此时 vnode.children 为字符串，代表文本内容
 * 3. 其他情况，无论单个元素子节点，还是多个子节点（可能是文本和元素的混合），都可以用数组表示
 * 由上，当渲染器执行更新时，新旧子节点都分别是三种情况之一
 * 
 */

function patchElement(n1, n2) {
  const el = n2.el = n1.el
  const oldProps = n1.props
  const newProps = n2.props
  // 第一步 更新 props
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key])
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProps(el, key, oldProps[key], null)
    }
  }
  // 第二步 更新 children
  patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, container) {
  // 1. 判断新子节点类型是否是文本节点
  if (typeof n2.children === 'string') {
    // 旧子节点的类型有三种可能： 没有子节点、文本子节点、一组子节点
    // 只有当旧子节点为一组子节点时, 才需要逐个卸载, 其他情况下什么都不需要做
    if (Array.isArray(n1.children)) {
      n1.children.forEach(c => unmount(c))
    }
    // 将新文本节点的内容设置个容器元素
    setElementText(container, n2.children)
  } else if (Array.isArray(n2.children)) {
    // 2. 如果新子节点类型是一组子节点

    // 判断旧子节点是否也是一组子节点
    if (Array.isArray(n1.children)) {
      // 此时说明新旧子节点都是一组子节点, 这里涉及到 diff 算法
      // 临时解决方案, 将旧的全部卸载, 新的全部挂载
      n1.children.forEach(c => unmount(c))
      n2.children.forEach(c => patch(null, c, container))
    } else {
      // 此时: 就子节点要么是文本子节点, 要么不存在
      // 无论哪种情况, 只需要将容器清空, 然后将新的一组子节点逐个挂载
      setElementText(container, '')
      n2.children.forEach(c => patch(null, c, container))
    }
  } else {
    // 3. 此时说明新子节点不存在
    //  旧子节点是一组子节点, 逐个卸载即可
    if (Array.isArray(n1.children)) {
      n1.children.forEach(c => unmount(c))
    } else if (typeof n1.children === 'string') {
      // 文本节点, 直接清空内容即可
      setElementText(container, '')
    }
    // 如果也没有旧子节点, 什么都不用做
  }
}
