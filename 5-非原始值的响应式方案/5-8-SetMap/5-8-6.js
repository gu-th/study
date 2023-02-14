/**
 * @title values 和 keys
 * 与 entries 类似
 * 
 */

const mutableInstrumentations2 = {
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valuesIterationMethod
}
const ITERATE_KEY = Symbol()
function valuesIterationMethod() {
  const target = this.raw
  // 通过 target.values 获取原始迭代器方法
  const itr = target.values()
  const wrap = (val) => typeof val === 'object' && val !== null ? reactive(obj) : val

  track(target, ITERATE_KEY)

  return {
    next() {
      const { value, done } = itr.next()
      return {
        // value 是值, 非键值对
        value: wrap(value),
        done
      }
    },
    // 实现可迭代协议
    [Symbol.iterator]() {
      return this
    }
  }
}


const MAP_ITERATE_KEY = Symbol()
function keysIterationMethod() {
  const target = this.raw
  // 通过 target.keys 获取原始迭代器方法
  const itr = target.keys()
  const wrap = (val) => typeof val === 'object' && val !== null ? reactive(obj) : val

  /**
   * 对 keys 方法来说, 操作类型为 SET 时, 没必要触发与 ITERATE_KEY 相关的响应
   * 因为 keys 只关注键, 不关注值, 所以只有操作类型为 ADD / DELETE时, 才需要触发响应
   * 因此 设置一个 MAP_ITERATE_KEY 作为抽象的键, trigger 时也需要触发 MAP_ITERATE_KEY 关联的响应
   * 调用 track 函数追踪依赖, 在副作用函数与 MAP_ITERATE_KEY 建立响应式联系
   */
  track(target, MAP_ITERATE_KEY)

  return {
    next() {
      const { value, done } = itr.next()
      return {
        // value 是值, 非键值对
        value: wrap(value),
        done
      }
    },
    // 实现可迭代协议
    [Symbol.iterator]() {
      return this
    }
  }
}

function trigger(target, key, type, newVal) {
  // ... 省略一些代码

  const effectsToRun = new Set()

  // 操作类型为 ADD 或 DELETE
  if ((type === 'ADD' || type === 'DELETE') &&
  // 数据是 Map 类型
      Object.prototype.toString.call(target) === '[object Map]') 
    {
      // 取出 与 MAP_ITERATE_KEY 相关联的副作用函数并执行
      const interateEffects = depsMap.get(MAP_ITERATE_KEY)
      interateEffects && interateEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn)
        }
      })
    }
    // ... 省略后续代码
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
