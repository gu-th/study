/**
 * @title 事件冒泡与更新时机
 * 以下代码示例期望结果：首次渲染完成后，bol 值为 false, 所以不会为 div 元素绑定事件, 点击 p 元素，
 * 事件从 p 冒泡到 div，但由于 div 没有绑定事件， 所以什么都不会发生
 *
 * 实际上，div 元素的事件执行了，因为 bol 是个响应式数据，所以它的值变化时，会触发副作用函数重新执行
 * 由于此时 bol.value 已经是 true 了，所以在更新阶段，渲染器会为 div 元素绑定事件，更新完成后，点击事件才从 p 冒泡到 div
 * 此时 div 已绑定事件，就会触发执行
 * 以上问题原因为：div 元素绑定事件处理函数发生在事件冒泡之前。
 * 解决方式： 屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行
 */

const bol = ref(false)
effect(() => {
  // 创建一个 vnode
  const vnode = {
    type: 'div',
    props: bol.value
      ? {
          onClick: () => {
            alert('父元素 clicked')
          },
        }
      : {},
    children: [
      {
        type: 'p',
        props: {
          onClick: () => {
            bol.value = true
          },
        },
        children: 'text',
      },
    ],
  }
  // 渲染 vnode
  renderer.render(vnode, document.querySelector('#app'))
})

function patchProps(el, key, prevValue, nextValue) {
  if (/^on/.test(key)) {
    const invokers = el._vei || (el._vei = {})
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        invoker = el._vei[key] = (e) => {
          // e.timeStamp 是事件发生的时间
          // 如果事件发生的事件早于事件处理函数绑定的时间，则不执行事件处理函数
          if (e.timeStamp < invoker.attached) return
          if (Array.isArray(invoke.value)) {
            invoker.value.forEach((fn) => fn(e))
          } else {
            invoker.value(e)
          }
        }
        invoker.value = nextValue
        // 添加 invoker.attached 属性，存储时间处理函数被绑定的时间
        invoker.attached = performance.now()
        el.addEventListener(name, invoker)
      } else {
        invoker.value = nextValue
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
