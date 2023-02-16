/**
 * @title 设置属性值
 * 要把属性的设置也变成与平台无关，因此需要把属性设置相关操作也提取到渲染器选项中
 */

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
  patchProps(el, key, nextValue) {
    if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (typeof type === 'object' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  },
})

function mountElement(vnode, container) {
  const el = createElement(vnode, type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el)
    })
  }

  if (vnode.props) {
    for (const key in vnode.props) {
      // 调用 patchProps 即可
      patchProps(el, key, null, vnode.props[key])
    }
  }
  insert(el, container)
}
