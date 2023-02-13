/**
 * @title 避免污染原始数据
 * 
 * 在 set 方法内，我们把 value 原样设置到了原始数据 target 上。如果 value 是响应式数据，就意味着设置到原始对象上的也是响应式数据
 * 我们把响应式数据设置到原始数据上的行为称为数据污染。
 * 
 * ! 使用 raw 属性来访问原始数据是有缺陷的，因为它可能与用户自定义的 raw 属性冲突，
 * 所以在一个严谨的实现中，我们需要使用唯一的标识来作为访问原始数据的键，例如使用 Symbol 类型来代替。
 *
 */

const mutableInstrumentations = {
  get(key) {
    // 获取原始对象
    const target = this.raw
    // 判断读取的 key 是否存在
    const had = target.has(key)
    // 追踪依赖，建立响应联系
    track(target, key)
    // 如果存在，则返回结果。这里要注意的是，如果得到的结果 res 仍然是可代理的数据，
    // 则要返回使用 reactive 包装后的响应式数据
    if (had) {
      const res = target.get(key)
      return typeof res === 'object' ? reactive(res) : res
    }
  },
  set(key, value) {
    const target = this.raw
    const had = target.has(key)

    const oldValue = target.get(key)
    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value
    target.set(key, rawValue)
    // 如果数据不存在 就是新增
    if (!had) {
      trigger(target, key, 'ADD')
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      trigger(target, key, 'SET')
    }
  },
}
