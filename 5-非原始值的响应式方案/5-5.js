/**
 * @title 浅响应与深响应
 *
 * 之前实现的都是浅响应，
 */

const obj = reactive({ foo: { bar: 1 } })
// 修改 obj.foo.bar 的值，并不能触发响应
obj.foo.bar = 2

function track(target, key) {/* ... */}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      track(target, key)
      // 得到原始值结果
      const res = Reflect.get(target, key, receiver)
      if (typeof res === 'object' && res !== null) {
        // 如果值是个对象，调用reactive将结果包装成响应式对象返回 eg: { bar: { foo: 1 } }
        return reactive(res)
      }
      // 返回res
      return res
    },
    // 省略其他拦截函数
  })
}

/**
 * 并非所有情况下都需要深响应，所以产生了浅响应 shallowReactive
 * 添加一个 isShallow 参数 代表是否为浅响应即可解决
 */

function shallowReactive(obj) {
  return createReactive(obj, true)
}
function reactive(obj) {
  return createReactive(obj)
}

// 默认非浅响应
function createReactive(obj, isShallow = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      track(target, key)
      // 得到原始值结果
      const res = Reflect.get(target, key, receiver)
      // 如果是浅响应，直接返回原始值
      if (isShallow) {
        return res
      }
      if (typeof res === 'object' && res !== null) {
        // 如果值是个对象，调用reactive将结果包装成响应式对象返回 eg: { bar: { foo: 1 } }
        return reactive(res)
      }
      // 返回res
      return res
    },
    // 省略其他未改变拦截函数
  })
}