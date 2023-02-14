/**
 * @title 迭代器方法
 * 1. entries
 * 2. keys
 * 3. values
 * 调用这些方法会得到相应的迭代器, 并能够调用 for...of 循环迭代
 * 同时, Map / Set 本身也部署了 Symbol.iterator 方法, 也能够用 for...of 进行迭代
 * eg: const m = new Map;  m[Symbol.iterator] === m.entries // trundefined
 */

// 对代理对象 使用 for...of 会抛出异常, 因为代理对象没有实现 Symbol.iterator, 因此需手动实现
const ITERATE_KEY = Symbol()
function track(target, key) { /* ... */ }
const mutableInstrumentations1 = {
  [Symbol.iterator]() {
    const target = this.raw
    // 获取原始对象的迭代器方法
    const itr = target[Symbol.iterator]
    const wrap = (val) = typeof val === 'object' && val !== null ? reactive(val) : val
    
    // 调用 track 函数建立响应联系 
    track(target, ITERATE_KEY)

    // 返回自定义的迭代器方法
    return {
      next() {
        // 调用原始迭代器的 next 方法 获取 value 和 done
        const { value, done } = itr.next()
        return {
          // value[0] - key   value[1] - value
          value: value ? [wrap(value[0]), wrap(value[1])] : value,
          done
        }
      }
    }
  }
}

// 由于 p.entries 与 p[Symbol.iterator] 等价, 所以可以用同样的方法 对 entries 拦截
const mutableInstrumentations2 = {
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod
}
function iterationMethod() {
  const target = this.raw
  const itr = target[Symbol.iterator]
  const wrap = (val) = typeof val === 'object' && val !== null ? reactive(val) : val
  track(target, ITERATE_KEY)

  /**
   * 可迭代协议指的是一个对象实现了 Symbol.iterator 方法
   * 迭代器协议指的是一个对象实现了 next 方法
   * 一个对象可以同时实现这两种协议
   * p.entries 的返回值应该是一个可迭代对象, 所以需要再实现 可迭代协议
   */
  return {
    // 迭代器
    next() {
      const { value, done } = itr.next()
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done
      }
    },
    // 实现可迭代协议
    [Symbol.iterator]() {
      return this
    }
  }
}
