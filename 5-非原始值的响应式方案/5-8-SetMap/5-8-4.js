/**
 * @title 处理循环
 * 集合类型的 forEach 类似于数组的 forEach
 * 以 Map 为例，遍历操作至于键值对数量有关，因此任何会修改 Map 键值对数量的操作都应该触发副作用函数重新执行
 * 所以 当 forEach 函数被调用时，应该让副作用函数与 ITERATE_KEY 建立响应联系
 * 
 */

const ITERATE_KEY = Symbol()
function reactive(val) {/* ... */}

const mutableInstrumentations = {
  forEach(callback) {
    // wrap 函数把可代理的值变成响应式数据
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val
    // 获得原始数据对象
    const target = this.raw
    // 与ITERATE_KEY建立响应联系
    track(target, ITERATE_KEY)
    // 通过原始对象调用 forEach
    target.forEach((v, k) => {
      // 手动调用 callback 用 wrap 包裹数据再传给 callback 实现深响应
      // callback(wrap(v), wrap(k), this)
      // forEach 函数还可以接收第二个参数  指定 callback 函数执行时的 this 值
      // 通过 .call 调用 callback 并传递 thisArg
      callback.call(thisArg, wrap(v), wrap(k), this)
    })
  }
}
const bucket = new WeakMap()
let activeEffect
function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effctsToRun = new Set()

  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effctsToRun.add(effectFn)
    }
  })

  /**
   * 用 forEach 遍历 Map 时, 即关心键, 也关心值,
   * 当调用 p.set('key', 2) 修改值的时候, 也应该触发副作用函数重新执行
   * 如果操作类型是 SET 并且目标数据是 Map 对象, 也应该触发 ITERATE_KEY 相关联的副作用函数执行
   */
  if (type === 'ADD' || type === 'DELETE'
  || (type === 'SET' && Object.prototype.toString.call(target) === '[object Map]')
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effctsToRun.add(effectFn)
      }
    })
  }
  //  省略部分代码
  effctsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
