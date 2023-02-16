/**
 * @title 事件处理
 * 使用 invoker 伪造事件处理函数, 把真正的事件处理函数作为 invokers.value 的值
 * 这样 更新事件时, 无须再调用 removeEventListener 函数来移除上一次绑定的事件, 只需要更新 invoker.value 的值即可
 * 
 * 事件绑定的主要步骤: 
 * 1. 先从 el._vei 读取 对应的 invoker 如果不存在, 则将伪造的 invoker 作为事件处理函数, 并缓存到 el._vei 中
 * 2. 将真正的事件处理函数赋值给 invoker.value 属性, 然后把伪造的 invoker 函数作为事件处理函数绑定到元素上
 *    当事件触发时, 实际执行的是伪造的事件处理函数, 在内部间接执行了真正的事件处理函数 invoker.value(e)
 * 
 * 更新事件时, el._vei 已存在, 所以只需将 invoker.value 值替换即可, 这样 在更新事件时, 可以避免一次 removeElementListener 函数的调用
 */

function patchProps(el, key, prevValue, nextValue) {
  // 匹配以 on 开头的属性
  if (/^on/.test(key)) {
    // 获取为该元素伪造的事件处理函数 invoker
    let invoker = el._evi
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        // 如果没有 invoker 则将一个伪造的 invoker 缓存到 el._vei 中   vei 是 vue event invoker 缩写
        invoker = el._evi = (e) => {
          // 伪造的事件处理函数执行时, 会执行真正的事件处理函数
          invoker.value(e)
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
