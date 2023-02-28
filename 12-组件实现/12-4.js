/**
 * @title props 与 组件被动更新
 */

function mountComponent(vnode, container, anchor) {
  const componentOptions = vnode.type
  const {
    render,
    data,
    beforeCreate,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    props: propsOption,
  } = componentOptions

  // 调用 钩子
  beforeCreate && beforeCreate()

  const state = reactive(data())

  const [props, attrs] = resolveProps(propsOption, vnode.props)

  // 定义组件实例，包含与组件有关的状态信息
  const instance = {
    // 组件自身状态数据
    state,
    // 将解析出的 props 数据包装为 shallowReactive 并定义到组件实例上
    props: shallowReactive(props),
    // 是否已被挂载
    isMounted: false,
    // 组件渲染内容，即子树 (subTree)
    subTree: null,
  }

  // 将组件实例设置到 vnode 上，用于后续更新
  vnode.component = instance

  // 创建渲染上下文对象 本质是组件实例的代理
  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      // 取得组件自身状态数据
      const { state, props } = t
      // 读取自身状态、
      if (state && k in state) {
        return state[k]
      } else if (k in props) {
        return props[k]
      } else {
        console.error('不存在')
      }
    },
    set(t, k, v, r) {
      const { state, props } = t
      if (state && k in state) {
        state[k] = v
      } else if (k in props) {
        props[k] = v
      } else {
        console.error('不存在')
      }
    },
  })

  created && created.call(state)

  effect(
    () => {
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
    },
    {
      scheduler: queueJob,
    }
  )
}

function resolveProps(options, propsData) {
  const props = {}
  const attrs = {}

  for (const key in propsData) {
    if (key in options) {
      // 如果组件传递的 props 数据在组件自身 props 选项中有定义，则将其视为合法的 props
      props[key] = propsData[key]
    } else {
      // 否则将其视为 attrs
      attrs[key] = propsData[key]
    }
  }
  // 返回 props 和 attrs 数据
  return [props, attrs]
}

function patchComponent(n1, n2, container) {
  // 获得组件实例 同时让新的组件虚拟节点 n2.component 也指向组件实例
  const instance = (n2.component = n1.component)
  // 获取 props
  const { props } = instance
  // 调用 hasPropsChanged 检测子组件传递的 props 是否发生变化，没变化则不需要更新
  if (hasPropsChanged(n1.props, n2.props)) {
    // 调用 resolveProps 函数重新获取 props 数据
    const [nextProps] = resolveProps(n2.type.props, n2.props)
    // 更新 props
    for (const key in nextProps) {
      props[key] = nextProps[key]
    }
    // 删除不存在的 props
    for (const key in props) {
      if (!(key in nextProps)) {
        delete props[key]
      }
    }
  }
}

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  // 新旧 props 数量变了 说明有变化
  if (nextKeys.length !== Object.keys(prevProps)) {
    return true
  }

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    // 有不相等的 props 说明有变化
    if (prevProps[key] !== nextProps[key]) return true
  }
  return false
}
