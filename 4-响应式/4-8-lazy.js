/**
 * @title 懒执行的effect
 * 
 * 某些场景, 不希望副作用函数立即执行, 通过在options中添加lazy属性实现
 * 并将包装后的effectFn作为返回值, 以此进行副作用函数的手动执行
 * 
 * effect中参数fn是实际的副作用函数, effectFn是包装后的, 为使effectFn得到副作用函数fn的执行结果
 * 将fn的执行结果保存到res中 作为effectFn的返回值
 * 以此 实现了懒执行的副作用函数, 并能够拿到副作用的执行的结果, 可以基于此实现computed
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
    // * 执行副作用函数, 并将结果存储到res中
    const res = fn() // 新增
    // 当前副作用函数执行完后, 将当前副作用函数弹出栈中
    effectStack.pop()
    // 把 activeEffect 还原为 之前的值
    activeEffect = effectStack[effectStack.length - 1]
    // 将res 作为effectFn的返回值
    return res // * 新增
  }
  // 将options挂载到effecFn上
  effectFn.options = options // 新增代码
  // activeEffect.deps 用来存储所有与该副作用函数有关的依赖集合
  effectFn.deps = []

  // * 非lazy的时候 才执行
  if (!options.lazy) { // * 新增
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
  bar: 2
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
// const effectFn = effect(
//   () => {
//     console.log(obj.foo);
//   },
//   { lazy: true }
// )
// obj.foo++
// 通过lazy不立即执行副作用函数了, 就需要手动调用执行副作用函数
// effectFn()

// * 将传递给effect的函数看作一个getter,那么这个getter就可以返回任何值
const effectFn = effect(
  // getter 返回 foo 和 bar 的和
  () => obj.foo + obj.bar,
  { lazy: true }
)

// value 是 getter 的返回值
const value = effectFn()
