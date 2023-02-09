// 存储副作用函数的桶
const bucket = new Set()
// 原始数据
const data = {
  text: 'hello world',
}
// 代理数据
const obj = new Proxy(data, {
  // 拦截数据读取
  get(target, key) {
    // 添加副作用函数到桶里
    bucket.add(effect)
    // 返回数据
    return data[key]
  },
  // 拦截数据变更
  set(target, key, newVal) {
    // 设置值
    target[key] = newVal
    // 将副作用函数从桶里取出来 执行副作用函数
    bucket.forEach((fn) => fn())
    // 返回true 代表设置成功
    return true
  },
})

// 副作用函数
function effect() {
  document.body.innerText = obj.text
}
// 初始执行，触发读取
effect()

setTimeout(() => {
  obj.text = 'hello guth'
}, 2000)
