/**
 * @title toRef 解决响应丢失问题
 * 
 */

// 响应式数据
const obj = reactive({foo: 1, bar: 2})
// newObj 变成了非响应式数据, 此时修改 newObj 的属性,不会触发副作用函数
const newObj = {...obj}

/**
 * 解决上述问题, 需要在副作用函数内, 也能让 newObj 具备响应能力
 * 代码如下
 */

const newObj2 = {
  foo: {
    get value() { return obj.foo }
  },
  bar: {
    get value() { return obj.bar }
  }
}
/**
 * 上述代码读取属性时, 最终获取的是响应对象 obj 的同名属性, 以此达到创建响应式联系的目的
 * 由此可将代码抽象并封装成以下函数
 */
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }
  // 定义 _v_isRef
  Object.defineProperty(obj, '_v_isRef', {
    value: true
  })
  return wrapper
}
// 封装 toRefs 进行批量属性转换
function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    // 逐个调用转换
    ret[key] = toRef(obj, key)
  }
  return ret
}