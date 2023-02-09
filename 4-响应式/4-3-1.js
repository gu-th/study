// 4-2 中的副作用函数以硬编码的形式调用，一旦副作用函数改名，或是匿名函数，无法处理
// 4-3 示例使用更灵活的方式, 但桶仍有缺陷 即副作用函数没有与对象的key建立联系

// 存储副作用函数的桶
const bucket = new Set()

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
  text: 'hello world',
}
// 代理数据
const obj = new Proxy(data, {
  // 拦截数据读取
  get(target, key) {
    // 将 ativeEffect 存储的副作用函数添加到桶里
    console.log('get key', key)
    if (activeEffect) {
      // 新增
      bucket.add(activeEffect) // 新增
    }
    // 返回数据
    return data[key]
  },
  // 拦截数据变更
  set(target, key, newVal) {
    // 设置值
    console.log('set key: ', key)
    target[key] = newVal
    // 将副作用函数从桶里取出来 执行副作用函数
    bucket.forEach((fn) => fn())
    // 返回true 代表设置成功
    return true
  },
})

effect(() => {
  console.log('run')
  document.body.innerText = obj.text
})

// 此处不应该触发副作用函数，但副作用函数仍然执行了，这是不正确的
// 因为副作用函数没有与对象的key建立联系
setTimeout(() => {
  obj.notEx = 'hello v3'
}, 1000)
