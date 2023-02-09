/**
 * @title 解决无限递归循环
 *
 * const data = { foo: 1 }
 * const obj = new Proxy(data, { ... })
 * effect(() => obj.foo++)
 *
 * 此时的副作用函数执行会引起栈溢出, 因为 obj.foo++ 自增包含了两个子操作
 * 即 obj.foo = obj.foo + 1
 * 1.obj.foo 读取foo属性的值, 触发track操作, 将当前副作用函数收集到"桶"中
 * 2.obj.foo + 1 触发trigger操作, 将桶中副作用函数取出并执行
 * 当前副作用函数还在执行中, 就就行了下一次的执行,导致无限递归调用自己, 栈溢出
 *
 * 问题原因: 读取和设置都是在同一个副作用函数中进行的, 无论track时收集的, 还是trigger时触发的
 *           都是同一个activeEffect
 * 解决方式：在trigger发生时, 添加守卫条件: 如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同, 则不触发执行
 */

// 存储副作用函数的桶, 收集副作用
const bucket = new WeakMap()

// 用一个全局变量存储 被注册的 副作用函数
let activeEffect
// effect栈 数组模拟
let effectStack = []

// effect函数 用于注册副作用函数
function effect(fn) {
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
  text: 1,
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
  
  // const effectsToRun = new Set(effects)
  // effectsToRun.forEach((fn) => fn())
  
  // 重新构建一个Set 避免无限循环
  const effectsToRun = new Set()
  effects && effects.forEach((effectFn) => {
      // 如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同, 则不触发执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  effectsToRun.forEach((fn) => fn())
}
effect(() => {
  console.log('run')
  document.body.innerText = obj.text
})

obj.text++
