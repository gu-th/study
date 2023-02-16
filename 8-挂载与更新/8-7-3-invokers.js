/**
 * @title 事件处理 el._vei
 */

const vnode = {
  type: 'p',
  props: {
    onClick: [
      () => {
        console.log('clicked 1')
      },
      () => {
        console.log('clicked 2')
      },
    ],
    onContextMenu: () => {
      console.log('contentmune')
    },
  },
  children: 'text',
}
// 当渲染器渲染该虚拟节点时, 会先绑定 click 事件, 再绑定 contentmune 事件, 后绑定的事件会覆盖先绑定的事件
// 因此需要重新设计 el._vei 的数据结构, 将其设计为一个对象, 键是事件名称, 值为对应的事件处理函数
// 另外, 一个元素不仅可以绑定多个事件, 对同一个事件, 还可以绑定多个事件处理函数, 因此也需要修改事件处理的相关代码
function patchProps(el, key, prevValue, nextValue) {
  // 匹配以 on 开头的属性
  if (/^on/.test(key)) {
    // * 定义 el._vei 为一个对象, 存储事件名称到事件处理函数的映射
    let invokers = el._evi || (el._evi = {})
    // 根据事件名称获取 invoker
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        // * 如果没有 invoker 则将一个伪造的 invoker 缓存到 el._vei 中   vei 是 vue event invoker 缩写
        invoker = el._evi[key] = (e) => {
          // 如果是数组 遍历并逐个调用事件处理函数
          if (Array.isArray(invoke.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            // 否则直接作为函数调用
            invoker.value(e)
          }
        }
        // 将真正的事件处理函数赋值给 invoker.value
        invoker.value = nextValue
        // 绑定 invoker 作为事件处理函数
        el.addEventListener(name, invoker)
      }
    } else if (invoker) {
      // 新的事件绑定函数不存在, 且之前绑定的 invoker 存在, 则移除绑定
      el.removeEventListener(name, invoker)
    }
    // 绑定事件, nextValue 为事件处理函数
    el.addEventListener(name, nextValue)
  } else if (key === 'class') {
    // ...
  } else if (shouldSetAsProps(el, key, nextValue)) {
    // ...
  } else {
    // ...
  }
}
