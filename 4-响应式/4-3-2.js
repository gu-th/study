/**
 * 4-2 中的副作用函数以硬编码的形式调用，一旦副作用函数改名，或是匿名函数，无法处理
 * 4-3-1 示例使用更灵活的方式, 但桶仍有缺陷，即副作用函数没有与对象的key建立联系
 * 4-3-2 桶的结构应该是一个树形结构，  由代理的对象-key-effect组成
 * 对象对应key，每个key 有自己对象的副作用函数，应该是对应关联起来的
 */

// 存储副作用函数的桶, 收集副作用
/** Map<object, Map<key, function>> */
const bucket = new WeakMap()

// 用一个全局变量存储 被注册的 副作用函数
let activeEffect
// effect函数 用于注册副作用函数
function effect(fn) {
  // 调用effect注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}

// 原始数据
const data = {
  ok: true,
  text: 'hello world',
}
// 代理数据
const obj = new Proxy(data, {
  // 拦截数据读取
  get(target, key) {
    console.log('get key', key)
    // 将对应的副作用函数放进桶里
    track(target, key)
    // 返回值
    return target[key]
  },
  // 拦截数据变更
  set(target, key, newVal) {
    // 设置值
    console.log('set key: ', key)
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
  // 桶里是否有该对象的副作用集合，没有就新建
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  // 根据 key 再从 depsMap（副作用集合） 里取出对应的 副作用函数集合 - Set数据结构
  let deps = depsMap.get(key)
  // 如果不存在，就新建一个关联关系
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  // 最后将副作用函数放进桶里
  deps.add(activeEffect)
}

// 在 set 拦截函数内调用 trigger 函数  触发变化
function trigger(target, key) {
  // 取出target对应的depsMap:  key --> effects
  let depsMap = bucket.get(target)
  if (!depsMap) return
  // 根据 key 取出 副作用函数集合
  let effects = depsMap.get(key)
  effects && effects.forEach((fn) => fn())
}
effect(() => {
  console.log('run')
  document.body.innerText = obj.ok ? obj.text : 'not'
})

setTimeout(() => {
  obj.ok = false
}, 1000)

setTimeout(() => {
  obj.text = 'hello guth'
}, 2000)
