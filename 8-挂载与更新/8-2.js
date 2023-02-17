/**
 * @title HTML Attributes 和 DOM Properties
 * 
 * 每个 DOM 对象会包含很多**属性**，即 Properties
 * 很多 HTML Attributes 在 DOM 对象上有同名的 DOM Properties，但并不总是一致，比如 class 和 className
 * HTML Attributes 的作用是设置与之对应的 DOM Properties 的初始值
 * 注意: 使用 setAtrribute 函数设置属性值，设置的值总是会被字符串化，即：
 * ```
 * el.setArrtibute('disabled', false)
 * ```
 * 等同于
 * ```
 * el.setArrtibute('disabled', 'false')
 * ```
 * 所以，需要优先设置 DOM Properties, 即
 * ```
 * el.disabled = false
 * ```
 */ 

