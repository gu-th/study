/**
 * @title ref
 * Proxy 只能代理非原始值, 不能代理原始值
 * 使用一个非原始值进行"包裹" 达到响应式的目的
 */

function ref(val) {
  // 在 ref 函数内部创建包裹对象
  const wrapper = {
    value: val
  }

  // 使用 defineProperty 在 wrapper 上定义一个不可枚举的属性, 且值为true
  // 代表这个对象是一个 ref, 而非普通对象, 然后就可以通过_v_isRef进行判断
  Object.defineProperty(wrapper, '_v_isRef', {
    value: true
  })
  // 将包裹对象变成响应式数据
  return reactive(wrapper)
}

function reactive(obj) { /* ... */ }