/**
 * @title 如何代理 Set 和 Map
 * 整体思路不变，读取操作时，触发 track 建立响应式关联，设置操作时，触发 trigger 触发响应
 *
 */

const map = new Map()
map.set('key', 1) // 设置数据
map.get('key') // 读取数据
const p = createReactive(map)

// 在 createReactive 里封装用于代理 Set/Map 类型数据的逻辑
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      /**
       * Set.prototype.size 是一个访问器属性， 调用过程中，会检查对象是否存在内部槽[[SetData]]
       * 代理对象不存在这个内部槽，会导致抛出错误
       * 如果读取的是 size 属性，通过指定第三个参数 receiver 为原始对象 target 从而修复问题
       * 这样访问器属性 size 的 getter 函数在执行时，this 指向的就是原始 Set对象而非代理对象
       */
      if (key === 'size') {
        return Reflect.get(target, key, target)
      }
      /**
       * 当访问p.delete 时，delete 方法并没有执行，真正使其执行的语句是p.delete(1)这句函数调用
       * 因此，无论怎么修改 receiver，delete 方法执行时的 this 都会指向代理对象 p, 而不会指向原始Set 对象
       * 需要将方法与原始数据对象 target 绑定后返回解决问题
       */
      return target[key].bind(target)
    },
  })
}
