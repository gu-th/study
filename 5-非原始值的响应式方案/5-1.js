/**
 * @title Proxy 和 Reflect
 * Proxy 只能拦截对一个对象的基本操作
 * 复合操作属于一种典型的非基本操作 eg:  obj.fn()  先用get获取fn属性，再通过apply调用函数
 */

let obj = {
  foo: 1,
}
const p = new Proxy(obj, {
  // 拦截读取属性
  get() {},
  // 拦截设置属性
  set(target, key, newValue) {},
})

const fn = (name) => {
  console.log('my name is ', name)
}
const p2 = new Proxy(fn, {
  // 使用apply拦截函数调用
  apply(target, thisArg, ...argArr) {
    target.call(thisArg, ...argArr)
  },
})

/**
 * Reflect
 * 以下两种操作等价， 但Reflect.*可以接收第三个参数, 即指定接收者receiver，可以理解为函数调用过程中的this
 */
console.log(obj.foo) // 1
console.log(Reflect.get(obj, 'foo')) // 1
// 指定第三个参数为{foo: 2}, 这时读取到的就是receiver对象的foo属性值
console.log(Reflect.get(obj, 'foo', { foo: 2 })) // 2

/**
 * 用Reflect解决之前effect的问题
 * 在obj中，bar是一个访问器属性， 在effect副作用函数中通过代理对象 proxy 访问bar 属性
 * effect注册的副作用函数执行时，读取bar属性，发现是访问器属性，执行getter函数
 * getter函数中通过this.foo读取了foo属性，副作用函数与foo建立了联系
 * 但实际上，bar中都的this指向原始对象obj，并不是指向代理对象的，因此 bar中的this.foo 相当于obj.foo
 * 这会导致更改proxy.foo 不会触发响应式，副作用函数没有执行
 * 
 * 解决方式： 用Reflect 设置第三个参数，指定接收对象，让副作用函数与正确的属性建立联系
 */
obj = {
  foo: 1,
  get bar() { return this.foo }
}
// 此处的target 就是原始对象obj
const proxy = new Proxy(obj, {
  // 接收第三个参数 receiver, 代表谁在读取属性  eg： proxy.bar   代理对象proxy 在读取 bar属性
  get(target, key, receiver) {
    track(target, key)
    /**
     * target[key], 相当于obj.bar, 当调用proxy.bar访问bar属性时 getter函数内的this实际指向了原始对象obj
     * 说明最终访问的是obj.foo。 显然 在副作用函数中通过原始对象访问属性不会建立响应联系
     */
    // return target[key]
    /**
     * 当使用proxy访问bar属性时， receiver就是代理对象proxy
     * 所以访问器属性 bar 的 getter函数内的 this 指向代理对象 proxy
     * 这样 副作用函数与响应式数据间 就建立了响应式联系，从而达到依赖收集的效果
     */
    return Reflect.get(target, key, receiver)
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
  },
})

function track() { /*...*/ }
function trigger() { /*...*/ }
