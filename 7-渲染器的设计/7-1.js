/**
 * @title 渲染器与响应式系统
 * 
 */

// 定义一个响应式数据
const count = ref(1)

effect(() => {
  // 在副作用函数内调用 renderer 函数执行渲染，副作用函数执行完毕后，会与响应式数据建立响应联系
  // 利用响应系统的能力，自动调用渲染器完成页面的渲染和更新
  renderer(`<h1>${count.value}</h1>`, document.getElementById('app'))
})

count.value++