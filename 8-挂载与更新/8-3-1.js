/**
 * @titlte 设置元素属性
 */

const vnode = {
  type: 'button',
  props: {
    disabled: '',
  },
}

// 有些 DOM Properties 是只读的, 所以只能通过 setAttribute 函数来设置
function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === 'form' && el.tagName === 'INPUT') return false
  // 用 in 操作符判断 key 是否存在对应的 DOM Properties
  return key in el
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  // ... 省略 children 处理

  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      // 使用 shouldSetAsProps 函数判断是否应该作为 DOM Properties 设置
      if (shouldSetAsProps(el, key, value)) {
        // 获取 DOM Properties 的类型
        const type = typeof el[key]
        if (typeof type === 'object' && value === '') {
          el[key] = true
          // 如果是布尔类型 且 值是空串，就矫正为 true
        } else {
          el[key] = value
        }
      } else {
        // 如果要设置的属性没有对应的 DOM Properties, 则使用 setAttribute 函数设置属性
        el.setAttribute(key, vnode.props[key])
      }
    }
  }
  insert(el, container)
}

function insert(el, container) {
  /* ... */
}
