/**
 * @title 组件事件于 emit
 */

const MyComponent = {
  name: 'MyComponent',
  props: {
    foo: String,
  },
  setup(props, { emit }) {
    // 发射 change 事件，并传递给事件处理函数两个参数
    emit('change', 1, 2)
    return () => {
      return // ...
    }
  },
}

// <MyComponent @change="handler" />
const CompVNode = {
  type: MyComponent,
  props: {
    onchange: handler
  }
}

function mountComponent(vnode, container, anchor) {
  // ...

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
  }

  // 定义 emit 函数 event：事件  payload：传递给事件处理函数的参数
  function emit(event, ...payload) {
    // 根据约定对事件名称进行处理  eg: change -> onChange
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
    const handler = instance.props[eventName]
    if (handler) {
      // 调用事件处理函数并传递参数
      handler(...payload)
    } else {
      console.log('事件不存在')
    }
  }
  // 将 emit 函数添加到 setupContext 中， 用户可以通过 setupContext 取得 emit 函数
  const setupContext = { attrs, emit }
  
  // ...
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

function resolveProps(options, propsData) {
  const props = {}
  const attrs = {}

  for (const key in propsData) {
    // 没显式声明为 props 的属性都会添加到 attrs 中，即 onXxx 都不会出现在props里
    // 会导致无法根据事件名在 instance.props 里找到对应的事件函数, 所以这里添加判断处理
    // * 以字符串 on 开头的 props，无论是否显示声明，都将其添加到 props 数据中
    if (key in options || key.startsWith('on')) {
      // 如果组件传递的 props 数据在组件自身 props 选项中有定义，则将其视为合法的 props
      props[key] = propsData[key]
    } else {
      // 否则将其视为 attrs
      attrs[key] = propsData[key]
    }
  }
  return [props, attrs]
}