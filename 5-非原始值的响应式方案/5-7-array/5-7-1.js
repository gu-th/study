/**
 * @title  数组的索引与 length
 *
 * 数组是一个异质对象，因为数组对象的内部方法 [[DefineOwnProperty]] 与常规对象不同
 *
 * 1. 数组的读取操作
 *    · 通过索引访问数组元素值 arr[0]
 *    · 访问数组的长度 arr.length
 *    · 把数组作为对象，使用 for...in 循环遍历
 *    · 使用 for...of 迭代遍历数组
 *    · 数组的原型方法：concat/join/every/some/find/findIndex/includes 等不改变原数组的方法
 * 2. 数组的设置操作
 *    · 通过索引修改数组元素值：arr[1] = 3
 *    · 修改数组长度：arr.length = 0
 *    · 数组的栈方法：push/pop/shift/unshift
 *    · 修改原数组的原型方法：splice/fill/sort 等。
 *
 */

const arr = reactive(['foo']) // 数组的原长度为 1
// 设置索引 1 的值，会导致数组的长度变为 2
arr[1] = 'bar'
// 修改length属性，致数组清空
arr.length = 0

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    set(target, key, newValue, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      const oldValue = target[key]
      // * 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性, 数组通过索引及长度判断
      const type = Array.isArray(target)
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newValue, receiver)

      if (target === receiver.raw) {
        if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
          // * 增加第四个参数，即触发响应的新值, 针对修改数组长度的处理
          trigger(target, key, type, newValue)
        }
      }
      return res
    },
    // 省略其他拦截函数
  })
}
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()
let activeEffect

function trigger(target, key, type, newValue) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (activeEffect !== effectFn) {
      effectsToRun.add(effectFn)
    }
  })

  // 添加属性或删除删除属性
  if (type === 'ADD' || type === 'DELETE') {
    // 获取 ITERATE_KEY 相关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (activeEffect !== effectFn) {
        effectsToRun.add(effectFn)
      }
    })
  }
  // * 获取跟长度相关的副作用函数
  if (Array.isArray(target) && type === 'ADD') {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach(effectFn => {
      if (activeEffect !== effectFn) {
        effectsToRun.add(effectFn)
      }
    })
  }
  // * 修改数组长度的副作用函数
  if (Array.isArray(target) && key === 'length') {
    // 循环Map则
    depsMap.forEach((effects, key) => {
      // 找到所有索引值大于或等于新的 length 值的元素，然后把与它们相关联的副作用函数取出并执行
      if (key >= newValue) {
        effects && effects.forEach(effectFn => {
          if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
          }
        })
      }
    })
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
