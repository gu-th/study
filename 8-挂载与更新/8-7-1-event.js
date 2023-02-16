/**
 * @title 事件处理
 *  - 在虚拟节点中描述事件
 *  - 更新事件
 */

const vnode = {
  type: 'p',
  props: {
    // 事件可以看作一种特殊的属性, 约定 on开头的属性都视为事件
    onClick: () => {
      console.log('clicked');
    }
  },
  children: 'text'
}

function patchProps(el, key, prevValue, nextValue) {
  // 匹配以 on 开头的属性
  if (/^on/.test(key)) {
    // 根据属性名称得到事件 onClick -> click
    const name = key.slice(2).toLowerCase()
    // 如果上一个值存在, 说明这次是更新, 需要先移除上一次绑定的事件处理函数
    prevValue && el.removeEventListener(name, prevValue)
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