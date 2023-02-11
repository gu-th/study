/**
 * @title 代理Object
 *
 * 1. 对读取操作拦截
 *     (1) 访问树形 obj.foo
 *     (2) 判断对象或原型上是否存在指定的key： key in obj
 *     (3) 使用 for ... in 循环遍历对象
 * 2. 对设置（新增或修改）操作拦截
 * 3. 对删除操作拦截
 */

const obj = {
  foo: 1,
}
const ITERATE_KEY = Symbol()
const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
}

const bucket = new WeakMap()
let activeEffect

const p = new Proxy(obj, {
  // 读取操作拦截 (1)  obj.foo
  get(target, key, receiver) {
    // 追踪变化，建立联系
    track(target, key)
    // 返回属性值
    return Reflect.get(target, key, receiver)
  },
  /**
   * 读取操作拦截 (2)  key in obj
   * in 操作符的运算结果是通过调用一个叫作 HasProperty 的抽象方法得到的, 对应调用的内部方法是[[HasProiperty]]
   * [[HasProiperty]]对应的拦截函数是 has
   */
  has(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  /**
   * 读取操作拦截 (3) for ... in   内部方法中使用了 Reflect.ownKeys获取对象自身的键
   * 在set/get中可以得到具体操作的key，但在ownKeys中，只能拿到目标对象target
   * 因为读写属性时，能明确的知道要操作哪一个属性，所以只需要在操作的属性与副作用函数之间建立联系即可
   * 而ownKeys用来获取一个对象所有属于自己的键值，不与任何具体的键绑定
   * 因此只能构造一个唯一的key作为标识，即 ITERATE_KEY， 追踪的是ITERATE_KEY，那么触发响应时也应该触发它 即 trigger(target, ITERATE_KEY)
   */
  ownKeys(target) {
    // 将副作用函数与 ITERATE_KEY 关联
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },

  set(target, key, newVal, receiver) {
    // * 如果属性不存在，说明是新增属性，否则是设置已有属性
    const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
    // 设置属性值
    const res = Reflect.set(target, key, newVal, receiver)
    // 将type作为第三个参数传给trigger
    trigger(target, key, type)
    return res
  },

  /**
   * delete操作符的行为依赖 [[delete]] 内部方法， 该内部方法使用 deleteProperty 拦截
   */
  deleteProperty(target, key) {
    // 检查被操作的属性是否是对象自身的
    const hasKey = Object.prototype.hasOwnProperty.call(target, key)
    // 使用 deleteProperty 删除属性
    const res = Reflect.deleteProperty(target, key)
    // 只有被删除的属性是自己的属性时， 才触发更新
    if (hasKey && res) {
      trigger(target, key, TriggerType.DELETE)
    }
    return res
  }
})

function track(target, key) {
  /* ... */
}
function trigger(target, key, type) {
  const depsMap = bucket.get(target)
  // 获取 key 相关联的副作用函数
  const effects = depsMap.get(key)
  // 获取 ITERATE_KEY 相关联的副作用函数
  const iterateEffects = depsMap.get(ITERATE_KEY)

  const effectsToRun = new Set()
  // 将与 key 相关联的副作用函数添加到 effectsToRun
  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })

  // * 只有操作类型为 ADD 或 DELETE ，即新增属性或删除属性时，才触发与 ITERATE_KEY 相关联的副作用函数执行
  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    // * 将与 ITERATE_KEY 相关联的副作用函数添加到 effectsToRun
    iterateEffects &&
      iterateEffects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn)
        }
      })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
