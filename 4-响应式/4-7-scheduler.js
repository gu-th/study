/**
 * @title 调度执行
 * 可调度性, 指当trigger触发副作用函数执行时, 有能力决定副作用函数执行的时机 次数 和方式
 *
 * const data = { foo: 1 }
 * const obj = new Proxy(data, { ... })
 * effect(() => {
 *    console.log(obj.foo)
 * })
 * obj.foo++
 * console.log('end')
 * 此时输出顺序为 1 2 end, 若需要不改变代码调整顺序为 1 end 2, 则需要响应式系统支持调度
 *
 * 解决方式：为effect函数添加一个选项参数 option, 允许用户指定调度器
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
    // 执行副作用函数
    fn()
    // 当前副作用函数执行完后, 将当前副作用函数弹出栈中
    effectStack.pop()
    // 把 activeEffect 还原为 之前的值
    activeEffect = effectStack[effectStack.length - 1]
  }
  // * 将options挂载到effecFn上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数有关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
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
    // * 如果一个副作用函数存在调度器.则调用调度器来执行副作用函数
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
// effect(
//   () => {
//     console.log(obj.foo)
//   },
//   // option
//   {
//     // 调度器scheduler是一个函数
//     scheduler(fn) {
//       // 将副作用函数放到宏任务队列执行
//       setTimeout(fn)
//     },
//   }
// )
// obj.foo++
// console.log('end')
// foo 连续两次自增, 输出为 1 2 3, 如果不关心过程, 期望输出1 3,可以基于调度器进行实现

// 创建任务队列
const jobQueue = new Set()
// 用Promise.resolve()创建一个Promise实例, 用它将任务添加到微任务队列
const p = Promise.resolve()
// 标志代表是否正在刷新队列
let isFlushing = false

function flushJob() {
  console.log(isFlushing);
  // 队列正在刷新 什么都不做
  if (isFlushing) return
  // 设为true , 代表队列正在刷新
  isFlushing = true
  // 在微任务队列中刷新 jobQueue 队列
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    // 结束后重置isFlushing
    isFlushing = false
  })
}

effect(() => {
  console.log(obj.foo);
}, {
  scheduler(fn) {
    // 每次调度, 将副作用函数添加到jobQueue队列中
    // ++两次触发的是同一个副作用函数, 所以jobQueue只有一项
    jobQueue.add(fn)
    // 刷新队列
    // flushJob调用两次, 因为isFlushing只执行了开始的一次, 当微任务开始执行时, foo已经是3了,
    flushJob()
  }
})
obj.foo++
obj.foo++

// 上述foo++的调度功能, 类似于Vue.js中连续多次修改响应式数据但只触发一次更新. 实际内部思路也是一样的