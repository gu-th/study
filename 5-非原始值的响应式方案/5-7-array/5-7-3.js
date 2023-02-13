/**
 * @title 数组的查找方法
 * const arr = reactive([1, 2])
 * effect(() => { console.log(arr.includes(1)) })
 * arr[0] = 3
 * includes 方法为了找到给定值，内部会访问 length 属性及数组的索引，因此修改某个索引指向的元素后会触发响应
 * const obj = {}
 * const arr = reactive([obj])
 * 当数组内的元素为对象时，arr.includes(arr[0]) 为 false
 * 因为arr[0] 得到的是代理对象，而includes内部也会通过arr访问数组元素，又得到一个代理对象，两个代理对象是不同的
 */

// 存储原始对象到代理对象的映射
const reactiveMap = new Map()

function reactive(obj) {
  // 优先通过原始对象obj寻找之前创建的代理对象，如果找到了就返回已有的代理对象
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy
  // 否则，创建新的代理对象
  const proxy = createReactive(obj)
  // 存储到 Map中, 避免重复创建
  reactiveMap.set(obj, proxy)

  return proxy
}

/**
 * 上述调整后， arr.includes(arr[0]) // true 的结果正确了
 * 但 arr.includes(obj) 结果仍为false，因为includes内部的this 指向的是代理对象arr，且获得的数组元素也是代理对象
 * 所以用原始对象obj在arr中查找不到，为此 需重写includes方法并实现自定义行为
 */

const orginMethod = Array.prototype.includes
const arrayInstrumentations = {
  includes: function(...args) {
    // this 是代理对象 现在代理对象中查找
    let res = orginMethod.apply(this, args)
    if (res === false) {
      // 代理对象中没有找到， 就通过 this.raw 拿到原始数组，再去查找并更新 
      res = orginMethod.apply(this.raw, args)
    }
    return res
  }
}
// 除 includes 外， indexOf 与 lastIndexOf 也是根据给定值返回查找结果，调整代码如下
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const orginMethod = Array.prototype[method]
  arrayInstrumentations[method] = function(...args) {
    let res = orginMethod.apply(this, args)
    if (res === false) {
      res = orginMethod.apply(this.raw, args)
    }
    return res
  }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截读取属性操作
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }

      // * 如果操作对象是数组，且 key 在 arrayInstrumentations 中存在
      // * 则返回定义在 arrayInstrumentations 的值，即使用自定义的数组方法
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }

      if (!isReadonly && typeof key !== 'symbol') {
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
    },
  })
}
