/**
 * @title 计算属性 computed
 *
 *
 */

// 存储副作用函数的桶, 收集副作用
const bucket = new WeakMap()

// 用一个全局变量存储 被注册的 副作用函数
let activeEffect
// effect栈 数组模拟
let effectStack = []

// effect函数 用于注册副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    // 清除依赖集合
    cleanup(effectFn)
    // 调用effect注册副作用函数，将副作用函数复制给activeEffect
    activeEffect = effectFn
    // 调用副作用函数前, 将副作用函数压入栈中
    effectStack.push(effectFn)
    // 执行副作用函数, 并将结果存储到res中
    const res = fn() // 新增
    // 当前副作用函数执行完后, 将当前副作用函数弹出栈中
    effectStack.pop()
    // 把 activeEffect 还原为 之前的值
    activeEffect = effectStack[effectStack.length - 1]
    // 将res 作为effectFn的返回值
    return res // 新增
  }
  // 将options挂载到effecFn上
  effectFn.options = options // 新增代码
  // activeEffect.deps 用来存储所有与该副作用函数有关的依赖集合
  effectFn.deps = []

  // 非lazy的时候 才执行
  if (!options.lazy) {
    // 新增
    // 执行副作用函数
    effectFn()
  }
  // 将副作用函数作为返回值返回
  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // 当前副作用函数的依赖集合
    const deps = effectFn.deps[i]
    // 删除当前的副作用函数
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// 原始数据
const data = {
  foo: 1,
  bar: 2,
}
// 代理数据
const obj = new Proxy(data, {
  // 拦截数据读取
  get(target, key) {
    // 将对应的副作用函数放进桶里
    track(target, key)
    // 返回值
    return target[key]
  },
  // 拦截数据变更
  set(target, key, newVal) {
    // 设置值
    target[key] = newVal
    // 将副作用取出来并执行
    trigger(target, key)
  },
})

// 在 get 拦截函数内调用 track 函数 追踪变化
function track(target, key) {
  // 没有直接return
  if (!activeEffect) return

  // 根据target从桶中取 depsMap，也是Map类型： key --> effects
  // （即target对象中 key 的 effect， 也是一个树结构-map）
  let depsMap = bucket.get(target)
  // 如果不存在，就新建
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  // 根据 key 再从 depsMap 里取出对应的 副作用函数集合 Set数据结构
  let deps = depsMap.get(key)
  // 如果不存在，就新建一个关联关系
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  // 最后将当前激活的副作用函数放进集合依赖deps里 （放进了桶里）
  deps.add(activeEffect)

  // deps 是当前target， 当前key，所对应的副作用函数的集合
  // 把他放进activeEffect.deps 中
  activeEffect.deps.push(deps) // 新增
}

// 在 set 拦截函数内调用 trigger 函数  触发变化
function trigger(target, key) {
  // 取出target对应的depsMap:  key --> effects
  let depsMap = bucket.get(target)
  if (!depsMap) return
  // 根据 key 取出 副作用函数集合
  let effects = depsMap.get(key)

  // 重新构建一个Set 避免无限循环
  const effectsToRun = new Set()
  effects &&
    effects.forEach((effectFn) => {
      // 如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同, 则不触发执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => {
    // 如果一个副作用函数存在调度器.则调用调度器来执行副作用函数
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

// * 计算属性
function computed(getter) {
  // value用来缓存上一次计算的值
  let value
  // dirty标志, 标识是否需要重新计算, true代表脏, 需要进行再次计算
  let dirty = true

  /**
   * 手动调用trigger和 track原因:
   * 计算属性内部拥有自己的effect 且 是懒执行的, 只有真正读取的时候才会执行
   * 对于getter来说, 里面访问的响应式数据会把computed内部的effect收集为依赖
   * 而把计算属性用在另一个effect里面时, 又产生了effect嵌套, 外层的effect不会被内层的effect中的响应式收集
   * 因此 需要手动调用trigger和 track触发追踪陪与响应
   */
  const effectFn = effect(getter, {
    lazy: true,
    // 添加调度器, 在调度器中将dirty置为true, 即当有值发生变化时, 计算属性需要重新计算
    scheduler() {
      dirty = true
      // 当计算属性依赖的响应式数据变化时, 手动调用trigger 触发响应
      trigger(obj, 'value')
    }
  })
  const obj = {
    // 读取getter时才执行effectFn
    get value() {
      // 只有脏时才计算, 并将值缓存在value中
      if (dirty) {
        value = effectFn()
        // 将dirty置为false, 下一次访问直接读取缓存到value中的值
        dirty = false
      }
      // 当读取value时, 手动调用track收集依赖
      track(obj, 'value')
      return value
    }
  }
  return obj
}
const sumRes = computed(() => obj.bar + obj.foo)

effect(function effectFn() {
  console.log(sumRes.value)
})
obj.bar ++
