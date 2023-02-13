/**
 * @title 建立响应联系
 *
 */
const ITERATE_KEY = Symbol()
function createReactive1(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'size') {
        // 调用 track 函数建立响应联系
        // 响应联系需要建立在 ITERATE_KEY与副作用函数之间，因为任何新增、删除操作都会影响 size 属性
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target)
      }
      return target[key].bind(target)
    },
  })
}

/**
 * 调用 add 方法向集合中添加元素时，触发响应，需要自定义实现 add 方法
 */
const mutableInstrumentations = {
  add(key) {
    // this 指向代理对象，通过 raw 属性获得原始对象
    const target = this.raw
    // 先判断值是否已经存在
    const hasKey = target.has(key)
    // 这里通过原始对象执行 add 方法添加值，因此不需要 bind
    const res = target.add(key)
    // 如果值不存在，才触发响应
    if (!hasKey) {
      // 调用 trigger 触发响应，并指定操作类型为 ADD
      trigger(target, key, 'ADD')
    }
    return res
  },
  // delete 拦截与 add 类似 
  delete(key) {
    const target = this.raw
    const hasKey = target.has(key)
    const res = target.delete(key)
    if (hasKey) {
      // 只有值存在，才触发 delete 的响应
      trigger(target, key, 'DELETE')
    }
    return res
  }
}

function createReactive2(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 如果读取的是 raw 属性，则返回原始数据对象 target
      if (key === 'raw') return target
      if (key === 'size') {
        // 调用 track 函数建立响应联系
        // 响应联系需要建立在 ITERATE_KEY与副作用函数之间，因为任何新增、删除操作都会影响 size 属性
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target)
      }
      // 返回定义在 mutableInstrumentations 对象下的方法
      return mutableInstrumentations[key]
    },
  })
}
