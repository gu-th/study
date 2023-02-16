/**
 * @title class 处理
 * class 对应的 DOM Properties 是 className, 设置 class 的方式有以下三种
 * el.className setAttribute el.classList 其中 className 性能最好
 * 
 * 因为 Vue.js 对 class 属性进行了增强, 因此在设置 class 前要将值先转化为字符串
 * class: 'foo bar'
 * class: { foo: true, bar: false }
 * class: [ 'foo bar', { baz: true } ]
 * 使用 normalizeClass 函数将不同类型的 class 值正常化
 *
 */

const vnode = {
  type: 'p',
  props: {
    class: normalizeClass(['foo bar', { baz: true }])
  }
}
function normalizeClass(value) {
  let res = ''
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        res += `${item} `
      } else {
        for (const key in item) {
          const itemVal = item[key]
          if (itemVal) res += `${key} `
        }
      }
    }
  } else if (typeof value === 'object') {
    for (const key in value) {
      const itemVal = value[key]
      if (itemVal) res += `${key} `
    }
  } else {
    res = value
  }
  return res
}

const renderer = createRenderer({
  // ... 省略其他实现
  patchProps(el, key, nextValue) {
    // 对 class 特殊处理
    if (key === 'class') {
      el.className === nextValue || ''
    }
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
