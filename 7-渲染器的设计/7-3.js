/**
 * @title 自定义渲染器
 *
 * 自定义渲染器只是通过抽象的方式，让核心代码不再依赖平台特有的 API
 * 再通过支持个性化配置的能力实现跨平台
 */

const vnode = {
  type: 'h1',
  children: 'hello world !',
}
// 创建渲染器
const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  // 在给定的 parent下添加指定元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  }
})
// 调用 render 函数渲染 vnode
renderer.render(vnode, document.querySelector('#app'))

// renderer2 所实现的渲染器不依赖浏览器特定的 API，不仅能在浏览器中运行，也可以在 node.js 中运行
const renderer2 = createRenderer({
  createElement(tag) {
    console.log('创建元素', tag);
    return { tag }
  },
  setElementText(el, text) {
    console.log(`设置 ${JSON.stringify(el)} 的文本内容为 ${text}`)
    el.text = text
  },
  insert(el, parent, anchor = null) {
    console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`)
    parent.children = el
  }
})
const container =  {type: 'root' }
renderer2.render(vnode, container)



// 传入配置项
function createRenderer(options) {
  // 设计的渲染器应当是一个不依赖浏览器的通用渲染器，所以需要将浏览器特有的 API 抽离
  // 将操作 DOM 的 API 封装成对象传进来， 这样，在 mountElement 等函数内就可以通过配置项目来获取操作 DOM 的 API
  const { createElement, setElementText, insert } = options

  function patch(n1, n2, container) {
    // 如果 n1 不存在，表示挂载
    if (!n1) {
      mountElement(n2, container)
    } else {
      // n1 存在 代表打补丁
    }
  }

  function mountElement(vnode, container) {
    // const el = document.createElement(vnode.type)
    // if (typeof el.children === 'string') {
    //   el.textContent = vnode.child
    // }
    // container.appendChild(el)
    const el = createElement(vnode.type)
    if (typeof el.children === 'string') {
      setElementText(el, el.children)
    }
    insert(el, container)
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode
  }

  return {
    render,
  }
}
