/**
 * @title 只读和浅只读 readonly
 * 用户修改只读数据属性 或 删除属性时，会收到警告信息
 * 只读本质上也是对数据的代理, 新增参数 isReadonly, 默认false 非只读
 * 
 * 同时，由于数据是只读的，意味着任何方式都不能修改数据，所以也不需要为数据建立响应式联系
 * 当在副作用函数中读取一个只读数据属性时，不需要调用 track 函数跟踪响应
 */

const obj = readonly({ foo: 1 })
// 尝试修改数据，会得到警告
obj.foo = 2

function trigger(target, key, type) {/* ... */}

// 深只读
function readonly(obj) {
  return createReactive(obj, false, true /* 只读 */)
}
// 浅只读
function shallowReadonly(obj) {
  // 浅只读只需要将 isShallow 参数置为 true
  return createReactive(obj, true, true)
}

function reactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截设置操作
    set(target, key, newValue, receiver) {
      // 如果是只读的，打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true
      }
      const oldValue = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newValue, receiver)
      // receiver 是 target 的 代理对象
      if (target === receiver.raw) {
        if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
          trigger(target, key, type)
        }
      }
      return res
    },
    // 拦截删除属性操作
    deleteProperty(target, key) {
      // 如果是只读的，打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true
      }
      const hasKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
      if (hasKey && res) {
        trigger(target, key, type)
      }
      return true
    },
    // 拦截读取属性操作
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      // 非只读的时候才建立响应式连接
      if (!isReadonly) {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
        return res
      }
      if (typeof res === 'object' && res !== null) {
        // 如果数据是只读的， 则继续调用 readonly 进行包装
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    }

    // 省略其他未改变拦截函数
  })
}
