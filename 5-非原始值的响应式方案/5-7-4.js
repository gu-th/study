/**
 * @title 隐式修改数组长度的方原型方法
 * 指的是数组的一些栈方法 push/pop/shift/unshift 等 splice 也会隐式修改数组长度
 * 以 push 为例，调用push向数组中添加元素时，机会读取数组的length属性，也会设置数组的length属性，会导致两个副作用函数相互影响，会导致调用栈溢出
 * 问题原因 push 方法的调用会间接读取 length 属性，所以只要 “屏蔽” 对 length 的读取，避免它与副作用函数之间的响应式联系即可
 * 因为 push 方法在语义上是修改操作，不是读取，所以避免建立响应式联系不会产生其他副作用
 * 
 */

const arrayInstrumentations = {}
// 标记变量，代表是否进行追踪，默认true 允许追踪
let shouldTrack = true
// 重写方法
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    // 调用原始方法前，先禁止追踪
    shouldTrack = false
    // 调用原始方法
    let res = originMethod.apply(this, args)
    // 调用原始方法后，允许追踪
    shouldTrack = true
    return res
  }
})

function track(target, key) {
  // 禁止追踪时， 直接返回
  if (!activeEffect || !shouldTrack) return
  // ....
}