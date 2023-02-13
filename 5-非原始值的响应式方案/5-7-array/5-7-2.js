/**
 * @title 遍历数组
 * 1. 数组也是对象，那么也可以用for...in循环遍历（应避免这种使用方法，但语法上是可行的）
 * 数组对象与普通对象的不同仅体现在 [[DefineOwnProperty]]
 * 因此 for...in 循环遍历数组与普通对象并没有差异， 也可以使用ownKeys拦截
 * 影响对数组 for...in 循环遍历的操作： (1) 添加新元素 arr[100] = bar (2) 修改数组长度 arr.length = 0, 本质上都是修改了数组的length属性
 * 2.for...of 循环  迭代数组时，只要在副作用函数与数组长度和索引间建立响应联系，就能实现响应式的for...of迭代
 * 即不需要添加新代码， 但使用for...of 或调用 values等方法时，都会读取数组的 Symbol.iterator 属性
 * 该属性是一个symbol值，不应该让副作用函数与Symbol.iterator这类的symbol值产生响应式联系，因此需要修改get中的判断
 * 
 */

const bucket = new WeakMap()
const ITERATE_KEY = Symbol()
let activeEffect
// effect栈 数组模拟
let effectStack = []

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    ownKeys(target) {
      // 如果操作目标是数组，就使用 length 作为 key 建立响应联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    // 拦截读取属性操作
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      // * 非只读且key的类型非symbol时，才进行追踪，建立响应式连接
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
    }
  })
}

function track(target, key) {
  /* ... */
}