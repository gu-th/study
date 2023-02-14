/**
 * @title 脱ref
 * toRefs 解决了响应丢失的问题, 但会导致第一层属性必须通过 value 属性访问
 * 因此需要自动脱 ref 的能力, 可以通过创建一个代理对象解决该问题
 */

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 如果值是 ref 值, 返回它的 value 属性
      return value._v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      const value = target[key]
      // 如果是 Ref 自动设置对应的 value 值
      if (value._v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}

const obj = reactive({bar: 1})
// 此时 可直接 访问 newObj.bar, 无须通过value属性访问, 也可以直接修改 newObj.bar = 3
const newObj = proxyRefs({...toRefs(obj)})