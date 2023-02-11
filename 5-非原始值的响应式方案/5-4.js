/**
 * @title 合理地触发响应
 *
 * 当值没有变化时，不应该触发响应
 *
 */

const obj = { foo: 1 }
const p = reactive(obj)
// 设置 p.foo 的值，但值没有变化
p.foo = 1

const proto = { bar: 1 }
const child = reactive(obj)
const parent = reactive(proto)
// 使用parent 作为 child 的原型
Object.setPrototypeOf(child, parent)
/**
 * 修改 child.bar 的值, 会导致副作用函数重新执行两次
 * 因为副作用函数读取child.bar 值时，会触发get拦截，Reflect.get(obj, 'bar', receiver)
 * 实现了通过 obj.bar 来访问属性值的默认行为。即，引擎内部是通过调用 obj 对象所部署的 [[Get]] 内部方法来得到最终结果的
 * child 代理的对象 obj 自身没有 bar 属性，因此会获取对象 obj 的原型， 即parent对象， parent对象也是响应式数据
 * 因此副作用函数访问parent.bar时，会导致副作用函数被收集，从而也建立了响应联系
 * 更新值的过程同上述get一样，也会触发两次set拦截，最终导致副作用函数执行两次
 * 解决方式：屏蔽一次set拦截函数，在set拦截函数内区分这两次更新即可
 * 
 */
child.bar = 2

function reactive(obj) {
  return new Proxy(obj, {
    /**
     * receiver 实际上就是 target 的代理对象， 当obj上不存在bar属性时，获取obj(child)的原型parent
     * 当parent代理对象的set拦截函数执行时， target是parent的原始对象proto，但receiver仍然是代理对象child， 此时receiver 不是 target 的代理对象
     * 由此，最初设置的是child.bar，无论什么情况，receiver 都是child，而target是不断变化的
     * 解决：判断receiver是否是target的代理对象即可， 只有当receiver是target代理对象时才触发更新
     */
    set(target, key, newVal, receiver) {
      // 先获取旧值
      const oldVal = target[key]

      const type = Object.prototype.hasOwnProperty.call(target, y) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)

      /**
       * *
       * target === receiver.raw 说明 receiver是target的代理对象。只有当 receiver 是 target 的代理对象时才触发更新
       * 这样就能屏蔽由原型引起的更新，从而避免不必要的更新操作
       */
      if (target === receiver.raw) {
        // * 比较新值与旧值，只有当不全等 且都不是NaN 的时候才触发响应
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type)
        }
      }

      return res
    },

    get(target, key, receiver) {
      // * 代理对象可以通过 raw 属性访问原始数据， 通过raw 可以在set拦截函数里判断receiver是不是target的代理函数
      if (key === 'raw') {
        return target
      }
      track(target, key)
      return Reflect.get(target, key, receiver)
    }
    // 省略其他未改变拦截函数
  })
}


function track(target, key) {/* ... */}
function trigger(target, key) {/* ... */}