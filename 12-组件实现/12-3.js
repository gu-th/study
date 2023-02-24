/**
 * @title 组件实例与生命周期
 */

function mountComponent(vnode, container, anchor) {
  const componentOptions = vnode.type
  const { render, data, beforeCreate, created, beforeMount, mounted,
    beforeUpdate, updated } = componentOptions

    // 调用 钩子
    beforeCreate && beforeCreate()

  const state = reactive(data())
  // 定义组件实例，包含与组件有关的状态信息
  const instance = {
    // 组件自身状态数据
    state,
    // 是否已被挂载
    isMounted: false,
    // 组件渲染内容，即子树 (subTree)
    subTree: null
  }

  // 将组件实例设置到 vnode 上，用于后续更新
  vnode.component = instance

  created && created.call(state)

  effect(() => {
    // 调用组件渲染函数  获取子树
    const subTree = render.call(state, state)
    // 检查组件是否挂载
    if (!instance.isMounted) {
      beforeMount && beforeMount.call(state)
      
      // 初次挂载
      patch(null, subTree, container, anchor)
      // 设置为 true 更新时就不会再次进行挂载， 而是执行更新
      instance.isMounted = true

      mounted && mounted.call(state)
    } else {
      beforeUpdate && beforeUpdate.call(state)
      // 组件已挂载，进行更新，使用新子树与上一次的子树 进行打补丁操作
      patch(instance.subTree, subTree, container, anchor)
      updated && updated.call(state)
    }
    // 更新组件实例的子树
    instance.subTree = subTree

  }, {
    scheduler: queueJob
  })

}