
#### 代理Map 和 Set

集合类型包括 Map/Set 以及 WeakMap/WeakSet。使用 Proxy 代理集合类型的数据不同于代理普通对象，
因为集合类型数据的操作与普通对象存在很大的不同。

**Set 类型的原型属性和方法如下**
- size：返回集合中元素的数量, 是一个访问器属性属性。
- add(value)：向集合中添加给定的值。
- clear()：清空集合。
- delete(value)：从集合中删除给定的值。
- has(value)：判断集合中是否存在给定的值。
- keys()：返回一个迭代器对象。可用于 for...of 循环，迭代器对象产生的值为集合中的元素值。
- values()：对于 Set 集合类型来说，keys() 与 values() 等价。
- entries()：返回一个迭代器对象。迭代过程中为集合中的每一个元素产生一个数组值 [value, value]。
- forEach(callback[, thisArg])：forEach 函数会遍历集合中的所有元素，并对每一个元素调用 callback 函数。
  forEach 函数接收可选的第二个参数 thisArg，用于指定callback 函数执行时的 this 值。

**Map 类型的原型属性和方法如下**
- size：返回 Map 数据中的键值对数量, 是一个访问器属性属性。
- clear()：清空 Map。
- delete(key)：删除指定 key 的键值对。
- has(key)：判断 Map 中是否存在指定 key 的键值对。
- get(key)：读取指定 key 对应的值。
- set(key, value)：为 Map 设置新的键值对。
- keys()：返回一个迭代器对象。迭代过程中会产生键值对的 key值。
- values()：返回一个迭代器对象。迭代过程中会产生键值对的value 值。
- entries()：返回一个迭代器对象。迭代过程中会产生由 [key, value] 组成的数组值。
- forEach(callback[, thisArg])：forEach 函数会遍历Map 数据的所有键值对，并对每一个键值对调用 callback 函数。
  forEach 函数接收可选的第二个参数 thisArg，用于指定callback 函数执行时的 this 值。

Map 和 Set 这两个数据类型的操作方法相似。它们之间最大的不同体现在，Set 类型使用 add(value) 方法添加元素，而 Map 类型使用 set(key, value) 方法设置键值对，并且 Map 类型可以使用 get(key) 方法读取相应的值。