define('externalM/avalon/avalon.shim', function(require, exports, module) {

  /*==================================================
   Copyright (c) 2013-2015 司徒正美 and other contributors
   http://www.cnblogs.com/rubylouvre/
   https://github.com/RubyLouvre
   http://weibo.com/jslouvre/
  
   Released under the MIT license
   avalon.shim.js 1.6 built in 2016.1.5
   support IE6+ and other browsers
   ==================================================*/
  (function(global, factory) {
  
      if (typeof module === "object" && typeof module.exports === "object") {
          // For CommonJS and CommonJS-like environments where a proper `window`
          // is present, execute the factory and get avalon.
          // For environments that do not have a `window` with a `document`
          // (such as Node.js), expose a factory as module.exports.
          // This accentuates the need for the creation of a real `window`.
          // e.g. var avalon = require("avalon")(window);
          module.exports = global.document ? factory(global, true) : function(w) {
              if (!w.document) {
                  throw new Error("Avalon requires a window with a document")
              }
              return factory(w)
          }
      } else {
          factory(global)
      }
  
  // Pass this if window is not defined yet
  }(typeof window !== "undefined" ? window : this, function(window, noGlobal){
  
      /*********************************************************************
       *                    全局变量及方法                                   *
       **********************************************************************/
  
      var expose = new Date() - 0
  //http://stackoverflow.com/questions/7290086/javascript-use-strict-and-nicks-find-global-function
      var DOC = window.document
      var head = DOC.getElementsByTagName("head")[0] //HEAD元素
      var ifGroup = head.insertBefore(document.createElement("avalon"), head.firstChild) //避免IE6 base标签BUG
      ifGroup.innerHTML = "X<style id='avalonStyle'>.avalonHide{ display: none!important }</style>"
      ifGroup.setAttribute("ms-skip", "1")
      ifGroup.className = "avalonHide"
      var rnative = /\[native code\]/ //判定是否原生函数
      function log() {
          if (window.console && kernel.debug) {
              // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
              Function.apply.call(console.log, console, arguments)
          }
      }
  
      var subscribers = "$" + expose
  
      var nullObject = {} //作用类似于noop，只用于代码防御，千万不要在它上面添加属性
      var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
      var rw20g = /\w+/g
      var rsvg = /^\[object SVG\w*Element\]$/
      var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/
      var oproto = Object.prototype
      var ohasOwn = oproto.hasOwnProperty
      var serialize = oproto.toString
      var ap = Array.prototype
      var aslice = ap.slice
      var W3C = window.dispatchEvent
      var root = DOC.documentElement
      var avalonFragment = DOC.createDocumentFragment()
      var cinerator = DOC.createElement("div")
      var class2type = {}
      "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
          class2type["[object " + name + "]"] = name.toLowerCase()
      })
      var bindingID = 1024
      function getUid(el) {
          return el.uuid || (el.uuid = "_" + (++bindingID))
      }
  
  //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
      var generateID = function (prefix) {
          prefix = prefix || "avalon"
          return String(Math.random() + Math.random()).replace(/\d\.\d{4}/, prefix)
      }
  
      function markID(fn) {
          return fn.uuid || (fn.uuid = generateID("e"))
      }
  
      var IEVersion = NaN
      if (window.VBArray) {
          IEVersion = document.documentMode || (window.XMLHttpRequest ? 7 : 6)
      }
  
      function noop() {
      }
  
  
      function oneObject(array, val) {
          if (typeof array === "string") {
              array = array.match(rword) || []
          }
          var result = {},
              value = val !== void 0 ? val : 1
          for (var i = 0, n = array.length; i < n; i++) {
              result[array[i]] = value
          }
          return result
      }
  
  
  
      avalon = function (el) { //创建jQuery式的无new 实例化结构
          return new avalon.init(el)
      }
  
      /*视浏览器情况采用最快的异步回调*/
      avalon.nextTick = new function () {// jshint ignore:line
          var tickImmediate = window.setImmediate
          var tickObserver = window.MutationObserver
          if (tickImmediate) {
              return tickImmediate.bind(window)
          }
  
          var queue = []
          function callback() {
              var n = queue.length
              for (var i = 0; i < n; i++) {
                  queue[i]()
              }
              queue = queue.slice(n)
          }
  
          if (tickObserver) {
              var node = document.createTextNode("avalon")
              new tickObserver(callback).observe(node, {characterData: true})// jshint ignore:line
              var bool = false
              return function (fn) {
                  queue.push(fn)
                  bool = !bool
                  node.data = bool
              }
          }
  
  
          return function (fn) {
              setTimeout(fn, 4)
          }
      }// jshint ignore:line
  
      /*********************************************************************
       *                 avalon的静态方法定义区                              *
       **********************************************************************/
  
      avalon.init = function (el) {
          this[0] = this.element = el
      }
  
      avalon.test = {} //用于测试
      avalon.fn = avalon.prototype = avalon.init.prototype
  
      avalon.type = function (obj) { //取得目标的类型
          if (obj == null) {
              return String(obj)
          }
          // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
          return typeof obj === "object" || typeof obj === "function" ?
          class2type[serialize.call(obj)] || "object" :
              typeof obj
      }
  
      avalon.isFunction = typeof alert === "object" ? function (fn) {
          try {
              return /^\s*\bfunction\b/.test(fn + "")
          } catch (e) {
              return false
          }
      } : function (fn) {
          return serialize.call(fn) === "[object Function]"
      }
  
      avalon.isWindow = function (obj) {
          if (!obj)
              return false
          // 利用IE678 window == document为true,document == window竟然为false的神奇特性
          // 标准浏览器及IE9，IE10等使用 正则检测
          return obj == obj.document && obj.document != obj //jshint ignore:line
      }
  
      function isWindow(obj) {
          return rwindow.test(serialize.call(obj))
      }
      if (isWindow(window)) {
          avalon.isWindow = isWindow
      }
  
      var enu, enumerateBUG
      for (enu in avalon({})) {
          break
      }
      enumerateBUG = enu !== "0" //IE6下为true, 其他为false
  
      /*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
      avalon.isPlainObject = function (obj, key) {
          if (!obj || avalon.type(obj) !== "object" || obj.nodeType || avalon.isWindow(obj)) {
              return false;
          }
          try { //IE内置对象没有constructor
              if (obj.constructor && !ohasOwn.call(obj, "constructor") && !ohasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                  return false;
              }
          } catch (e) { //IE8 9会在这里抛错
              return false;
          }
          if (enumerateBUG) {
              for (key in obj) {
                  return ohasOwn.call(obj, key)
              }
          }
          for (key in obj) {
          }
          return key === void 0 || ohasOwn.call(obj, key)
      }
      if (rnative.test(Object.getPrototypeOf)) {
          avalon.isPlainObject = function (obj) {
              // 简单的 typeof obj === "object"检测，会致使用isPlainObject(window)在opera下通不过
              return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto
          }
      }
  
  //与jQuery.extend方法，可用于浅拷贝，深拷贝
      avalon.mix = avalon.fn.mix = function () {
          var options, name, src, copy, copyIsArray, clone,
              target = arguments[0] || {},
              i = 1,
              length = arguments.length,
              deep = false
  
          // 如果第一个参数为布尔,判定是否深拷贝
          if (typeof target === "boolean") {
              deep = target
              target = arguments[1] || {}
              i++
          }
  
          //确保接受方为一个复杂的数据类型
          if (typeof target !== "object" && !avalon.isFunction(target)) {
              target = {}
          }
  
          //如果只有一个参数，那么新成员添加于mix所在的对象上
          if (i === length) {
              target = this
              i--
          }
  
          for (; i < length; i++) {
              //只处理非空参数
              if ((options = arguments[i]) != null) {
                  for (name in options) {
                      src = target[name]
                      try {
                          copy = options[name] //当options为VBS对象时报错
                      } catch (e) {
                          continue
                      }
  
                      // 防止环引用
                      if (target === copy) {
                          continue
                      }
                      if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
  
                          if (copyIsArray) {
                              copyIsArray = false
                              clone = src && Array.isArray(src) ? src : []
  
                          } else {
                              clone = src && avalon.isPlainObject(src) ? src : {}
                          }
  
                          target[name] = avalon.mix(deep, clone, copy)
                      } else if (copy !== void 0) {
                          target[name] = copy
                      }
                  }
              }
          }
          return target
      }
  
      function _number(a, len) { //用于模拟slice, splice的效果
          a = Math.floor(a) || 0
          return a < 0 ? Math.max(len + a, 0) : Math.min(a, len);
      }
      avalon.mix({
          rword: rword,
          subscribers: subscribers,
          version: 1.6,
          ui: {},
          log: log,
          slice: W3C ? function (nodes, start, end) {
              return aslice.call(nodes, start, end)
          } : function (nodes, start, end) {
              var ret = []
              var len = nodes.length
              if (end === void 0)
                  end = len
              if (typeof end === "number" && isFinite(end)) {
                  start = _number(start, len)
                  end = _number(end, len)
                  for (var i = start; i < end; ++i) {
                      ret[i - start] = nodes[i]
                  }
              }
              return ret
          },
          noop: noop,
          /*如果不用Error对象封装一下，str在控制台下可能会乱码*/
          error: function (str, e) {
              throw (e || Error)(str)
          },
          /*将一个以空格或逗号隔开的字符串或数组,转换成一个键值都为1的对象*/
          oneObject: oneObject,
          /* avalon.range(10)
           => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
           avalon.range(1, 11)
           => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
           avalon.range(0, 30, 5)
           => [0, 5, 10, 15, 20, 25]
           avalon.range(0, -10, -1)
           => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
           avalon.range(0)
           => []*/
          range: function (start, end, step) { // 用于生成整数数组
              step || (step = 1)
              if (end == null) {
                  end = start || 0
                  start = 0
              }
              var index = -1,
                  length = Math.max(0, Math.ceil((end - start) / step)),
                  result = new Array(length)
              while (++index < length) {
                  result[index] = start
                  start += step
              }
              return result
          },
          eventHooks: {},
  
          /*读写删除元素节点的样式*/
          css: function (node, name, value) {
              if (node instanceof avalon) {
                  node = node[0]
              }
              var prop = /[_-]/.test(name) ? camelize(name) : name,
                  fn
              name = avalon.cssName(prop) || prop
              if (value === void 0 || typeof value === "boolean") { //获取样式
                  fn = cssHooks[prop + ":get"] || cssHooks["@:get"]
                  if (name === "background") {
                      name = "backgroundColor"
                  }
                  var val = fn(node, name)
                  return value === true ? parseFloat(val) || 0 : val
              } else if (value === "") { //请除样式
                  node.style[name] = ""
              } else { //设置样式
                  if (value == null || value !== value) {
                      return
                  }
                  if (isFinite(value) && !avalon.cssNumber[prop]) {
                      value += "px"
                  }
                  fn = cssHooks[prop + ":set"] || cssHooks["@:set"]
                  fn(node, name, value)
              }
          },
          /*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
          each: function (obj, fn) {
              if (obj) { //排除null, undefined
                  var i = 0
                  if (isArrayLike(obj)) {
                      for (var n = obj.length; i < n; i++) {
                          if (fn(i, obj[i]) === false)
                              break
                      }
                  } else {
                      for (i in obj) {
                          if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                              break
                          }
                      }
                  }
              }
          },
          //收集元素的data-{{prefix}}-*属性，并转换为对象
          getWidgetData: noop,
          Array: {
              /*只有当前数组不存在此元素时只添加它*/
              ensure: function (target, item) {
                  if (target.indexOf(item) === -1) {
                      return target.push(item)
                  }
              },
              /*移除数组中指定位置的元素，返回布尔表示成功与否*/
              removeAt: function (target, index) {
                  return !!target.splice(index, 1).length
              },
              /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
              remove: function (target, item) {
                  var index = target.indexOf(item)
                  if (~index)
                      return avalon.Array.removeAt(target, index)
                  return false
              }
          }
      })
  
      function pushArray(target, other) {
          target.push.apply(target, other)
      }
      var bindingHandlers = avalon.bindingHandlers = {}
      var bindingExecutors = avalon.bindingExecutors = {}
      avalon.components = {}
      var directives = avalon.directives = {}
      avalon.directive = function (name, obj) {
          bindingHandlers[name] = obj.init = (obj.init || noop)
          bindingExecutors[name] = obj.update = (obj.update || noop)
  
          return directives[name] = obj
      }
      /*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
      function isArrayLike(obj) {
          if (!obj)
              return false
          var n = obj.length
          if (n === (n >>> 0)) { //检测length属性是否为非负整数
              var type = serialize.call(obj).slice(8, -1)
              if (/(?:regexp|string|function|window|global)$/i.test(type))
                  return false
              if (type === "Array")
                  return true
              try {
                  if ({}.propertyIsEnumerable.call(obj, "length") === false) { //如果是原生对象
                      return /^\s?function/.test(obj.item || obj.callee)
                  }
                  return true
              } catch (e) { //IE的NodeList直接抛错
                  return !obj.window //IE6-8 window
              }
          }
          return false
      }
  
  
  // https://github.com/rsms/js-lru
      var Cache = new function() {// jshint ignore:line
          function LRU(maxLength) {
              this.size = 0
              this.limit = maxLength
              this.head = this.tail = void 0
              this._keymap = {}
          }
  
          var p = LRU.prototype
  
          p.put = function(key, value) {
              var entry = {
                  key: key,
                  value: value
              }
              this._keymap[key] = entry
              if (this.tail) {
                  this.tail.newer = entry
                  entry.older = this.tail
              } else {
                  this.head = entry
              }
              this.tail = entry
              if (this.size === this.limit) {
                  this.shift()
              } else {
                  this.size++
              }
              return value
          }
  
          p.shift = function() {
              var entry = this.head
              if (entry) {
                  this.head = this.head.newer
                  this.head.older =
                      entry.newer =
                          entry.older =
                              this._keymap[entry.key] = void 0
                  delete this._keymap[entry.key] //#1029
              }
          }
          p.get = function(key) {
              var entry = this._keymap[key]
              if (entry === void 0)
                  return
              if (entry === this.tail) {
                  return  entry.value
              }
              // HEAD--------------TAIL
              //   <.older   .newer>
              //  <--- add direction --
              //   A  B  C  <D>  E
              if (entry.newer) {
                  if (entry === this.head) {
                      this.head = entry.newer
                  }
                  entry.newer.older = entry.older // C <-- E.
              }
              if (entry.older) {
                  entry.older.newer = entry.newer // C. --> E
              }
              entry.newer = void 0 // D --x
              entry.older = this.tail // D. --> E
              if (this.tail) {
                  this.tail.newer = entry // E. <-- D
              }
              this.tail = entry
              return entry.value
          }
          return LRU
      }// jshint ignore:line
  
      /*********************************************************************
       *                         javascript 底层补丁                        *
       **********************************************************************/
  
      if (!"司徒正美".trim) {
          var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
          String.prototype.trim = function () {
              return this.replace(rtrim, "")
          }
      }
      var hasDontEnumBug = !({
              'toString': null
          }).propertyIsEnumerable('toString'),
          hasProtoEnumBug = (function () {
          }).propertyIsEnumerable('prototype'),
          dontEnums = [
              "toString",
              "toLocaleString",
              "valueOf",
              "hasOwnProperty",
              "isPrototypeOf",
              "propertyIsEnumerable",
              "constructor"
          ],
          dontEnumsLength = dontEnums.length;
      if (!Object.keys) {
          Object.keys = function (object) { //ecma262v5 15.2.3.14
              var theKeys = []
              var skipProto = hasProtoEnumBug && typeof object === "function"
              if (typeof object === "string" || (object && object.callee)) {
                  for (var i = 0; i < object.length; ++i) {
                      theKeys.push(String(i))
                  }
              } else {
                  for (var name in object) {
                      if (!(skipProto && name === "prototype") && ohasOwn.call(object, name)) {
                          theKeys.push(String(name))
                      }
                  }
              }
  
              if (hasDontEnumBug) {
                  var ctor = object.constructor,
                      skipConstructor = ctor && ctor.prototype === object
                  for (var j = 0; j < dontEnumsLength; j++) {
                      var dontEnum = dontEnums[j]
                      if (!(skipConstructor && dontEnum === "constructor") && ohasOwn.call(object, dontEnum)) {
                          theKeys.push(dontEnum)
                      }
                  }
              }
              return theKeys
          }
      }
      if (!Array.isArray) {
          Array.isArray = function (a) {
              return serialize.call(a) === "[object Array]"
          }
      }
  
      if (!noop.bind) {
          Function.prototype.bind = function (scope) {
              if (arguments.length < 2 && scope === void 0)
                  return this
              var fn = this,
                  argv = arguments
              return function () {
                  var args = [],
                      i
                  for (i = 1; i < argv.length; i++)
                      args.push(argv[i])
                  for (i = 0; i < arguments.length; i++)
                      args.push(arguments[i])
                  return fn.apply(scope, args)
              }
          }
      }
  
      function iterator(vars, body, ret) {
          var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret
          /* jshint ignore:start */
          return Function("fn,scope", fun)
          /* jshint ignore:end */
      }
      if (!rnative.test([].map)) {
          avalon.mix(ap, {
              //定位操作，返回数组中第一个等于给定参数的元素的索引值。
              indexOf: function (item, index) {
                  var n = this.length,
                      i = ~~index
                  if (i < 0)
                      i += n
                  for (; i < n; i++)
                      if (this[i] === item)
                          return i
                  return -1
              },
              //定位操作，同上，不过是从后遍历。
              lastIndexOf: function (item, index) {
                  var n = this.length,
                      i = index == null ? n - 1 : index
                  if (i < 0)
                      i = Math.max(0, n + i)
                  for (; i >= 0; i--)
                      if (this[i] === item)
                          return i
                  return -1
              },
              //迭代操作，将数组的元素挨个儿传入一个函数中执行。Prototype.js的对应名字为each。
              forEach: iterator("", '_', ""),
              //迭代类 在数组中的每个项上运行一个函数，如果此函数的值为真，则此元素作为新数组的元素收集起来，并返回新数组
              filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
              //收集操作，将数组的元素挨个儿传入一个函数中执行，然后把它们的返回值组成一个新数组返回。Prototype.js的对应名字为collect。
              map: iterator('r=[],', 'r[i]=_', 'return r'),
              //只要数组中有一个元素满足条件（放进给定函数返回true），那么它就返回true。Prototype.js的对应名字为any。
              some: iterator("", 'if(_)return true', 'return false'),
              //只有数组中的元素都满足条件（放进给定函数返回true），它才返回true。Prototype.js的对应名字为all。
              every: iterator("", 'if(!_)return false', 'return true')
          })
      }
  
      /*********************************************************************
       *                           DOM 底层补丁                             *
       **********************************************************************/
  
      function fixContains(root, el) {
          try { //IE6-8,游离于DOM树外的文本节点，访问parentNode有时会抛错
              while ((el = el.parentNode))
                  if (el === root)
                      return true
              return false
          } catch (e) {
              return false
          }
      }
      avalon.contains = fixContains
  //IE6-11的文档对象没有contains
      if (!DOC.contains) {
          DOC.contains = function (b) {
              return fixContains(DOC, b)
          }
      }
  
      function outerHTML() {
          return new XMLSerializer().serializeToString(this)
      }
  
      if (window.SVGElement) {
          //safari5+是把contains方法放在Element.prototype上而不是Node.prototype
          if (!DOC.createTextNode("x").contains) {
              Node.prototype.contains = function (arg) {//IE6-8没有Node对象
                  return !!(this.compareDocumentPosition(arg) & 16)
              }
          }
          var svgns = "http://www.w3.org/2000/svg"
          var svg = DOC.createElementNS(svgns, "svg")
          svg.innerHTML = '<circle cx="50" cy="50" r="40" fill="red" />'
          if (!rsvg.test(svg.firstChild)) { // #409
              function enumerateNode(node, targetNode) {// jshint ignore:line
                  if (node && node.childNodes) {
                      var nodes = node.childNodes
                      for (var i = 0, el; el = nodes[i++]; ) {
                          if (el.tagName) {
                              var svg = DOC.createElementNS(svgns,
                                  el.tagName.toLowerCase())
                              ap.forEach.call(el.attributes, function (attr) {
                                  svg.setAttribute(attr.name, attr.value) //复制属性
                              })// jshint ignore:line
                              // 递归处理子节点
                              enumerateNode(el, svg)
                              targetNode.appendChild(svg)
                          }
                      }
                  }
              }
              Object.defineProperties(SVGElement.prototype, {
                  "outerHTML": {//IE9-11,firefox不支持SVG元素的innerHTML,outerHTML属性
                      enumerable: true,
                      configurable: true,
                      get: outerHTML,
                      set: function (html) {
                          var tagName = this.tagName.toLowerCase(),
                              par = this.parentNode,
                              frag = avalon.parseHTML(html)
                          // 操作的svg，直接插入
                          if (tagName === "svg") {
                              par.insertBefore(frag, this)
                              // svg节点的子节点类似
                          } else {
                              var newFrag = DOC.createDocumentFragment()
                              enumerateNode(frag, newFrag)
                              par.insertBefore(newFrag, this)
                          }
                          par.removeChild(this)
                      }
                  },
                  "innerHTML": {
                      enumerable: true,
                      configurable: true,
                      get: function () {
                          var s = this.outerHTML
                          var ropen = new RegExp("<" + this.nodeName + '\\b(?:(["\'])[^"]*?(\\1)|[^>])*>', "i")
                          var rclose = new RegExp("<\/" + this.nodeName + ">$", "i")
                          return s.replace(ropen, "").replace(rclose, "")
                      },
                      set: function (html) {
                          if (avalon.clearHTML) {
                              avalon.clearHTML(this)
                              var frag = avalon.parseHTML(html)
                              enumerateNode(frag, this)
                          }
                      }
                  }
              })
          }
      }
      if (!root.outerHTML && window.HTMLElement) { //firefox 到11时才有outerHTML
          HTMLElement.prototype.__defineGetter__("outerHTML", outerHTML);
      }
  
  
  //============================= event binding =======================
      var rmouseEvent = /^(?:mouse|contextmenu|drag)|click/
      function fixEvent(event) {
          var ret = {}
          for (var i in event) {
              ret[i] = event[i]
          }
          var target = ret.target = event.srcElement
          if (event.type.indexOf("key") === 0) {
              ret.which = event.charCode != null ? event.charCode : event.keyCode
          } else if (rmouseEvent.test(event.type)) {
              var doc = target.ownerDocument || DOC
              var box = doc.compatMode === "BackCompat" ? doc.body : doc.documentElement
              ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0)
              ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0)
              ret.wheelDeltaY = ret.wheelDelta
              ret.wheelDeltaX = 0
          }
          ret.timeStamp = new Date() - 0
          ret.originalEvent = event
          ret.preventDefault = function () { //阻止默认行为
              event.returnValue = false
          }
          ret.stopPropagation = function () { //阻止事件在DOM树中的传播
              event.cancelBubble = true
          }
          return ret
      }
  
      var eventHooks = avalon.eventHooks
  //针对firefox, chrome修正mouseenter, mouseleave
      if (!("onmouseenter" in root)) {
          avalon.each({
              mouseenter: "mouseover",
              mouseleave: "mouseout"
          }, function (origType, fixType) {
              eventHooks[origType] = {
                  type: fixType,
                  fix: function (elem, fn) {
                      return function (e) {
                          var t = e.relatedTarget
                          if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
                              delete e.type
                              e.type = origType
                              return fn.apply(elem, arguments)
                          }
                      }
                  }
              }
          })
      }
  //针对IE9+, w3c修正animationend
      avalon.each({
          AnimationEvent: "animationend",
          WebKitAnimationEvent: "webkitAnimationEnd"
      }, function (construct, fixType) {
          if (window[construct] && !eventHooks.animationend) {
              eventHooks.animationend = {
                  type: fixType
              }
          }
      })
  //针对IE6-8修正input
      if (!("oninput" in DOC.createElement("input"))) {
          eventHooks.input = {
              type: "propertychange",
              fix: function (elem, fn) {
                  return function (e) {
                      if (e.propertyName === "value") {
                          e.type = "input"
                          return fn.apply(elem, arguments)
                      }
                  }
              }
          }
      }
      if (DOC.onmousewheel === void 0) {
          /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
           firefox DOMMouseScroll detail 下3 上-3
           firefox wheel detlaY 下3 上-3
           IE9-11 wheel deltaY 下40 上-40
           chrome wheel deltaY 下100 上-100 */
          var fixWheelType = DOC.onwheel !== void 0 ? "wheel" : "DOMMouseScroll"
          var fixWheelDelta = fixWheelType === "wheel" ? "deltaY" : "detail"
          eventHooks.mousewheel = {
              type: fixWheelType,
              fix: function (elem, fn) {
                  return function (e) {
                      e.wheelDeltaY = e.wheelDelta = e[fixWheelDelta] > 0 ? -120 : 120
                      e.wheelDeltaX = 0
                      if (Object.defineProperty) {
                          Object.defineProperty(e, "type", {
                              value: "mousewheel"
                          })
                      }
                      return fn.apply(elem, arguments)
                  }
              }
          }
      }
  
  //http://www.feiesoft.com/html/events.html
  //http://segmentfault.com/q/1010000000687977/a-1020000000688757
      var canBubbleUp = {
          click: true,
          dblclick: true,
          keydown: true,
          keypress: true,
          keyup: true,
          mousedown: true,
          mousemove: true,
          mouseup: true,
          mouseover: true,
          mouseout: true,
          wheel: true,
          mousewheel: true,
          input: true,
          change: true,
          beforeinput: true,
          compositionstart: true,
          compositionupdate: true,
          compositionend: true,
          select: true,
          cut: true,
          paste:true,
          focusin: true,
          focusout: true,
          DOMFocusIn: true,
          DOMFocusOut: true,
          DOMActivate: true,
          dragend:true,
          datasetchanged:true
      }
      if (!W3C) {
          delete canBubbleUp.change
          delete canBubbleUp.select
      }
  
      avalon.__eventPool__ = {}
      avalon.__eventVM__ = {}
  
      /*绑定事件*/
      avalon.bind = function (elem, type, fn) {
          if (elem.nodeType === 1) {
              var list = elem.getAttribute("avalon-events") || ""
              var uuid = getUid(fn)
              avalon.__eventPool__[uuid] = fn
              var key = type + ":" + uuid + "??"
              var hook = avalon.eventHooks[type]
              if (hook) {
                  type = hook.type
                  if (hook.fix) {
                      fn = hook.fix(elem, fn)
                      fn.uuid = uuid + "0"
                      avalon.__eventPool__[fn.uuid] = fn
                  }
                  key = "_" + type + ":" + fn.uuid + "??"
              }
              if (list.indexOf(type) === -1) {//同一种事件只绑定一次
                  if (canBubbleUp[type] && elem !== root) {
                      delegateEvent(type)
                  } else {
                      nativeBind(elem, type, dispatch)
                  }
              }
              if (list.indexOf(key) === -1) {
                  list += key //将令牌放进avalon-events属性中
              }
              elem.setAttribute("avalon-events", list)
          } else {
              nativeBind(elem, type, fn)
          }
          return fn //兼容之前的版本
      }
  
      avalon.unbind = function (elem, type, fn) {
          if (elem.nodeType === 1) {
              var list = elem.getAttribute("avalon-events") || ""
              var removeAll = arguments.length === 1
              var newList = []
              list.split("??").forEach(function (str) {
                  var arr = str.split(":")
                  var curType = arr[0]
                  var uuid = arr[1]
                  var keep = false
                  if (removeAll) {
                      nativeUnBind(elem, type, dispatch)
                  } else if (type) {
                      if (curType === type) {
                          if (fn) {
                              keep = uuid !== fn.uuid
                          } else {
                              nativeUnBind(elem, type, dispatch)
                          }
                      } else {
                          keep = true
                      }
                  }
                  if (keep) {
                      newList.push(str + "??")
                  } else {
                      if (uuid.length > 10) {
                          delete avalon.__eventPool__[uuid]
                      }
                  }
              })
              elem.setAttribute("avalon-events", newList.join(""))
          } else {
              nativeUnBind(elem, type, fn)
          }
      }
  
  
      var last = +new Date()
      function dispatch(event) {
          event = event.target ? event : fixEvent(event)
          var type = event.type
          var elem = event.target
          var list = elem.getAttribute("avalon-events") || ""
          list.split("??").forEach(function (str) {
              var arr = str.split(":")
              var curType = arr[0].replace("_", "")
              var uuid = arr[1]
              //var hooks[type]
              if (curType === type) {
                  var fn = avalon.__eventPool__[uuid]
                  if (fn) {
                      var vm = avalon.__eventVM__[curType + ":" + uuid + "??"]
                      if (vm && vm.$active === false) {
                          return avalon.unbind(elem, type, fn)
                      }
                      if (/move|scroll/.test(curType)) {
                          var curr = +new Date()
                          if (curr - last > 16) {
                              fn.call(elem, event, vm)
                              last = curr
                          }
                      } else {
                          fn.call(elem, event, vm)
                      }
                  }
              }
          })
      }
  
  
      var nativeBind = W3C ? function (el, type, fn) {
          el.addEventListener(type, fn)
      } : function (el, type, fn) {
          el.attachEvent("on" + type, fn)
      }
      var nativeUnBind = W3C ? function (el, type, fn) {
          el.removeEventListener(type, fn)
      } : function (el, type, fn) {
          el.detachEvent("on" + type, fn)
      }
      function delegateEvent(eventName) {
          var list = root.getAttribute("avalon-events") || ""
          if (list.indexOf(eventName + ":") === -1) {
              list += (eventName + ":1984??")
              avalon.bind(root, eventName, dispatch)
              root.setAttribute("avalon-events", list)
          }
      }
  
  
      /*********************************************************************
       *                           配置系统                                 *
       **********************************************************************/
  
      function kernel(settings) {
          for (var p in settings) {
              if (!ohasOwn.call(settings, p))
                  continue
              var val = settings[p]
              if (typeof kernel.plugins[p] === "function") {
                  kernel.plugins[p](val)
              } else if (typeof kernel[p] === "object") {
                  avalon.mix(kernel[p], val)
              } else {
                  kernel[p] = val
              }
          }
          return this
      }
      avalon.config = kernel
  
      var openTag, closeTag, rexpr, rexprg, rbind, rescape = /[-.*+?^${}()|[\]\/\\]/g
  
      function escapeRegExp(target) {
          //http://stevenlevithan.com/regex/xregexp/
          //将字符串安全格式化为正则表达式的源码
          return (target + "").replace(rescape, "\\$&")
      }
  
      var plugins = {
          interpolate: function (array) {
              openTag = array[0]
              closeTag = array[1]
              if (openTag === closeTag) {
                  throw new SyntaxError("openTag!==closeTag")
                  var test = openTag + "test" + closeTag
                  cinerator.innerHTML = test
                  if (cinerator.innerHTML !== test && cinerator.innerHTML.indexOf("&lt;") > -1) {
                      throw new SyntaxError("此定界符不合法")
                  }
                  cinerator.innerHTML = ""
              }
              kernel.openTag = openTag
              kernel.closeTag = closeTag
              var o = escapeRegExp(openTag),
                  c = escapeRegExp(closeTag)
              rexpr = new RegExp(o + "([\\ss\\S]*)" + c)
              rexprg = new RegExp(o + "([\\ss\\S]*)" + c, "g")
              rbind = new RegExp(o + "[\\ss\\S]*" + c + "|\\sms-")
          }
      }
      kernel.plugins = plugins
      kernel.plugins['interpolate'](["{{", "}}"])
  
      kernel.async =true
      kernel.debug = true
      kernel.paths = {}
      kernel.shim = {}
      kernel.maxRepeatSize = 100
  
  //avalon最核心的方法的两个方法之一（另一个是avalon.scan），返回一个ViewModel(VM)
      avalon.vmodels = {} //所有vmodel都储存在这里
      var vtree = {}
      var dtree = {}
      avalon.vtree = vtree
  
      var defineProperty = Object.defineProperty
      var canHideOwn = true
  //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
  //标准浏览器使用__defineGetter__, __defineSetter__实现
      try {
          defineProperty({}, "_", {
              value: "x"
          })
          var defineProperties = Object.defineProperties
      } catch (e) {
          canHideOwn = false
      }
  
      avalon.define = function (definition) {
          var $id = definition.$id
          if (!$id) {
              log("warning: vm必须指定$id")
          }
          var vmodel = observeObject(definition, {
              __: "avalon.define"
          }, {
              top: true
          })
  
          avalon.vmodels[$id] = vmodel
          vmodel.$id = $id
  
          return vmodel
      }
  
  //observeArray及observeObject的包装函数
      function observe(definition, old, heirloom, options) {
          //如果数组转换为监控数组
          if (Array.isArray(definition)) {
              return observeArray(definition, old, heirloom, options)
          } else if (avalon.isPlainObject(definition)) {
              //如果此属性原来就是一个VM,拆分里面的访问器属性
              if (Object(old) === old) {
                  var vm = reuseVmodel(old, definition, heirloom)
                  for (var i in definition) {
                      vm[i] = definition[i]
                  }
                  return vm
              } else {
                  //否则新建一个VM
                  return observeObject(definition, heirloom, options)
              }
          } else {
              return definition
          }
      }
  
      function Component() {
      }
  
      /*
       将一个对象转换为一个VM
       它拥有如下私有属性
       $id: vm.id
       $events: 放置$watch回调与绑定对象
       $watch: 增强版$watch
       $fire: 触发$watch回调
       $active:boolean,false时防止依赖收集
       $model:返回一个纯净的JS对象
       $accessors:avalon.js独有的对象
       =============================
       $skipArray:用于指定不可监听的属性,但VM生成是没有此属性的
  
       $$skipArray与$skipArray都不能监控,
       不同点是
       $$skipArray被hasOwnProperty后返回false
       $skipArray被hasOwnProperty后返回true
       */
  
  
  
      var $$skipArray = oneObject("$id,$watch,$fire,$events,$model," +
          "$skipArray,$active,$accessors")
  
  
      function observeObject(definition, heirloom, options) {
          options = options || {}
          heirloom = heirloom || {}
  
          var $skipArray = {}
          if (definition.$skipArray) {//收集所有不可监听属性
              $skipArray = oneObject(definition.$skipArray)
              delete definition.$skipArray
          }
          var $computed = getComputed(definition) // 收集所有计算属性
          var $pathname = options.pathname || ""
          var $vmodel = new Component() //要返回的对象, 它在IE6-8下可能被偷龙转凤
          var $accessors = {} //用于储放所有访问器属性的定义
          var keys = {}, key, path
  
          for (key in definition) {
              if ($$skipArray[key])
                  continue
              var val = keys[key] = definition[key]
              if (!isSkip(key, val, $skipArray)) {
                  path = $pathname ? $pathname + "." + key : key
                  $accessors[key] = makeObservable(path, heirloom)
              }
          }
  
          for (key in $computed) {
              keys[key] = definition[key]
              path = $pathname ? $pathname + "." + key : key
              $accessors[key] = makeComputed(path, heirloom, key, $computed[key])
          }
  
          $accessors.$model = $modelDescriptor
  
          $vmodel = defineProperties($vmodel, $accessors, definition)
  
          for (key in keys) {
              //对普通监控属性或访问器属性进行赋值 
              if (!(key in $computed)) {
                  $vmodel[key] = keys[key]
              }
              //删除系统属性
              if (key in $skipArray) {
                  delete keys[key]
              } else {
                  keys[key] = true
              }
          }
  
          function hasOwnKey(key) {
              return keys[key] === true
          }
  
          hideProperty($vmodel, "$id", generateID("$"))
          hideProperty($vmodel, "$accessors", $accessors)
          hideProperty($vmodel, "hasOwnProperty", hasOwnKey)
          if (options.top === true) {
              makeFire($vmodel, heirloom)
          }
  
          for (key in $computed) {
              val = $vmodel[key]
          }
  
          hideProperty($vmodel, "$active", true)
          return $vmodel
      }
  
      function makeFire($vmodel, heirloom) {
  
          hideProperty($vmodel, "$events", {})
          hideProperty($vmodel, "$watch", function (expr, fn) {
              if (expr && fn) {
                  return $watch.call($vmodel, expr, fn)
              } else {
                  throw "$watch方法参数不对"
              }
          })
          hideProperty($vmodel, "$fire", function (expr, a, b) {
              if (expr.indexOf("all!") === 0) {
                  var p = expr.slice(4)
                  for (var i in avalon.vmodels) {
                      var v = avalon.vmodels[i]
                      v.$fire && v.$fire(p, a, b)
                  }
              } else {
                  if (heirloom.vm) {
                      $emit(heirloom.vm, $vmodel, expr, a, b)
                  }
              }
          })
          heirloom.vm = heirloom.vm || $vmodel
      }
  
      function isComputed(val) {//speed up!
          if (val && typeof val === "object") {
              for (var i in val) {
                  if (i !== "get" && i !== "set") {
                      return false
                  }
              }
              return  typeof val.get === "function"
          }
      }
  
      function getComputed(obj) {
          if (obj.$computed) {
              delete obj.$computed
              return obj.$computed
          }
          var $computed = {}
          for (var i in obj) {
              if (isComputed(obj[i])) {
                  $computed[i] = obj[i]
                  delete obj[i]
              }
          }
          return $computed
      }
  
  
  
      function makeComputed(pathname, heirloom, key, value) {
          var old = NaN, _this = {}
          return {
              get: function () {
                  if (!this.configurable) {
                      _this = this
                  }
                  return old = value.get.call(_this)
              },
              set: function (x) {
                  if (typeof value.set === "function") {
                      if (!this.configurable) {
                          _this = this
                      }
                      var older = old
                      value.set.call(_this, x)
                      var newer = _this[key]
                      if (_this.$active && (newer !== older)) {
                          $emit(heirloom.vm, _this, pathname, newer, older)
                          batchUpdateEntity(heirloom.vm)
                      }
                  }
              },
              enumerable: true,
              configurable: true
          }
      }
  
      function isSkip(key, value, skipArray) {
          return key.charAt(0) === "$" ||
              skipArray[key] ||
              (typeof value === "function") ||
              (value && value.nodeName && value.nodeType > 0)
      }
  
  
      function makeObservable(pathname, heirloom) {
          var old = NaN, _this = {}
          return {
              get: function () {
                  if (!this.configurable) {
                      _this = this // 保存当前子VM的引用
                  }
                  if (_this.$active) {
                      //以后再处理  collectDependency(pathname, heirloom)
                  }
                  return old
              },
              set: function (val) {
                  if (old === val)
                      return
                  if (val && typeof val === "object") {
  
                      val = observe(val, old, heirloom, {
                          pathname: pathname
                      })
                  }
                  if (!this.configurable) {
                      _this = this // 保存当前子VM的引用
                  }
                  var older = old
                  old = val
  
                  if (_this.$active) {
                      $emit(heirloom.vm, _this, pathname, val, older)
                      batchUpdateEntity(heirloom.vm)
                  }
  
              },
              enumerable: true,
              configurable: true
          }
      }
      function SubComponent() {
      }
  //循环利用before的访问器属性,创建新的VM
      function reuseVmodel(before, after, heirloom, pathname) {
          var resue = before.$accessors || {}
          var $accessors = {}
          var keys = {}, key, path
          for (key in after) {
              if ($$skipArray[key])
                  continue
              keys[key] = before[key]
              if (!isSkip(key, after[key], {})) {
                  if (resue[key]) {
                      $accessors[key] = resue[key]
                  } else {
                      path = pathname ? pathname + "." + key : key
                      $accessors[key] = makeObservable(path, heirloom)
                  }
              }
          }
  
          var $vmodel = new SubComponent()
          $vmodel = defineProperties($vmodel, $accessors, keys)
  
          for (key in keys) {
              if (!$accessors[key]) {//添加不可监控的属性
                  $vmodel[key] = keys[key]
              }
              keys[key] = true
          }
  
          function hasOwnKey(key) {
              return keys[key] === true
          }
  
          hideProperty($vmodel, "$accessors", $accessors)
          hideProperty($vmodel, "hasOwnProperty", hasOwnKey)
          hideProperty($vmodel, "$active", true)
          return $vmodel
      }
  
      function createProxy(before, after, heirloom) {
          var b = before.$accessors || {}
          var a = after.$accessors || {}
          var $accessors = {}
          var keys = {}, key
          //收集所有键值对及访问器属性
          for (key in before) {
              keys[key] = before[key]
              if (b[key]) {
                  $accessors[key] = b[key]
              }
          }
          for (key in after) {
              keys[key] = after[key]
              if (a[key]) {
                  $accessors[key] = a[key]
              }
          }
          var $vmodel = new Component()
          $vmodel = defineProperties($vmodel, $accessors, keys)
  
          for (key in keys) {
              if (!$accessors[key]) {//添加不可监控的属性
                  $vmodel[key] = keys[key]
              }
              if (key in $$skipArray) {
                  delete keys[key]
              } else {
                  keys[key] = true
              }
          }
  
          function hasOwnKey(key) {
              return keys[key] === true
          }
  
          hideProperty($vmodel, "$accessors", $accessors)
          hideProperty($vmodel, "hasOwnProperty", hasOwnKey)
          hideProperty($vmodel, "$id", before.$id + "??" +
              String(after.$id).slice(0, 4))
  
          makeFire($vmodel, heirloom || {})
          hideProperty($vmodel, "$active", true)
          return $vmodel
      }
  
      avalon.test.makeObservable = makeObservable
      avalon.test.createProxy = createProxy
  
  
      function toJson(val) {
          var xtype = avalon.type(val)
          if (xtype === "array") {
              var array = []
              for (var i = 0; i < val.length; i++) {
                  array[i] = toJson(val[i])
              }
              return array
          } else if (xtype === "object") {
              var obj = {}
              for (i in val) {
                  if (i === "__proxy__" || i === "__data__" || i === "__const__")
                      continue
                  if (val.hasOwnProperty(i)) {
                      var value = val[i]
                      obj[i] = value && value.nodeType ? value : toJson(value)
                  }
              }
              return obj
          }
          return val
      }
  
      var $modelDescriptor = {
          get: function () {
              return toJson(this)
          },
          set: noop,
          enumerable: false,
          configurable: true
      }
  
      function hideProperty(host, name, value) {
          if (canHideOwn) {
              Object.defineProperty(host, name, {
                  value: value,
                  writable: true,
                  enumerable: false,
                  configurable: true
              })
          } else {
              host[name] = value
          }
      }
  
  //===================修复浏览器对Object.defineProperties的支持=================
      if (!canHideOwn) {
          if ("__defineGetter__" in avalon) {
              defineProperty = function (obj, prop, desc) {
                  if ('value' in desc) {
                      obj[prop] = desc.value
                  }
                  if ("get" in desc) {
                      obj.__defineGetter__(prop, desc.get)
                  }
                  if ('set' in desc) {
                      obj.__defineSetter__(prop, desc.set)
                  }
                  return obj
              }
              defineProperties = function (obj, descs) {
                  for (var prop in descs) {
                      if (descs.hasOwnProperty(prop)) {
                          defineProperty(obj, prop, descs[prop])
                      }
                  }
                  return obj
              }
          }
          if (IEVersion) {
              var VBClassPool = {}
              window.execScript([// jshint ignore:line
                  "Function parseVB(code)",
                  "\tExecuteGlobal(code)",
                  "End Function" //转换一段文本为VB代码
              ].join("\n"), "VBScript")
              function VBMediator(instance, accessors, name, value) {// jshint ignore:line
                  var accessor = accessors[name]
                  if (arguments.length === 4) {
                      accessor.set.call(instance, value)
                  } else {
                      return accessor.get.call(instance)
                  }
              }
              defineProperties = function (name, accessors, properties) {
                  // jshint ignore:line
                  var buffer = []
                  buffer.push(
                      "\r\n\tPrivate [__data__], [__proxy__]",
                      "\tPublic Default Function [__const__](d" + expose + ", p" + expose + ")",
                      "\t\tSet [__data__] = d" + expose + ": set [__proxy__] = p" + expose,
                      "\t\tSet [__const__] = Me", //链式调用
                      "\tEnd Function")
                  //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
                  var uniq = {}
  
                  //添加访问器属性 
                  for (name in accessors) {
                      uniq[name] = true
                      buffer.push(
                          //由于不知对方会传入什么,因此set, let都用上
                          "\tPublic Property Let [" + name + "](val" + expose + ")", //setter
                          "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                          "\tEnd Property",
                          "\tPublic Property Set [" + name + "](val" + expose + ")", //setter
                          "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                          "\tEnd Property",
                          "\tPublic Property Get [" + name + "]", //getter
                          "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                          "\t\tSet[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                          "\tIf Err.Number <> 0 Then",
                          "\t\t[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                          "\tEnd If",
                          "\tOn Error Goto 0",
                          "\tEnd Property")
  
                  }
                  for (name in properties) {
                      if (uniq[name] !== true) {
                          uniq[name] = true
                          buffer.push("\tPublic [" + name + "]")
                      }
                  }
                  for (name in $$skipArray) {
                      if (uniq[name] !== true) {
                          uniq[name] = true
                          buffer.push("\tPublic [" + name + "]")
                      }
                  }
                  buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
                  buffer.push("End Class")
                  var body = buffer.join("\r\n")
                  var className = VBClassPool[body]
                  if (!className) {
                      className = generateID("VBClass")
                      window.parseVB("Class " + className + body)
                      window.parseVB([
                          "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                          "\tDim o",
                          "\tSet o = (New " + className + ")(a, b)",
                          "\tSet " + className + "Factory = o",
                          "End Function"
                      ].join("\r\n"))
                      VBClassPool[body] = className
                  }
                  var ret = window[className + "Factory"](accessors, VBMediator) //得到其产品
                  return ret //得到其产品
              }
          }
      }
  
      function $watch(expr, funOrObj) {
          var hive = this.$events || (this.$events = {})
          var list = hive[expr] || (hive[expr] = [])
          var vm = this
          var data = typeof funOrObj === "function" ? {
              update: funOrObj,
              element: {},
              shouldDispose:function(){
                  return vm.$active === false
              },
              uuid: getUid(funOrObj)
          } : funOrObj
          funOrObj.shouldDispose = funOrObj.shouldDispose || shouldDispose
          if (avalon.Array.ensure(list, data)) {
              injectDisposeQueue(data, list)
          }
          return function () {
              avalon.Array.remove(list, data)
          }
      }
      function shouldDispose() {
          var el = this.element
          return !el || el.disposed
      }
  
      function $emit(topVm, curVm, path, a, b, i) {
  
          var hive = topVm && topVm.$events
  
          if (hive && hive[path]) {
              var list = hive[path]
              try {
                  for (i = i || list.length - 1; i >= 0; i--) {
                      var data = list[i]
                      if (!data.element || data.element.disposed) {
                          list.splice(i, 1)
                      } else if (data.update) {
                          data.update.call(curVm, a, b, path)
                      }
                  }
              } catch (e) {
                  if (i - 1 > 0)
                      $emit(topVm, curVm, path, a, b, i - 1)
                  avalon.log(e, path)
              }
          }
          if (new Date() - beginTime > 444) {
              setTimeout(function () {
                  rejectDisposeQueue()
              })
  
          }
      }
  
      var canUpdateEntity = true
      function batchUpdateEntity(vm) {
          if (vm && canUpdateEntity) {
              var id = vm.$id
              var vnode = vtree[id]//虚拟DOM
              if (!vnode)
                  return
              var dom = dtree[id]//虚拟DOM
              if (dom) {
                  if (!root.contains(dom))
                      return
              } else {
                  for (var i = 0, node, all = document.getElementsByTagName("*");
                       node = all[i++]; ) {
                      if (node.getAttribute("data-controller") === id ||
                          node.getAttribute("data-important") === id) {
                          dom = dtree[id] = node
                          break
                      }
                  }
              }
              if (dom) {
                  canUpdateEntity = false
                  setTimeout(function () {
                      updateEntity([dom], [vnode])
                      canUpdateEntity = true
                  })
              }
          }
      }
  
      /*********************************************************************
       *          监控数组（与ms-each, ms-repeat配合使用）                     *
       **********************************************************************/
      function observeArray(array, old, heirloom, options) {
          if (old && old.splice) {
              var args = [0, old.length].concat(array)
              old.splice.apply(old, args)
              return old
          } else {
              for (var i in newProto) {
                  array[i] = newProto[i]
              }
              hideProperty(array, "$id", generateID("$"))
              array.notify = function () {
                  $emit(heirloom.vm, heirloom.vm, options.pathname)
                  batchUpdateEntity(heirloom.vm)
              }
  
              array._ = sizeCache.shift() || observeObject({
                      length: NaN
                  }, {}, {
                      pathname: "",
                      top: true//这里不能使用watch, 因为firefox中对象拥有watch属性
                  })
  
              array._.length = array.length
              array._.$watch("length", {
                  shouldDispose: function () {
                      if (!heirloom || !heirloom.vm ||
                          heirloom.vm.$active === false) {
                          return true
                      }
                      if (!containsArray(heirloom.vm, array)) {
                          array.length = 0
                          array._.length = NaN
                          if (sizeCache.push(array._) < 64) {
                              sizeCache.shift()
                          }
                          delete array._
                          return true
                      }
                      return false
                  },
                  element: {},
                  update: function (newlen, oldlen) {
                      if (heirloom.vm) {
                          heirloom.vm.$fire(options.pathname + ".length", newlen, oldlen)
                      }
                  }
              })
  
              if (W3C) {
                  hideProperty(array, "$model", $modelDescriptor)
              } else {
                  array.$model = toJson(array)
              }
              var arrayOptions = {
                  pathname: "", //options.pathname + ".*",
                  top: true
              }
              for (var j = 0, n = array.length; j < n; j++) {
                  array[j] = observeItem(array[j], {}, arrayOptions)
              }
  
              return array
          }
      }
      var sizeCache = []
  
      function containsArray(vm, array) {
          for (var i in vm) {
              if (vm.hasOwnProperty(i)) {
                  if (vm[i] === array) {
                      return true
                  } else if (vm[i] && vm[i].$id) {
                      if (containsArray(vm[i], array)) {
                          return true
                      }
                  }
              }
          }
          return false
      }
  
      function observeItem(item, a, b) {
          if (item && typeof item === "object") {
              return observe(item, a, b)
          } else {
              return item
          }
      }
  
      var arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice']
      var arrayProto = Array.prototype
      var newProto = {
          set: function (index, val) {
              if (((index >>> 0) === index) && this[index] !== val) {
                  if (index > this.length) {
                      throw Error(index + "set方法的第一个参数不能大于原数组长度")
                  }
                  this.splice(index, 1, val)
              }
          },
          contains: function (el) { //判定是否包含
              return this.indexOf(el) !== -1
          },
          ensure: function (el) {
              if (!this.contains(el)) { //只有不存在才push
                  this.push(el)
              }
              return this
          },
          pushArray: function (arr) {
              return this.push.apply(this, arr)
          },
          remove: function (el) { //移除第一个等于给定值的元素
              return this.removeAt(this.indexOf(el))
          },
          removeAt: function (index) { //移除指定索引上的元素
              if ((index >>> 0) === index) {
                  return this.splice(index, 1)
              }
              return []
          },
          size: function () { //取得数组长度，这个函数可以同步视图，length不能
              return this._.length
          },
          removeAll: function (all) { //移除N个元素
              if (Array.isArray(all)) {
                  for (var i = this.length - 1; i >= 0; i--) {
                      if (all.indexOf(this[i]) !== -1) {
                          _splice.call(this, i, 1)
                      }
                  }
              } else if (typeof all === "function") {
                  for (i = this.length - 1; i >= 0; i--) {
                      var el = this[i]
                      if (all(el, i)) {
                          _splice.call(this, i, 1)
                      }
                  }
              } else {
                  _splice.call(this, 0, this.length)
  
              }
              if (!W3C) {
                  this.$model = toJson(this)
              }
              this.notify()
              this._.length = this.length
          },
          clear: function () {
              this.removeAll()
              return this
          }
      }
  
      var _splice = arrayProto.splice
  
      arrayMethods.forEach(function (method) {
          var original = arrayProto[method]
          newProto[method] = function () {
              // 继续尝试劫持数组元素的属性
              var args = []
              for (var i = 0, n = arguments.length; i < n; i++) {
                  args[i] = observeItem(arguments[i])
              }
              var result = original.apply(this, args)
              if (!W3C) {
                  this.$model = toJson(this)
              }
              this.notify()
              this._.length = this.length
              return result
          }
      })
  
      "sort,reverse".replace(rword, function (method) {
          newProto[method] = function () {
              arrayProto[method].apply(this, arguments)
              if (!W3C) {
                  this.$model = toJson(this)
              }
              this.notify()
              return this
          }
      })
  
      /*********************************************************************
       *                           依赖调度系统                              *
       **********************************************************************/
  
  //检测两个对象间的依赖关系
      var dependencyDetection = (function () {
          var outerFrames = []
          var currentFrame
          return {
              begin: function (binding) {
                  //accessorObject为一个拥有callback的对象
                  outerFrames.push(currentFrame)
                  currentFrame = binding
              },
              end: function () {
                  currentFrame = outerFrames.pop()
              },
              collectDependency: function (array) {
                  if (currentFrame) {
                      //被dependencyDetection.begin调用
                      currentFrame.callback(array)
                  }
              }
          };
      })()
  
  //将绑定对象注入到其依赖项的订阅数组中
      var roneval = /^on$/
  
  //将依赖项(比它高层的访问器或构建视图刷新函数的绑定对象)注入到订阅者数组
      function injectDependency(list, binding) {
          if (binding.oneTime)
              return
          if (list && avalon.Array.ensure(list, binding) && binding.element) {
              injectDisposeQueue(binding, list)
              if (new Date() - beginTime > 444) {
                  rejectDisposeQueue()
              }
          }
      }
  
      /*********************************************************************
       *                          定时GC回收机制                             *
       **********************************************************************/
  
      var disposeQueue = avalon.$$subscribers = []
      var beginTime = new Date()
      var oldInfo = {}
  
  
  //添加到回收列队中
      function injectDisposeQueue(data, list) {
          var lists = data.lists || (data.lists = [])
          var uuid = getUid(data)
          avalon.Array.ensure(lists, list)
          if (!disposeQueue[uuid]) {
              disposeQueue[uuid] = "__"
              disposeQueue.push(data)
          }
      }
  
      function rejectDisposeQueue(data) {
          var i = disposeQueue.length
          var n = i
          var allTypes = []
          var iffishTypes = {}
          var newInfo = {}
          //对页面上所有绑定对象进行分门别类, 只检测个数发生变化的类型
          while (data = disposeQueue[--i]) {
              var type = data.type
              if (newInfo[type]) {
                  newInfo[type]++
              } else {
                  newInfo[type] = 1
                  allTypes.push(type)
              }
          }
          var diff = false
          allTypes.forEach(function (type) {
              if (oldInfo[type] !== newInfo[type]) {
                  iffishTypes[type] = 1
                  diff = true
              }
          })
          i = n
          if (diff) {
              while (data = disposeQueue[--i]) {
                  if (data.element === null) {
                      disposeQueue.splice(i, 1)
                      continue
                  }
                  if (iffishTypes[data.type] && data.shouldDispose()) { //如果它没有在DOM树
                      disposeQueue.splice(i, 1)
                      delete disposeQueue[data.uuid]
                      var lists = data.lists
                      if (lists) {
                          for (var k = 0, list; list = lists[k++]; ) {
                              avalon.Array.remove(lists, list)
                              avalon.Array.remove(list, data)
                          }
                      }
                      disposeData(data)
                  }
              }
          }
          oldInfo = newInfo
          beginTime = new Date()
      }
  
      function disposeData(data) {
          delete disposeQueue[data.uuid] // 先清除，不然无法回收了
          data.element.dispose && data.element.dispose()
          data.element = null
          for (var key in data) {
              data[key] = null
          }
      }
  
  
      /************************************************************************
       *              HTML处理(parseHTML, innerHTML, clearHTML)                *
       *************************************************************************/
  
  // We have to close these tags to support XHTML
      var tagHooks = {
          area: [1, "<map>", "</map>"],
          param: [1, "<object>", "</object>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          legend: [1, "<fieldset>", "</fieldset>"],
          option: [1, "<select multiple='multiple'>", "</select>"],
          thead: [1, "<table>", "</table>"],
          tr: [2, "<table>", "</table>"],
          td: [3, "<table><tr>", "</tr></table>"],
          g: [1, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">', '</svg>'],
          //IE6-8在用innerHTML生成节点时，不能直接创建no-scope元素与HTML5的新标签
          _default: W3C ? [0, "", ""] : [1, "X<div>", "</div>"] //div可以不用闭合
      }
      tagHooks.th = tagHooks.td
      tagHooks.optgroup = tagHooks.option
      tagHooks.tbody = tagHooks.tfoot = tagHooks.colgroup = tagHooks.caption = tagHooks.thead
      String("circle,defs,ellipse,image,line,path,polygon,polyline,rect,symbol,text,use").replace(rword, function (tag) {
          tagHooks[tag] = tagHooks.g //处理SVG
      })
  
      var rtagName = /<([\w:]+)/ //取得其tagName
      var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
      var rcreate = W3C ? /[^\d\D]/ : /(<(?:script|link|style|meta|noscript))/ig
      var scriptTypes = oneObject(["", "text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript"])
      var rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/ //需要处理套嵌关系的标签
      var script = DOC.createElement("script")
      var rhtml = /<|&#?\w+;/
  
      avalon.parseHTML = function (html) {
          var fragment = avalonFragment.cloneNode(false)
          if (typeof html !== "string") {
              return fragment
          }
          if (!rhtml.test(html)) {
              fragment.appendChild(DOC.createTextNode(html))
              return fragment
          }
          html = html.replace(rxhtml, "<$1></$2>").trim()
          var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase(),
          //取得其标签名
              wrap = tagHooks[tag] || tagHooks._default,
              wrapper = cinerator,
              firstChild, neo
          if (!W3C) { //fix IE
              html = html.replace(rcreate, "<br class=msNoScope>$1") //在link style script等标签之前添加一个补丁
          }
          wrapper.innerHTML = wrap[1] + html + wrap[2]
          var els = wrapper.getElementsByTagName("script")
          if (els.length) { //使用innerHTML生成的script节点不会发出请求与执行text属性
              for (var i = 0, el; el = els[i++];) {
                  if (scriptTypes[el.type]) {
                      //以偷龙转凤方式恢复执行脚本功能
                      neo = script.cloneNode(false) //FF不能省略参数
                      ap.forEach.call(el.attributes, function (attr) {
                          if (attr && attr.specified) {
                              neo[attr.name] = attr.value //复制其属性
                              neo.setAttribute(attr.name, attr.value)
                          }
                      }) // jshint ignore:line
                      neo.text = el.text
                      el.parentNode.replaceChild(neo, el) //替换节点
                  }
              }
          }
          if (!W3C) { //fix IE
              var target = wrap[1] === "X<div>" ? wrapper.lastChild.firstChild : wrapper.lastChild
              if (target && target.tagName === "TABLE" && tag !== "tbody") {
                  //IE6-7处理 <thead> --> <thead>,<tbody>
                  //<tfoot> --> <tfoot>,<tbody>
                  //<table> --> <table><tbody></table>
                  for (els = target.childNodes, i = 0; el = els[i++];) {
                      if (el.tagName === "TBODY" && !el.innerHTML) {
                          target.removeChild(el)
                          break
                      }
                  }
              }
              els = wrapper.getElementsByTagName("br")
              var n = els.length
              while (el = els[--n]) {
                  if (el.className === "msNoScope") {
                      el.parentNode.removeChild(el)
                  }
              }
              for (els = wrapper.all, i = 0; el = els[i++];) { //fix VML
                  if (isVML(el)) {
                      fixVML(el)
                  }
              }
          }
          //移除我们为了符合套嵌关系而添加的标签
          for (i = wrap[0]; i--; wrapper = wrapper.lastChild) {}
          while (firstChild = wrapper.firstChild) { // 将wrapper上的节点转移到文档碎片上！
              fragment.appendChild(firstChild)
          }
          return fragment
      }
  
      function isVML(src) {
          var nodeName = src.nodeName
          return nodeName.toLowerCase() === nodeName && src.scopeName && src.outerText === ""
      }
  
      function fixVML(node) {
          if (node.currentStyle.behavior !== "url(#default#VML)") {
              node.style.behavior = "url(#default#VML)"
              node.style.display = "inline-block"
              node.style.zoom = 1 //hasLayout
          }
      }
  
      avalon.innerHTML = function (node, html) {
          if (!W3C && (!rcreate.test(html) && !rnest.test(html))) {
              try {
                  node.innerHTML = html
                  return
              } catch (e) {}
          }
          var a = this.parseHTML(html)
          this.clearHTML(node).appendChild(a)
      }
  
      avalon.clearHTML = function (node) {
          node.textContent = ""
          while (node.firstChild) {
              node.removeChild(node.firstChild)
          }
          return node
      }
  
      var bools = ["autofocus,autoplay,async,allowTransparency,checked,controls",
          "declare,disabled,defer,defaultChecked,defaultSelected",
          "contentEditable,isMap,loop,multiple,noHref,noResize,noShade",
          "open,readOnly,selected"
      ].join(",")
  
      var boolMap = {}
      bools.replace(rword, function (name) {
          boolMap[name.toLowerCase()] = name
      })
  
      var propMap = {//不规则的属性名映射
          "accept-charset": "acceptCharset",
          "char": "ch",
          "charoff": "chOff",
          "class": "className",
          "for": "htmlFor",
          "http-equiv": "httpEquiv"
      }
  
      var anomaly = ["accessKey,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan",
          "dateTime,defaultValue,frameBorder,longDesc,maxLength,marginWidth,marginHeight",
          "rowSpan,tabIndex,useMap,vSpace,valueType,vAlign"
      ].join(",")
      anomaly.replace(rword, function (name) {
          propMap[name.toLowerCase()] = name
      })
  
      function attrUpdate(node, vnode) {
          var attrs = vnode.changeAttrs
          if (!node || node.nodeType !== 1 || vnode.disposed) {
              return
          }
          if (attrs) {
              for (var attrName in attrs) {
                  var val = attrs[attrName]
                  // switch
                  if (attrName === "href" || attrName === "src") {
                      if (!root.hasAttribute) {
                          val = String(val).replace(/&amp;/g, "&") //处理IE67自动转义的问题
                      }
                      node[attrName] = val
                      if (window.chrome && node.tagName === "EMBED") {
                          var parent = node.parentNode //#525  chrome1-37下embed标签动态设置src不能发生请求
                          var comment = document.createComment("ms-src")
                          parent.replaceChild(comment, node)
                          parent.replaceChild(node, comment)
                      }
                  } else if (attrName.indexOf("data-") === 0) {
                      node.setAttribute(attrName, val)
  
                  } else {
                      var bool = boolMap[attrName]
                      if (typeof node[bool] === "boolean") {
                          node[bool] = !!val
                          //布尔属性必须使用el.xxx = true|false方式设值
                          //如果为false, IE全系列下相当于setAttribute(xxx,''),
                          //会影响到样式,需要进一步处理
                      }
                      if (!W3C && propMap[attrName]) { //旧式IE下需要进行名字映射
                          attrName = propMap[attrName]
                      }
                      if (val === false) {
                          node.removeAttribute(attrName)
                          continue
                      }
                      //SVG只能使用setAttribute(xxx, yyy), VML只能使用node.xxx = yyy ,
                      //HTML的固有属性必须node.xxx = yyy
                      var isInnate = rsvg.test(node) ? false :
                          (DOC.namespaces && isVML(node)) ? true :
                          attrName in node.cloneNode(false)
                      if (isInnate) {
                          node[attrName] = val + ""
                      } else {
                          node.setAttribute(attrName, val)
                      }
  
                  }
  
              }
              delete vnode.changeAttrs
          }
      }
  
  //=============================css相关=======================
      var cssHooks = avalon.cssHooks = {}
      var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"]
      var cssMap = {
          "float": W3C ? "cssFloat" : "styleFloat"
      }
      avalon.cssNumber = oneObject("animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom")
  
      avalon.cssName = function (name, host, camelCase) {
          if (cssMap[name]) {
              return cssMap[name]
          }
          host = host || root.style
          for (var i = 0, n = prefixes.length; i < n; i++) {
              camelCase = camelize(prefixes[i] + name)
              if (camelCase in host) {
                  return (cssMap[name] = camelCase)
              }
          }
          return null
      }
  
      cssHooks["@:set"] = function (node, name, value) {
          try {
              //node.style.width = NaN;node.style.width = "xxxxxxx";
              //node.style.width = undefine 在旧式IE下会抛异常
              node.style[name] = value
          } catch (e) {
          }
      }
  
      if (window.getComputedStyle) {
          cssHooks["@:get"] = function (node, name) {
              if (!node || !node.style) {
                  throw new Error("getComputedStyle要求传入一个节点 " + node)
              }
              var ret, styles = getComputedStyle(node, null)
              if (styles) {
                  ret = name === "filter" ? styles.getPropertyValue(name) : styles[name]
                  if (ret === "") {
                      ret = node.style[name] //其他浏览器需要我们手动取内联样式
                  }
              }
              return ret
          }
          cssHooks["opacity:get"] = function (node) {
              var ret = cssHooks["@:get"](node, "opacity")
              return ret === "" ? "1" : ret
          }
      } else {
          var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i
          var rposition = /^(top|right|bottom|left)$/
          var ralpha = /alpha\([^)]*\)/i
          var ie8 = !!window.XDomainRequest
          var salpha = "DXImageTransform.Microsoft.Alpha"
          var border = {
              thin: ie8 ? '1px' : '2px',
              medium: ie8 ? '3px' : '4px',
              thick: ie8 ? '5px' : '6px'
          }
          cssHooks["@:get"] = function (node, name) {
              //取得精确值，不过它有可能是带em,pc,mm,pt,%等单位
              var currentStyle = node.currentStyle
              var ret = currentStyle[name]
              if ((rnumnonpx.test(ret) && !rposition.test(ret))) {
                  //①，保存原有的style.left, runtimeStyle.left,
                  var style = node.style,
                      left = style.left,
                      rsLeft = node.runtimeStyle.left
                  //②由于③处的style.left = xxx会影响到currentStyle.left，
                  //因此把它currentStyle.left放到runtimeStyle.left，
                  //runtimeStyle.left拥有最高优先级，不会style.left影响
                  node.runtimeStyle.left = currentStyle.left
                  //③将精确值赋给到style.left，然后通过IE的另一个私有属性 style.pixelLeft
                  //得到单位为px的结果；fontSize的分支见http://bugs.jquery.com/ticket/760
                  style.left = name === 'fontSize' ? '1em' : (ret || 0)
                  ret = style.pixelLeft + "px"
                  //④还原 style.left，runtimeStyle.left
                  style.left = left
                  node.runtimeStyle.left = rsLeft
              }
              if (ret === "medium") {
                  name = name.replace("Width", "Style")
                  //border width 默认值为medium，即使其为0"
                  if (currentStyle[name] === "none") {
                      ret = "0px"
                  }
              }
              return ret === "" ? "auto" : border[ret] || ret
          }
          cssHooks["opacity:set"] = function (node, name, value) {
              var style = node.style
              var opacity = isFinite(value) && value <= 1 ? "alpha(opacity=" + value * 100 + ")" : ""
              var filter = style.filter || "";
              style.zoom = 1
              //不能使用以下方式设置透明度
              //node.filters.alpha.opacity = value * 100
              style.filter = (ralpha.test(filter) ?
                  filter.replace(ralpha, opacity) :
              filter + " " + opacity).trim()
              if (!style.filter) {
                  style.removeAttribute("filter")
              }
          }
          cssHooks["opacity:get"] = function (node) {
              //这是最快的获取IE透明值的方式，不需要动用正则了！
              var alpha = node.filters.alpha || node.filters[salpha],
                  op = alpha && alpha.enabled ? alpha.opacity : 100
              return (op / 100) + "" //确保返回的是字符串
          }
      }
  
      "top,left".replace(rword, function (name) {
          cssHooks[name + ":get"] = function (node) {
              var computed = cssHooks["@:get"](node, name)
              return /px$/.test(computed) ? computed :
              avalon(node).position()[name] + "px"
          }
      })
  
      var cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block"
      }
  
      var rdisplayswap = /^(none|table(?!-c[ea]).+)/
  
      function showHidden(node, array) {
          //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
          if (node.offsetWidth <= 0) { //opera.offsetWidth可能小于0
              if (rdisplayswap.test(cssHooks["@:get"](node, "display"))) {
                  var obj = {
                      node: node
                  }
                  for (var name in cssShow) {
                      obj[name] = node.style[name]
                      node.style[name] = cssShow[name]
                  }
                  array.push(obj)
              }
              var parent = node.parentNode
              if (parent && parent.nodeType === 1) {
                  showHidden(parent, array)
              }
          }
      }
      avalon.each({
          Width: "width",
          Height: "height"
      }, function (name, method) {
          var clientProp = "client" + name,
              scrollProp = "scroll" + name,
              offsetProp = "offset" + name
          cssHooks[method + ":get"] = function (node, which, override) {
              var boxSizing = -4
              if (typeof override === "number") {
                  boxSizing = override
              }
              which = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
              var ret = node[offsetProp] // border-box 0
              if (boxSizing === 2) { // margin-box 2
                  return ret + avalon.css(node, "margin" + which[0], true) + avalon.css(node, "margin" + which[1], true)
              }
              if (boxSizing < 0) { // padding-box  -2
                  ret = ret - avalon.css(node, "border" + which[0] + "Width", true) - avalon.css(node, "border" + which[1] + "Width", true)
              }
              if (boxSizing === -4) { // content-box -4
                  ret = ret - avalon.css(node, "padding" + which[0], true) - avalon.css(node, "padding" + which[1], true)
              }
              return ret
          }
          cssHooks[method + "&get"] = function (node) {
              var hidden = [];
              showHidden(node, hidden);
              var val = cssHooks[method + ":get"](node)
              for (var i = 0, obj; obj = hidden[i++]; ) {
                  node = obj.node
                  for (var n in obj) {
                      if (typeof obj[n] === "string") {
                          node.style[n] = obj[n]
                      }
                  }
              }
              return val
          }
          avalon.fn[method] = function (value) { //会忽视其display
              var node = this[0]
              if (arguments.length === 0) {
                  if (node.setTimeout) { //取得窗口尺寸
                      return node["inner" + name] ||
                          node.document.documentElement[clientProp] ||
                          node.document.body[clientProp] //IE6下前两个分别为undefined,0
                  }
                  if (node.nodeType === 9) { //取得页面尺寸
                      var doc = node.documentElement
                      //FF chrome    html.scrollHeight< body.scrollHeight
                      //IE 标准模式 : html.scrollHeight> body.scrollHeight
                      //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                      return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp])
                  }
                  return cssHooks[method + "&get"](node)
              } else {
                  return this.css(method, value)
              }
          }
          avalon.fn["inner" + name] = function () {
              return cssHooks[method + ":get"](this[0], void 0, -2)
          }
          avalon.fn["outer" + name] = function (includeMargin) {
              return cssHooks[method + ":get"](this[0], void 0, includeMargin === true ? 2 : 0)
          }
      })
  
      avalon.fn.offset = function () { //取得距离页面左右角的坐标
          var node = this[0],
              box = {
                  left: 0,
                  top: 0
              }
          if (!node || !node.tagName || !node.ownerDocument) {
              return box
          }
          var doc = node.ownerDocument,
              body = doc.body,
              root = doc.documentElement,
              win = doc.defaultView || doc.parentWindow
          if (!avalon.contains(root, node)) {
              return box
          }
          //http://hkom.blog1.fc2.com/?mode=m&no=750 body的偏移量是不包含margin的
          //我们可以通过getBoundingClientRect来获得元素相对于client的rect.
          //http://msdn.microsoft.com/en-us/library/ms536433.aspx
          if (node.getBoundingClientRect) {
              box = node.getBoundingClientRect() // BlackBerry 5, iOS 3 (original iPhone)
          }
          //chrome/IE6: body.scrollTop, firefox/other: root.scrollTop
          var clientTop = root.clientTop || body.clientTop,
              clientLeft = root.clientLeft || body.clientLeft,
              scrollTop = Math.max(win.pageYOffset || 0, root.scrollTop, body.scrollTop),
              scrollLeft = Math.max(win.pageXOffset || 0, root.scrollLeft, body.scrollLeft)
          // 把滚动距离加到left,top中去。
          // IE一些版本中会自动为HTML元素加上2px的border，我们需要去掉它
          // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
          return {
              top: box.top + scrollTop - clientTop,
              left: box.left + scrollLeft - clientLeft
          }
      }
  
  //生成avalon.fn.scrollLeft, avalon.fn.scrollTop方法
      avalon.each({
          scrollLeft: "pageXOffset",
          scrollTop: "pageYOffset"
      }, function (method, prop) {
          avalon.fn[method] = function (val) {
              var node = this[0] || {},
                  win = getWindow(node),
                  top = method === "scrollTop"
              if (!arguments.length) {
                  return win ? (prop in win) ? win[prop] : root[method] : node[method]
              } else {
                  if (win) {
                      win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop())
                  } else {
                      node[method] = val
                  }
              }
          }
      })
  
      function getWindow(node) {
          return node.window && node.document ? node : node.nodeType === 9 ? node.defaultView || node.parentWindow : false;
      }
      /*********************************************************************
       *                  avalon的原型方法定义区                             *
       **********************************************************************/
  
      function hyphen(target) {
          //转换为连字符线风格
          return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
      }
  
      function camelize(target) {
          //提前判断，提高getStyle等的效率
          if (!target || target.indexOf("-") < 0 && target.indexOf("_") < 0) {
              return target
          }
          //转换为驼峰风格
          return target.replace(/[-_][^-_]/g, function (match) {
              return match.charAt(1).toUpperCase()
          })
      }
  
      var fakeClassListMethods = {
          _toString: function () {
              var node = this.node
              var cls = node.className
              var str = typeof cls === "string" ? cls : cls.baseVal
              return str.split(/\s+/).join(" ")
          },
          _contains: function (cls) {
              return (" " + this + " ").indexOf(" " + cls + " ") > -1
          },
          _add: function (cls) {
              if (!this.contains(cls)) {
                  this._set(this + " " + cls)
              }
          },
          _remove: function (cls) {
              this._set((" " + this + " ").replace(" " + cls + " ", " "))
          },
          __set: function (cls) {
              cls = cls.trim()
              var node = this.node
              if (rsvg.test(node)) {
                  //SVG元素的className是一个对象 SVGAnimatedString { baseVal="", animVal=""}，只能通过set/getAttribute操作
                  node.setAttribute("class", cls)
              } else {
                  node.className = cls
              }
          } //toggle存在版本差异，因此不使用它
      }
  
      function fakeClassList(node) {
          if (!("classList" in node)) {
              node.classList = {
                  node: node
              }
              for (var k in fakeClassListMethods) {
                  node.classList[k.slice(1)] = fakeClassListMethods[k]
              }
          }
          return node.classList
      }
  
  
      "add,remove".replace(rword, function (method) {
          avalon.fn[method + "Class"] = function (cls) {
              var el = this[0]
              //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
              if (cls && typeof cls === "string" && el && el.nodeType === 1) {
                  cls.replace(/\S+/g, function (c) {
                      fakeClassList(el)[method](c)
                  })
              }
              return this
          }
      })
      avalon.fn.mix({
          hasClass: function (cls) {
              var el = this[0] || {}
              return el.nodeType === 1 && fakeClassList(el).contains(cls)
          },
          toggleClass: function (value, stateVal) {
              var className, i = 0
              var classNames = String(value).split(/\s+/)
              var isBool = typeof stateVal === "boolean"
              while ((className = classNames[i++])) {
                  var state = isBool ? stateVal : !this.hasClass(className)
                  this[state ? "addClass" : "removeClass"](className)
              }
              return this
          },
          attr: function (name, value) {
              if (arguments.length === 2) {
                  this[0].setAttribute(name, value)
                  return this
              } else {
                  return this[0].getAttribute(name)
              }
          },
          data: function (name, value) {
              name = "data-" + hyphen(name || "")
              switch (arguments.length) {
                  case 2:
                      this.attr(name, value)
                      return this
                  case 1:
                      var val = this.attr(name)
                      return parseData(val)
                  case 0:
                      var ret = {}
                      ap.forEach.call(this[0].attributes, function (attr) {
                          if (attr) {
                              name = attr.name
                              if (!name.indexOf("data-")) {
                                  name = camelize(name.slice(5))
                                  ret[name] = parseData(attr.value)
                              }
                          }
                      })
                      return ret
              }
          },
          removeData: function (name) {
              name = "data-" + hyphen(name)
              this[0].removeAttribute(name)
              return this
          },
          css: function (name, value) {
              if (avalon.isPlainObject(name)) {
                  for (var i in name) {
                      avalon.css(this, i, name[i])
                  }
              } else {
                  var ret = avalon.css(this, name, value)
              }
              return ret !== void 0 ? ret : this
          },
          position: function () {
              var offsetParent, offset,
                  elem = this[0],
                  parentOffset = {
                      top: 0,
                      left: 0
                  }
              if (!elem) {
                  return
              }
              if (this.css("position") === "fixed") {
                  offset = elem.getBoundingClientRect()
              } else {
                  offsetParent = this.offsetParent() //得到真正的offsetParent
                  offset = this.offset() // 得到正确的offsetParent
                  if (offsetParent[0].tagName !== "HTML") {
                      parentOffset = offsetParent.offset()
                  }
                  parentOffset.top += avalon.css(offsetParent[0], "borderTopWidth", true)
                  parentOffset.left += avalon.css(offsetParent[0], "borderLeftWidth", true)
  
                  // Subtract offsetParent scroll positions
                  parentOffset.top -= offsetParent.scrollTop()
                  parentOffset.left -= offsetParent.scrollLeft()
              }
              return {
                  top: offset.top - parentOffset.top - avalon.css(elem, "marginTop", true),
                  left: offset.left - parentOffset.left - avalon.css(elem, "marginLeft", true)
              }
          },
          offsetParent: function () {
              var offsetParent = this[0].offsetParent
              while (offsetParent && avalon.css(offsetParent, "position") === "static") {
                  offsetParent = offsetParent.offsetParent;
              }
              return avalon(offsetParent || root)
          },
          bind: function (type, fn, phase) {
              if (this[0]) { //此方法不会链
                  return avalon.bind(this[0], type, fn, phase)
              }
          },
          unbind: function (type, fn, phase) {
              if (this[0]) {
                  avalon.unbind(this[0], type, fn, phase)
              }
              return this
          },
          val: function (value) {
              var node = this[0]
              if (node && node.nodeType === 1) {
                  var get = arguments.length === 0
                  var access = get ? ":get" : ":set"
                  var fn = valHooks[getValType(node) + access]
                  if (fn) {
                      var val = fn(node, value)
                  } else if (get) {
                      return (node.value || "").replace(/\r/g, "")
                  } else {
                      node.value = value
                  }
              }
              return get ? val : this
          }
      })
  
      function parseData(data) {
          try {
              if (typeof data === "object")
                  return data
              data = data === "true" ? true :
                  data === "false" ? false :
                      data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? avalon.parseJSON(data) : data
          } catch (e) {}
          return data
      }
      var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
          rvalidchars = /^[\],:{}\s]*$/,
          rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
          rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
          rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g
      avalon.parseJSON = window.JSON ? JSON.parse : function (data) {
          if (typeof data === "string") {
              data = data.trim();
              if (data) {
                  if (rvalidchars.test(data.replace(rvalidescape, "@")
                          .replace(rvalidtokens, "]")
                          .replace(rvalidbraces, ""))) {
                      return (new Function("return " + data))() // jshint ignore:line
                  }
              }
              avalon.error("Invalid JSON: " + data)
          }
          return data
      }
  
      avalon.fireDom = function (elem, type, opts) {
          if (DOC.createEvent) {
              var hackEvent = DOC.createEvent("Events");
              hackEvent.initEvent(type, true, true, opts)
              avalon.mix(hackEvent, opts)
  
              elem.dispatchEvent(hackEvent)
          } else if (root.contains(elem)) {//IE6-8触发事件必须保证在DOM树中,否则报"SCRIPT16389: 未指明的错误"
              hackEvent = DOC.createEventObject()
              avalon.mix(hackEvent, opts)
              elem.fireEvent("on" + type, hackEvent)
          }
      }
  
  
  //==================================val相关============================
  
  
      function getValType(elem) {
          var ret = elem.tagName.toLowerCase()
          return ret === "input" && /checkbox|radio/.test(elem.type) ? "checked" : ret
      }
      var roption = /^<option(?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s+value[\s=]/i
      var valHooks = {
          "option:get": IEVersion ? function (node) {
              //在IE11及W3C，如果没有指定value，那么node.value默认为node.text（存在trim作），但IE9-10则是取innerHTML(没trim操作)
              //specified并不可靠，因此通过分析outerHTML判定用户有没有显示定义value
              return roption.test(node.outerHTML) ? node.value : node.text.trim()
          } : function (node) {
              return node.value
          },
          "select:get": function (node, value) {
              var option, options = node.options,
                  index = node.selectedIndex,
                  getter = valHooks["option:get"],
                  one = node.type === "select-one" || index < 0,
                  values = one ? null : [],
                  max = one ? index + 1 : options.length,
                  i = index < 0 ? max : one ? index : 0
              for (; i < max; i++) {
                  option = options[i]
                  //旧式IE在reset后不会改变selected，需要改用i === index判定
                  //我们过滤所有disabled的option元素，但在safari5下，如果设置select为disable，那么其所有孩子都disable
                  //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
                  if ((option.selected || i === index) && !option.disabled) {
                      value = getter(option)
                      if (one) {
                          return value
                      }
                      //收集所有selected值组成数组返回
                      values.push(value)
                  }
              }
              return values
          },
          "select:set": function (node, values, optionSet) {
              values = [].concat(values) //强制转换为数组
              var getter = valHooks["option:get"]
              for (var i = 0, el; el = node.options[i++]; ) {
                  if ((el.selected = values.indexOf(getter(el)) > -1)) {
                      optionSet = true
                  }
              }
              if (!optionSet) {
                  node.selectedIndex = -1
              }
          }
      }
  
  
  
  
      var rregexp = /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/g
      var rstring = /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/g
      var rmethod = /\b\d+(\.\w+\s*\()/g
      var keywords = [
          "break,case,catch,continue,debugger,default,delete,do,else,false",
          "finally,for,function,if,in,instanceof,new,null,return,switch,this",
          "throw,true,try,typeof,var,void,while,with", /* 关键字*/
          "abstract,boolean,byte,char,class,const,double,enum,export,extends",
          "final,float,goto,implements,import,int,interface,long,native",
          "package,private,protected,public,short,static,super,synchronized",
          "throws,transient,volatile", /*保留字*/
          "arguments,let,yield,undefined" /* ECMA 5 - use strict*/].join(",")
      var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
      var rpaths = /[$_a-z]\w*(\.[$_a-z]\w*)*/g
      var rfilter = /^[$_a-z]\w*/
  //当属性发生变化时, 执行update
      var rfill = /\?\?\d+/g
      var brackets = /\(([^)]*)\)/
      function K(a) {
          return a
      }
  
      var pathPool = new Cache(256)
  //缓存求值函数，以便多次利用
      var evaluatorPool = new Cache(512)
  
  
      avalon.mix({
          __read__: function () {
              var fn = avalon.filter[name]
              if (fn) {
                  return fn.get ? fn.get : fn
              }
              return K
          },
          __write__: function () {
              var fn = avalon.filter[name]
              return fn && fn.set || K
          }
      })
  
      function parseExpr(expr, vmodel, binding) {
          //目标生成一个函数
          binding = binding || {}
          var category = (binding.type.match(/on|duplex/) || ["other"])[0]
          var input = expr.trim()
          var fn = evaluatorPool.get(category + ":" + input)
          binding.paths = pathPool.get(category + ":" + input)
          var canReturn = false
          if (typeof fn === "function") {
              binding.getter = fn
              canReturn = true
          }
          if (category === "duplex") {
              fn = evaluatorPool.get(category + ":" + input + ":setter")
              if (typeof fn === "function") {
                  binding.setter = fn
              }
          }
          if (canReturn)
              return
          var number = 1
          //相同的表达式生成相同的函数
          var maps = {}
          function dig(a) {
              var key = "??" + number++
              maps[key] = a
              return key
          }
          function dig2(a, b) {
              var key = "??" + number++
              maps[key] = b
              return key
          }
          function fill(a) {
              return maps[a]
          }
  
          input = input.replace(rregexp, dig).//移除所有正则
              replace(rstring, dig).//移除所有字符串
              replace(rmethod, dig2).//移除所有正则或字符串方法
              replace(/\|\|/g, dig).//移除所有短路与
              replace(/\$event/g, dig).//去掉事件对象
              replace(/\s*(\.|\1)\s*/g, "$1").//移除. |两端空白
              split(/\|(?=\w)/) //分离过滤器
          var paths = {}
          //处理表达式的本体
          var body = input.shift().
              replace(rkeywords, dig).
              replace(rpaths, function (a) {
                  paths[a] = true //抽取所有要$watch的东西
                  return a
              })
          //处理表达式的过滤器部分
          var footers = input.map(function (str) {
              return str.replace(/\w+/, dig).//去掉过滤名
                  replace(rkeywords, dig).//去掉关键字
                  replace(rpaths, function (a) {
                      paths[a] = true //抽取所有要$watch的东西
                      return a
                  })
          }).map(function (str) {
              str = str.replace(rfill, fill) //还原
              var hasBracket = false
              str = str.replace(brackets, function (a, b) {
                  hasBracket = true
                  return /\S/.test(b) ?
                  "(__value__," + b + ");\n" :
                      "(__value__);\n"
              })
              if (!hasBracket) {
                  str += "(__value__);\n"
              }
              str = str.replace(/(\w+)/, "avalon.__read__('$1')")
              return "__value__ = " + str
          })
  
          var headers = []
          var unique = {}
          var pathArray = []
          for (var i in paths) {
              pathArray.push(i)
              if (!unique[i]) {
                  var key = i.split(".").shift()
                  unique[key] = true
                  headers.push("var " + key + " =  __vm__." + key + ";\n")
              }
          }
          binding.paths = pathPool.put(category + ":" + input,
              pathArray.join("★"))
          body = body.replace(rfill, fill).trim()
          var args = ["__vm__"]
          if (category === "on") {
              args = ["$event", "__vm__"]
              // args.push("$event")
              if (body.indexOf("(") === -1) {//如果不存在括号
                  body += ".call(this, $event)"
              } else {
                  body = body.replace(brackets, function (a, b) {
                      var array = b.split(/\s*,\s*/).filter(function (e) {
                          return /\S/.test(e)
                      })
                      array.unshift("this")
                      if (array.indexOf("$event") === -1) {
                          array.push("$event")
                      }
                      return  ".call(" + array + ")"
                  })
              }
          } else if (category === "duplex") {
              args.push("__value__", "__bind__")
              //Setter
              var setters = footers.map(function (str) {
                  str = str.replace("__read__", "__write__")
                  return str.replace(");", ",__bind__);")
              })
              //Getter
              footers = footers.map(function (str) {
                  return str.replace(");", ",__bind__);")
              })
              fn = new Function(args.join(","),
                  setters.join("") +
                  "__vm__." + body + " = __value__;")
              binding.setter = evaluatorPool.put(category +
                  ":" + input + ":setter", fn)
              // avalon.log(binding.setter + "***")
          }
          headers.push("var __value__ = " + body + ";\n")
          headers.push.apply(headers, footers)
          headers.push("return __value__;")
          fn = new Function(args.join(","), headers.join(""))
          if (category === "on") {
              var old = fn
              fn = function () {
                  return old
              }
          }
          binding.getter = evaluatorPool.put(category + ":" + input, fn)
          //avalon.log(binding.getter + "")
      }
  
  
      function normalizeExpr(code) {
          var hasExpr = rexpr.test(code) //比如ms-class="width{{w}}"的情况
          if (hasExpr) {
              var array = scanExpr(code)
              if (array.length === 1) {
                  return array[0].expr
              }
              /* jshint ignore:start */
              return array.map(function (el) {
                  return el.type ? "(" + el.expr + ")" : quote(el.expr)
              }).join(" + ")
              /* jshint ignore:end */
          } else {
              return code
          }
      }
      avalon.normalizeExpr = normalizeExpr
      avalon.parseExprProxy = parseExpr
  
      /*********************************************************************
       *                          编译系统                                  *
       **********************************************************************/
  
      var meta = {
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"': '\\"',
          '\\': '\\\\'
      }
      var quote = window.JSON && JSON.stringify || function(str) {
              return '"' + str.replace(/[\\\"\x00-\x1f]/g, function(a) {
                      var c = meta[a];
                      return typeof c === 'string' ? c :
                      '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                  }) + '"'
          }
      if (!Object.is) {
  
          var SameValue = function (a, b) {
              if (a === b) {
                  // 0 === -0, but they are not identical.
                  if (a === 0) {
                      return 1 / a === 1 / b
                  }
                  return true
              }
              return numberIsNaN(a) && numberIsNaN(b)
          }
  
          var numberIsNaN = Number.isNaN || function isNaN(value) {
                  // NaN !== NaN, but they are identical.
                  // NaNs are the only non-reflexive value, i.e., if x !== x,
                  // then x is NaN.
                  // isNaN is broken: it converts its argument to number, so
                  // isNaN('foo') => true
                  return value !== value;
              }
          Object.is = SameValue
      }
  
      function VComment(text) {
          this.type = "#comment"
          this.nodeValue = text
          this.skip = true
      }
      VComment.prototype = {
          constructor: VComment,
          toDOM: function () {
              return document.createComment(this.nodeValue)
          },
          toHTML: function () {
              return "<!--" + this.nodeValue + "-->"
          }
      }
      function VComponent(type, props, children) {
          this.type = "#component"
          this.props = props || {}
          this.children = children || []
          this.__type__ = type
      }
      VComponent.prototype = {
          construct: function () {
              var me = avalon.components[this.__type__]
              if (me && me.construct) {
                  return me.construct.apply(this, arguments)
              } else {
                  return this
              }
          },
          init: function (vm) {
              var me = avalon.components[this.__type__]
              if (me && me.init) {
                  me.init(this, vm)
              }
          },
          toDOM: function () {
              var me = avalon.components[this.__type__]
              if (me && me.toDOM) {
                  return me.toDOM(this)
              }
              var fragment = document.createDocumentFragment()
              for (var i = 0; i < this.children.length; i++) {
                  fragment.appendChild(this.children[i].toDOM())
              }
              return fragment
          },
          toHTML: function () {
              var me = avalon.components[this.__type__]
              if (me && me.toHTML) {
                  return me.toHTML(this)
              }
              var ret = ""
              for (var i = 0; i < this.children.length; i++) {
                  ret += this.children[i].toHTML()
              }
              return ret
          }
      }
  
  
  
  
  
  
      function VElement(type, props, children) {
          this.type = type
          this.props = props || {}
          this.children = children || []
          this.template = "" //这里相当于innerHTML,保存最原始的模板
      }
      VElement.prototype = {
          constructor: VElement,
          toDOM: function () {
              var dom = document.createElement(this.type)
              for (var i in this.props) {
                  if (this.props[i] === false) {
                      dom.removeAttribute(i)
                  } else {
                      dom.setAttribute(i, String(this.props[i]))
                  }
              }
              if (this.skipContent) {
                  switch (this.type) {
                      case "script":
                          this.text = this.__content
                          break;
                      case "style":
                      case "template":
                          this.innerHTML = this.__content
                          break
                      case "noscript":
                          this.textContent = this.__content
                          break
                      default:
                          var a = avalon.parseHTML(this.__content)
                          dom.appendChild(a)
                          break
                  }
              } else {
                  this.children.forEach(function (c) {
                      dom.appendChild(c.toDOM())
                  })
                  if (!this.children.length) {
                      a = avalon.parseHTML(this.template)
                      dom.appendChild(a)
                  }
              }
              return dom
          },
          toHTML: function () {
              if (this.skip) {
                  return this.outerHTML
              }
              var arr = []
              for (var i in this.props) {
                  arr.push(i + "=" + quote(String(this.props[i])))
              }
              arr = arr.length ? " " + arr.join(" ") : ""
              var str = "<" + this.type + arr
              if (this.closeSelf) {
                  return str + "/>"
              }
              str += ">"
              if (this.skipContent) {
                  str += this.__content
              } else {
                  str += this.children.map(function (el) {
                      return el.toHTML()
                  }).join("")
              }
              return str + "</" + this.type + ">"
          }
      }
  
      function toString(element, skip) {
          var p = []
          for (var i in element.props) {
              if (skip && skip.test(i))
                  continue
              p.push(i + "=" + quote(String(element.props[i])))
          }
          p = p.length ? " " + p.join(" ") : ""
  
          var str = "<" + element.type + p
          if (element.selfClose) {
              return str + "/>"
          }
          str += ">"
  
          str += element.template
  
          return str + "</" + element.type + ">"
      }
  
  
  
      function VText(text) {
          this.type = "#text"
          this.nodeValue = text
          this.skip = !rexpr.test(text)
      }
  
      VText.prototype = {
          constructor: VText,
          toDOM: function () {
              return document.createTextNode(this.nodeValue)
          },
          toHTML: function () {
              return this.nodeValue
          }
      }
  // executeBindings
      function executeBindings(bindings, vmodel) {
          for (var i = 0, binding; binding = bindings[i++]; ) {
              binding.vmodel = vmodel
              var isBreak = directives[binding.type].init(binding)
              avalon.injectBinding(binding)
              if (isBreak === false)
                  break
          }
          bindings.length = 0
      }
  
      function bindingIs(a, b) {
          return a === b
      }
  
      avalon.injectBinding = function (binding) {
          parseExpr(binding.expr, binding.vmodel, binding)
          binding.paths.split("★").forEach(function (path) {
              var trim = path.trim()
              if (trim) {
                  try {
                      binding.vmodel.$watch(path, binding)
                  } catch (e) {
                      avalon.log(binding, path)
                  }
              }
          })
          delete binding.paths
          binding.update = function (a, b, path) {
  
              var hasError
              try {
                  var value = binding.getter(binding.vmodel)
              } catch (e) {
                  hasError = true
                  avalon.log(e)
              }
              var dir = directives[binding.type]
              var is = dir.is || bindingIs
  
              if (!is(value, binding.oldValue)) {
                  dir.change(value, binding)
                  if (binding.oneTime && !hasError) {
                      dir.change = noop
                      setTimeout(function () {
                          delete binding.element
                      })
                  }
                  if (dir.old) {
                      dir.old(binding, value)
                  } else {
                      binding.oldValue = value
                  }
              }
          }
          binding.update()
      }
  
  //一个指令包含以下东西
  //init(binding) 用于处理expr
  //change(val, binding) 用于更新虚拟DOM树及添加更新真实DOM树的钩子
  //update(dom, vnode)   更新真实DOM的具体操作 
  //is(newValue, oldValue)? 比较新旧值的方法
  //old(binding, oldValue)? 如何保持旧值 
  
  
  
      /*********************************************************************
       *                           扫描系统                                 *
       **********************************************************************/
  
      avalon.scan = function (elem, vmodel) {
          var text = elem.outerHTML
          if (rbind.test(text)) {
              var tree = createVirtual(text, vmodel)
              updateVirtual(tree, vmodel)
              updateEntity([elem], tree)
          }
      }
  
  
  
      var rnoCollect = /^(ms-\S+|data-\S+|on[a-z]+|id|style|class)$/
      var ronattr = /^on\-[\w-]+$/
      function getOptionsFromTag(elem, vmodels) {
          var attributes = elem.attributes
          var ret = {}
          for (var i = 0, attr; attr = attributes[i++]; ) {
              var name = attr.name
              if (attr.specified && !rnoCollect.test(name)) {
                  var camelizeName = camelize(attr.name)
                  if (/^on\-[\w-]+$/.test(name)) {
                      ret[camelizeName] = getBindingValue(elem, name, vmodels)
                  } else {
                      ret[camelizeName] = parseData(attr.value)
                  }
              }
  
          }
          return ret
      }
  
      var getBindingValue = function (elem, name, vmodel) {
          var callback = elem.props ? elem.props[name] : elem.getAttribute(name)
          if (callback) {
              if (vmodel.hasOwnProperty(callback) &&
                  typeof vmodel[callback] === "function") {
                  return vmodel[callback]
              }
          }
      }
  
  
  
      var roneTime = /^\s*::/
      var rmsAttr = /ms-(\w+)-?(.*)/
      var priorityMap = {
          "if": 10,
          "repeat": 90,
          "data": 100,
          "each": 1400,
          "with": 1500,
          "duplex": 2000,
          "on": 3000
      }
  //ms-repeat,ms-if会创建一个组件,作为原元素的父节点,没有孩子,
  //将原元素的outerHTML作为其props.template
  //ms-html,ms-text会创建一个组件,作为原元素的唯一子节点
  //优化级ms-if  >  ms-repeat  >  ms-html  >  ms-text
      var events = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit")
      var obsoleteAttrs = oneObject("value,title,alt,checked,selected,disabled,readonly,enabled")
      function bindingSorter(a, b) {
          return a.priority - b.priority
      }
  
      function scanAttrs(elem, vmodel, siblings) {
          var props = elem.props, bindings = []
          for (var i in props) {
              var value = props[i], match
              if (value && (match = i.match(rmsAttr))) {
                  var type = match[1]
                  var param = match[2] || ""
                  var name = i
                  if (events[type]) {
                      param = type
                      type = "on"
                  } else if (obsoleteAttrs[type]) {
                      param = type
                      type = "attr"
                      name = "ms-" + type + "-" + param
                      log("warning!请改用" + name + "代替" + i + "!")
                  }
                  if (directives[type]) {
                      var newValue = value.replace(roneTime, "")
                      var oneTime = value !== newValue
                      var binding = {
                          type: type,
                          param: param,
                          element: elem,
                          name: name,
                          expr: newValue,
                          oneTime: oneTime,
                          priority: (directives[type].priority || type.charCodeAt(0) * 10) + (Number(param.replace(/\D/g, "")) || 0)
                      }
                      if (/each|repeat|if|text|html/.test(type)) {
                          binding.siblings = siblings
                      }
                      bindings.push(binding)
                  }
              }
          }
          if (bindings.length && vmodel) {
              bindings.sort(bindingSorter)
              executeBindings(bindings, vmodel)
          }
          updateVirtual(elem.children, vmodel)
  
      }
  
      var rline = /\r?\n/g
      function scanExpr(str) {
          var tokens = [],
              value, start = 0,
              stop
          do {
              stop = str.indexOf(openTag, start)
              if (stop === -1) {
                  break
              }
              value = str.slice(start, stop).trim()
              if (value) { // {{ 左边的文本
                  tokens.push({
                      expr: value
                  })
              }
              start = stop + openTag.length
              stop = str.indexOf(closeTag, start)
              if (stop === -1) {
                  break
              }
              value = str.slice(start, stop)
              if (value) { //处理{{ }}插值表达式
                  tokens.push({
                      expr: value.replace(rline,""),
                      type: "{{}}"
                  })
              }
              start = stop + closeTag.length
          } while (1)
          value = str.slice(start).trim()
          if (value) { //}} 右边的文本
              tokens.push({
                  expr: value
              })
          }
          return tokens
      }
  
  
      function scanTag(elem, vmodel, siblings) {
          var props = elem.props
          //更新数据
          var v = props["data-important"]
          var vm = avalon.vmodels[v]
          if (vm) {
              vmodel = vm
              vtree[v] = elem
          } else {
              v = props["data-controller"]
              vm = avalon.vmodels[v]
              if (vm) {
                  vtree[v] = elem
                  if (vmodel) {
                      vm = avalon.createProxy(vmodel, vm)
                  }
                  vmodel = vm
              }
          }
          if (v && !vm) {
              return avalon.log("[" + v + "] vmodel has not defined yet!")
          }
  
          if (elem.type.indexOf(":") > 0 && !avalon.components[elem.type]) {
              //avalon.component(elem)
          } else {
              scanAttrs(elem, vmodel, siblings)
          }
  
          return elem
      }
  
  
      function scanText(node, vmodel) {
          var tokens = scanExpr(String(node.nodeValue))
          node.tokens = tokens
          var texts = []
          for (var i = 0, token; token = tokens[i]; i++) {
              if (token.type) {
                  /* jshint ignore:start */
                  token.expr = token.expr.replace(roneTime, function () {
                      token.oneTime = true
                      return ""
                  })
                  /* jshint ignore:end */
                  token.element = node
                  token.vmodel = vmodel
                  token.index = i
                  token.array = texts
                  avalon.injectBinding(token)
              } else {
                  texts[i] = token.expr
                  var nodeValue = texts.join("")
                  if (nodeValue !== node.nodeValue) {
                      node.nodeValue = nodeValue
                      addHooks(directives["{{}}"], {
                          element: node,
                          priority:1160
                      })
                  }
              }
          }
          return [node]
      }
  
  //添加更新真实DOM的钩子,钩子为指令的update方法,它们与绑定对象一样存在优化级
      function addData(elem, name) {
          return elem[name] || (elem[name] = {})
      }
  
      function addHook(node, hook, name, priority) {
          name = name || "change"
          var hooks = node[name] || (node[name] = [])
          if (avalon.Array.ensure(hooks, hook)) {
              if (priority) {
                  hook.priority = priority
              }
              hooks.sort(bindingSorter)
          }
      }
  
      function addHooks(dir, binding) {
          var hook = dir.update
          hook.priority = binding.priority
          addHook(binding.element, hook)
      }
  
      function addAttrHook(node) {
          addHook(node, attrUpdate)
      }
      /*
       每次domReady时都会扫描全部DOM树
       创建一个虚拟DOM树
       如果之前存在一个虚拟DOM树,
       那么它的所有节点将打上disposed标记, 在gc系统中集中销毁
  
       然后扫描虚拟DOM树,将一些特有的绑定属性转换为虚拟组件(VComponent)
       如ms-repeat, ms-html, ms-if, ms-text, ms-include 
       现在虚拟DOM树存在4种类型 VElement, VComment, VText, VComponent
       其他绑定属性将转换绑定对象
       同一个元素底下的绑定对象按优化级排序, 依次初始化, 将它们关联到VM的对应属性的订阅者数组中
  
       绑定对象初始化会添加getter,change, update方法(ms-duplex还有setter方法)
  
       当VM属性变化时, 执行对应订阅数组的所有绑定对象的change方法,更新虚拟DOM树的某些属性或结构
       并且框架在执行这订阅数组前,将canUpdateEntity置为false, 用于批量更新真实DOM树,
       只有当更新完才将canUpdateEntity置为true
  
       批量更新真实DOM树的步骤如下:
       从上到下, 一个个真实DOM节点与虚拟DOM节点进行比较
       在上面的change方法会为虚拟DOM节点添加了一个change的钩子函数数组,
       里面拥有各种更新DOM的策略,这些钩子的优先级也排好了
       如果这个虚拟DOM没有change数组会直接跳过
       如果这个虚拟DOM打上skip或skipContent,也会跳过
       否则先判定其类型是否 VElement或VComponent,继续更新其孩子
  
       当此子树更新完了,就会更新它的下一个兄弟,是一个深序优先遍历算法
  
       此更新策略有如下特点
       从上到下更新, 如果上级节点要被删掉,即真实DOM没有对应的虚拟DOM, 那么
       下方的change数组会直接跳过
  
       用户对同一个属性进行操作, 会在change方法中被合并
  
       订阅数组中的绑定对象的移除,之前是通过判定element是否在DOM树上,不断调用contains方法
       性能很差, 现在这个element为虚拟DOM, 它是否移除看disposed属性
  
       ms-repeat等重型指令,其处理对象也是一堆repeatItem 组件, 排序添加删除只是一个普通的JS操作,
       比真实DOM的移动轻量多了
  
  
       */
  
  //匹配同时拥有开标签闭标签的元素节点
      var rfullTag = /^<(\S+)(\s+[^=\s]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*>([\s\S]*)<\/\1>/
  //匹配只有开标签的元素节点
      var rvoidTag = /^<(\S+)(\s+([^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?)*\s*>/
  //用于创建适配某一种标签的正则表达式
      var openStr = "(?:\\s+[^=\\s]+(?:=(?:\"[^\"]*\"|'[^']*'|[^>\s]+))?)*\\s*>"
  //匹配文本节点
      var rtext = /^[^<]+/
  //匹配注释节点
      var rcomment = /^<\!--([\s\S]*)-->/
  //从大片标签中匹想第一个标签的所有属性
      var rattr1 = /(\s+[^\s>\/\/=]+(?:=(?:("|')(?:\\\2|\\?(?!\2)[\w\W])*\2|[^\s'">=]+))?)*\s*\/?>/g
  //从元素的开标签中一个个分解属性值
      var rattr2 = /\s+([^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
  //判定是否有引号开头，IE有些属性没有用引号括起来
      var rquote = /^['"]/
  
      var rgtlt = /></
  
      var ramp = /&amp;/g
  
      var tagCache = {}// 缓存所有匹配开标签闭标签的正则
  //=== === === === 创建虚拟DOM树 === === === === =
  //依赖config
      function parseVProps(node, str) {
          var props = node.props, change
  
          str.replace(rattr2, function (a, n, v) {
              if (v) {
                  v = (rquote.test(v) ? v.slice(1, -1) : v).replace(ramp, "&")
              }
              var name = n.toLowerCase()
              var match = n.match(rmsAttr)
              if (match) {
                  var type = match[1]
                  switch (type) {
                      case "controller":
                      case "important":
                          change = addData(node, "changeAttrs")
                          //移除ms-controller, ms-important
                          //好让[ms-controller]样式生效,处理{{}}问题
                          change[name] = false
                          name = "data-" + type
                          //添加data-controller, data-controller
                          //方便收集vmodel
                          change[name] = v
                          addAttrHook(node)
                          break
                      case "with":
                          change = addData(node, "changeAttrs")
                          change[name] = false
                          addAttrHook(node)
                          name = "each"
                          break
                  }
              }
              props[name] = v || ""
          })
  
          return props
      }
  
  //此阶段只会生成VElement,VText,VComment
      function createVirtual(text, force) {
          var nodes = []
          if (!force && !rbind.test(text)) {
              return nodes
          }
          do {
              var matchText = ""
  
              var match = text.match(rtext)
              var node = false
  
              if (match) {//尝试匹配文本
                  matchText = match[0]
                  node = new VText(matchText)
              }
  
              if (!node) {//尝试匹配注释
                  match = text.match(rcomment)
                  if (match) {
                      matchText = match[0]
                      node = new VComment(match[1])
                  }
              }
  
              if (!node) {//尝试匹配拥有闭标签的元素节点
                  match = text.match(rfullTag)
                  if (match) {
                      matchText = match[0]
                      var tagName = match[1]
                      var opens = []
                      var closes = []
  
                      var ropen = tagCache[tagName + "open"] ||
                          (tagCache[tagName + "open"] = new RegExp("<" + tagName + openStr, "g"))
                      var rclose = tagCache[tagName + "close"] ||
                          (tagCache[tagName + "close"] = new RegExp("<\/" + tagName + ">", "g"))
  
                      /* jshint ignore:start */
                      matchText.replace(ropen, function (_, b) {
                          opens.push(("0000" + b + "<").slice(-4))//取得所有开标签的位置
                          return new Array(_.length + 1).join("1")
                      }).replace(rclose, function (_, b) {
                          closes.push(("0000" + b + ">").slice(-4))//取得所有闭标签的位置
  
                      })
                      /* jshint ignore:end */
  
                      var pos = opens.concat(closes).sort()
                      var gtlt = pos.join("").replace(/\d+/g, "")
                      //<<>><<>>
                      var gutter = gtlt.indexOf("><")
  
                      if (gutter !== -1) {
                          var index = gutter
                          var findex = parseFloat(pos[index]) + tagName.length + 3
                          matchText = matchText.slice(0, findex)
                      }
                      var allAttrs = matchText.match(rattr1)[0]
  
                      var innerHTML = matchText.slice((tagName + allAttrs).length + 1,
                          (tagName.length + 3) * -1)
                      node = new VElement(tagName)
                      node.template = innerHTML
                      var props = allAttrs.slice(0, -1)
                      //这里可能由VElement变成VComponent
                      node = fixTag(node, props, matchText)
                  }
              }
  
              if (!node) {
                  match = text.match(rvoidTag)
                  if (match) {//尝试匹配自闭合标签及注释节点
                      matchText = match[0]
                      //不打算序列化的属性不要放在props中
                      node = new VElement(match[1])
                      node.template = ""
  
                      props = matchText.slice(node.type.length + 1).replace(/\/?>$/, "")
                      //这里可能由VElement变成VComponent
                      node = fixTag(node, props, matchText)
                  }
              }
              if (node) {
                  nodes.push(node)
                  text = text.slice(matchText.length)
              } else {
                  break
              }
          } while (1);
          return nodes
      }
      avalon.createVirtual = createVirtual
      var rmsskip = /\bms\-skip/
      var rnocontent = /textarea|template|script|style/
  
  //如果存在ms-if, ms-repeat, ms-html, ms-text指令,可能会生成<ms:repeat> 等自定义标签
      function fixTag(node, attrs, outerHTML) {
          if (rmsskip.test(attrs)) {
              node.skip = true
              node.outerHTML = outerHTML
              return node
          }
          parseVProps(node, attrs)
          //如果不是那些装载模板的容器元素(script, noscript, template, textarea)
          //并且它的后代还存在绑定属性
          var innerHTML = node.template
          if (node.type === "option" || node.type === "xmp") {
              node.children.push(new VText(innerHTML))
          }else if (!rnocontent.test(node.type)) {// && rbind.test(outerHTML)
              pushArray(node.children, createVirtual(innerHTML))
  
          } else {
              if (node.type === "noscript") {
                  innerHTML = escape(innerHTML)//这两个元素不能
              }
              node.skipContent = true
              node.__content = innerHTML
          }
          return node
      }
  
  
  //销毁虚拟DOM树，方便avalon在$emit方法中回收它们
      function disposeVirtual(nodes) {
          for (var i = 0, node; node = nodes[i++]; ) {
              switch (node.type) {
                  case "#text":
                  case "#comment":
                      node.disposed = true
                      if (node.tokens) {
                          node.tokens.forEach(function (token) {
                              token.element = null
                              token.__disposed__ = true
                          })
                      }
                      break
                  default:
                      node.disposed = true
                      if (node.children) {
                          disposeVirtual(node.children)
                      }
                      if (node.vmodel) {
                          node.vmodel.$active = false
                      }
                      break
              }
          }
          nodes.length = 0
      }
  
      function willDestroy(nodes) {
          for (var i = 0, node; node = nodes[i++]; ) {
              node.disposed = true
          }
      }
  
      function willCreate(nodes) {
          for (var i = 0, node; node = nodes[i++]; ) {
              node.create = true
          }
      }
  //更新真实DOM树
      function getVType(node) {
          switch (node.type) {
              case "#text":
                  return 3
              case "#comment":
                  return 8
              case "#component":
                  return -1
              default:
                  return 1
          }
      }
      function getNextEntity(prev, prevVirtual, parent) {
          if (prevVirtual && prevVirtual.signature) {
              var end = prevVirtual.signature + ":end"
              for (var i = 0, el; el = parent.childNodes[i++]; ) {
                  if (el.nodeValue === end) {
                      return el.nextSibling
                  }
              }
          }
          return prev ? prev.nextSibling : null
      }
  
  
      function updateEntity(nodes, vnodes, parent) {
          var cur = nodes[0]
          if (!cur && !parent)
              return
          parent = parent || cur.parentNode
          for (var i = 0, vn = vnodes.length; i < vn; i++) {
              var mirror = vnodes[i]
              cur = i === 0 ? cur : getNextEntity(cur, vnodes[i - 1], parent)
              if (!mirror)
                  break
              if (false === execHooks(cur, mirror, parent, "change")) {
                  //ms-if,ms-each,ms-repeat这些破坏原来结构的指令会这里进行中断
                  execHooks(cur, mirror, parent, "afterChange")
                  continue
              }
              if (!mirror.skipContent && !mirror.skip && mirror.children && cur && cur.nodeType === 1) {
                  updateEntity(avalon.slice(cur.childNodes), mirror.children, cur)
              }
              execHooks(cur, mirror, parent, "afterChange")
          }
      }
  
      function execHooks(node, vnode, parent, hookName) {
          var hooks = vnode[hookName]
          if (hooks) {
              for (var hook; hook = hooks.shift(); ) {
                  if (false === hook(node, vnode, parent)) {
                      return false
                  }
              }
              delete vnode[hookName]
          }
      }
  
  
  // ms-if 没有路标, 组件
  // ms-include 没有路标, 非组件
  // ms-repeat 一开始添加路标,组件
  // ms-each 一开始添加路标, 组件
  // ms-html 没有路标,非组件
  // ms-text 没有路标,非组件
  
  //更新整个虚拟DOM树
      function updateVirtual(nodes, vm) {
          for (var i = 0, n = nodes.length; i < n; i++) {
              var node = nodes[i]
              switch (node.type) {
                  case "#comment":
                  case "#component":
                      break
                  case "#text":
                      if (!node.skip) {
                          if (rexpr.test(String(node.nodeValue))) {
                              scanText(node, vm)
                          }
                      }
                      break
                  default:
                      if (!node.skip) {
                          scanTag(node, vm, nodes)
                      }
                      break
              }
          }
          return nodes
      }
  
  
  
      var attrDir = avalon.directive("attr", {
          init: function (binding) {
              //{{aaa}} --> aaa
              //{{aaa}}/bbb.html --> (aaa) + "/bbb.html"
              binding.expr = normalizeExpr(binding.expr.trim())
          },
          change: function (val, binding) {
              var vnode = binding.element
              if (vnode) {
                  var change = addData(vnode, "changeAttrs")
                  var name = binding.param
                  var toRemove = (val === false) || (val === null) || (val === void 0)
                  change[name] = toRemove ? false : val
                  addHooks(this, binding)
              }
          },
          update: attrUpdate
      })
  
  //这几个指令都可以使用插值表达式，如ms-src="aaa/{{b}}/{{c}}.html"
      "title,alt,src,value,css,href".replace(rword, function (name) {
          directives[name] = attrDir
      })
  
  //根据VM的属性值或表达式的值切换类名，ms-class="xxx yyy zzz:flag"
  //http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
      avalon.directive("class", {
          is: function (a, b) {
              if (!Array.isArray(b)) {
                  return false
              } else {
                  return a[0] === b[0] && a[1] === b[1]
              }
          },
          init: function (binding) {
              var oldStyle = binding.param
              var method = binding.type
              if (!oldStyle || isFinite(oldStyle)) {
                  binding.param = "" //去掉数字
                  directives.effect.init(binding)
              } else {
                  log('ms-' + method + '-xxx="yyy"这种用法已经过时,请使用ms-' + method + '="xxx:yyy"')
                  binding.expr = '[' + quote(oldStyle) + "," + binding.expr + "]"
              }
              var vnode = binding.element
              var classEvent = {}
              if (method === "hover") {//在移出移入时切换类名
                  classEvent.mouseenter = activateClass
                  classEvent.mouseleave = abandonClass
              } else if (method === "active") {//在获得焦点时切换类名
                  vnode.props.tabindex = vnode.props.tabindex || -1
                  classEvent.tabIndex = vnode.props.tabindex
                  classEvent.mousedown = activateClass
                  classEvent.mouseup = abandonClass
                  classEvent.mouseleave = abandonClass
              }
              vnode.classEvent = classEvent
          },
          change: function (arr, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              var type = binding.type
              var data = addData(vnode, type + "Data")
              var target = arr[0]
              var toggle = arr[1]
              if (binding.oldClass && target !== binding.oldClass) {
                  data.toRemove = binding.oldClass
              }
              data.targetClass = target
              data.toggleClass = toggle
              binding.oldClass = target
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              var classEvent = vnode.classEvent
              if (classEvent) {
                  for (var i in classEvent) {
                      if (i === "tabIndex") {
                          node[i] = classEvent[i]
                      } else {
                          avalon.bind(node, i, classEvent[i])
                      }
                  }
                  delete vnode.classEvent
              }
              var wrap = avalon(node)
                  ;
              ["class", "hover", "active"].forEach(function (type) {
                  var data = vnode[type + "Data"]
                  if (!data)
                      return
                  if (data.toRemove) {
                      wrap.removeClass(data.toRemvoe)
                  }
                  if (type === "class") {
                      wrap.toggleClass(data.targetClass, data.toggleClass)
                  } else {
                      node.targetClass = data.targetClass
                      node.toggleClass = data.toggleClass
                  }
              })
          }
      })
  
      function activateClass(e) {
          var elem = e.target
          if (elem.toggleClass) {
              avalon(elem).addClass(elem.targetClass)
          }
      }
  
      function abandonClass(e) {
          var elem = e.target
          if (elem.toggleClass) {
              avalon(elem).removeClass(elem.targetClass)
          }
      }
  
  
      markID(activateClass)
      markID(abandonClass)
  
      "hover,active".replace(rword, function (name) {
          directives[name] = directives["class"]
      })
  
  //ms-controller绑定已经在scanTag 方法中实现
      avalon.directive("css", {
          init: directives.attr.init,
          change: function (val, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              var change = addData(vnode, "changeCss")
              change[this.param] = val
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              var change = vnode.changeCss
              var wrap = avalon(node)
              for (var name in change) {
                  wrap.css(name, change[name])
              }
              delete vnode.changeCss
          }
      })
  
      avalon.directive("data", {
          priority: 100,
          init: noop,
          change: function (val, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              var change = addData(vnode, "changeData")
              val = (val && typeof val === "object") ? val : String(val)
              change["data-" + binding.param] = val
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              var change = vnode.changeData
              for (var key in change) {
                  var val = change[key]
                  if (typeof val === "string") {
                      node.setAttribute(key, val)
                  } else {
                      node[key] = val
                  }
              }
              delete vnode.changeData
          }
      })
  
  //双工绑定
      ;
      (function () {
  
          var rduplexType = /^(?:checkbox|radio)$/
          var rduplexParam = /^(?:radio|checked)$/
          var rnoduplexInput = /^(file|button|reset|submit|checkbox|radio|range)$/
          avalon.directive("duplex", {
              priority: 2000,
              init: function (binding, hasCast) {
                  var elem = binding.element
                  var vmodel = binding.vmodel
                  var fn = getBindingValue(elem, "data-duplex-changed", vmodel)
                  if (typeof fn !== "function") {
                      fn = noop
                  }
                  binding.changed = fn
                  var nodeName = elem.type
                  if (nodeName === "input" && !elem.props.type) {
                      elem.props.type = "text"
                  }
                  var elemType = elem.props.type
                  var params = []
                  var casting = oneObject("string,number,boolean,checked")
                  if (elemType === "radio" && binding.param === "") {
                      binding.param = "checked"
                  }
  
                  binding.param.replace(rw20g, function (name) {
                      if (rduplexType.test(elemType) && rduplexParam.test(name)) {
                          if (name === "radio")
                              log("ms-duplex-radio已经更名为ms-duplex-checked")
                          name = "checked"
                          elem.props.isChecked = true
                          elem.props.xtype = "radio"
                      }
                      if (name === "bool") {
                          name = "boolean"
                          log("ms-duplex-bool已经更名为ms-duplex-boolean")
                      } else if (name === "text") {
                          name = "string"
                          log("ms-duplex-text已经更名为ms-duplex-string")
                      }
                      if (casting[name]) {
                          hasCast = true
                      }
                      avalon.Array.ensure(params, name)
                  })
                  if (!hasCast) {
                      params.push("string")
                  }
                  binding.param = params.join("-")
                  if (!elem.props.xtype) {
                      elem.props.xtype = nodeName === "select" ? "select" :
                          elemType === "checkbox" ? "checkbox" :
                              elemType === "radio" ? "radio" :
                                  /^change/.test(elem.props["data-duplex-event"]) ? "change" :
                                      "input"
                  }
                  var duplexEvents = {}
                  switch (elem.props.xtype) {
                      case "radio":
                          duplexEvents.click = inputListener
                          break
                      case "checkbox":
                          duplexEvents[W3C ? "change" : "click"] = checkboxListener
                          break
                      case "change":
                          duplexEvents.change = inputListener
                          break
                      case "select":
                          duplexEvents.change = selectListener
                          break
                      case "input":
                          if (!IEVersion) { // W3C
                              duplexEvents.input = inputListener
                              duplexEvents.compositionstart = compositionStart
                              duplexEvents.compositionend = compositionEnd
                              duplexEvents.DOMAutoComplete = inputListener
                          } else {
                              // IE下通过selectionchange事件监听IE9+点击input右边的X的清空行为，及粘贴，剪切，删除行为
                              if (IEVersion > 8) {
                                  if (IEVersion === 9) {
                                      //IE9删除字符后再失去焦点不会同步 #1167
                                      duplexEvents.keyup = inputListener
                                  }
                                  //IE9使用propertychange无法监听中文输入改动
                                  duplexEvents.input = inputListener
                              } else {
                                  //onpropertychange事件无法区分是程序触发还是用户触发
                                  //IE6-8下第一次修改时不会触发,需要使用keydown或selectionchange修正
                                  duplexEvents.propertychange = propertychangeListener
                              }
                              duplexEvents.dragend = dragendListener
                              //http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
                              //http://www.matts411.com/post/internet-explorer-9-oninput/
                          }
                          break
  
                  }
  
                  if (elem.props.xtype === "input" && !rnoduplexInput.test(elemType)) {
                      if (elemType !== "hidden") {
                          duplexEvents.focus = duplexFocus
                          duplexEvents.blur = duplexBlur
                      }
                      elem.watchValueInTimer = true
                  }
                  elem.duplexEvents = duplexEvents
                  elem.dispose = disposeDuplex
              },
              change: function (value, binding) {
                  var elem = binding.element
                  if (!elem || elem.disposed)
                      return
                  elem["data-pipe"] = binding.param
                  elem.setter = function (a, b, c) {
                      binding.setter(binding.vmodel, a, b, c)
                  }
  
                  if (elem.type === "select") {
                      addHook(elem, selectUpdate, "afterChange")
                  }
                  elem.getterValue = value
                  elem.changed = binding.changed
                  addHooks(this, binding)
              },
              update: function (node, vnode) {
                  vnode._ = node
  
                  node.setter = vnode.setter
                  var getterValue = node.getterValue = vnode.getterValue
                  var events = vnode.duplexEvents
                  if (events) {
                      node.setAttribute("data-pipe", vnode['data-pipe'])
                      delete vnode['data-pipe']
                      node.changed = vnode.changed
                      delete vnode.changed
                      for (var eventName in events) {
                          avalon.bind(node, eventName, events[eventName])
                      }
                      delete vnode.duplexEvents
                  }
                  if (vnode.watchValueInTimer) {
                      node.avalonSetter = inputListener //#765
                      watchValueInTimer(function () {
                          if (!vnode.disposed) {
                              if (!node.msFocus) {
                                  node.avalonSetter()
                              }
                          } else if (!node.msRetain) {
                              return false
                          }
                      })
                      delete vnode.watchValueInTimer
                  }
                  var curValue
                  switch (vnode.props.xtype) {
                      case "input":
                      case "change":
                          curValue = pipe(getterValue, node, "set")  //fix #673
                          if (curValue !== node.oldValue) {
                              var fixCaret = false
                              if (node.msFocus) {
                                  try {
                                      var pos = getCaret(node)
                                      if (pos.start === pos.end) {
                                          pos = pos.start
                                          fixCaret = true
                                      }
                                  } catch (e) {
                                  }
                              }
                              node.value = node.oldValue = curValue
                              if (fixCaret) {
                                  setCaret(node, pos, pos)
                              }
                          }
                          break
                      case "radio":
                          curValue = vnode.props.isChecked ? !!getterValue : getterValue + "" === node.value
                          if (IEVersion === 6) {
                              setTimeout(function () {
                                  //IE8 checkbox, radio是使用defaultChecked控制选中状态，
                                  //并且要先设置defaultChecked后设置checked
                                  //并且必须设置延迟
                                  node.defaultChecked = curValue
                                  node.checked = curValue
                              }, 31)
                          } else {
                              node.checked = curValue
                          }
                          break
                      case "checkbox":
                          var array = [].concat(getterValue) //强制转换为数组
                          curValue = pipe(node.value, node, "get")
                          node.checked = array.indexOf(curValue) > -1
                          break
                      case "select":
                          //在afterChange中处理
                          break
                  }
              }
          })
  
          function disposeDuplex() {
              var elem = this._
              if (elem) {
                  elem.changed = elem.avalonSetter = elem.oldValue =
                      elem.setter = void 0
                  avalon.unbind(elem)
                  this._ = null
              }
          }
          function compositionStart() {
              this.composing = true
          }
          function compositionEnd() {
              this.composing = false
          }
          function duplexFocus() {
              this.msFocus = true
          }
          function duplexBlur() {
              this.msFocus = false
          }
          function inputListener() { //原来的updateVModel
              var elem = this
              var val = elem.value //防止递归调用形成死循环
              if (elem.composing || val === elem.oldValue)
                  return
              var lastValue = pipe(val, elem, "get")
              try {
                  elem.oldValue = val
                  elem.setter(lastValue)
                  elem.changed(lastValue)
              } catch (ex) {
                  log(ex)
              }
          }
          function propertychangeListener(e) {
              if (e.propertyName === "value") {
                  inputListener.call(this, e)
              }
          }
  
          function dragendListener(e) {
              var elem = this
              setTimeout(function () {
                  inputListener.call(elem, e)
              }, 17)
          }
  
          function checkboxListener() {
              var elem = this
              var method = elem.checked ? "ensure" : "remove"
              var array = elem.getterValue
              if (!Array.isArray(array)) {
                  log("ms-duplex应用于checkbox上要对应一个数组")
                  array = [array]
              }
              var val = pipe(elem.value, elem, "get")
              avalon.Array[method](array, val)
              elem.changed(array)
          }
  
  //用于更新VM
          function selectListener() {
              var elem = this
              var val = avalon(elem).val() //字符串或字符串数组
              if (Array.isArray(val)) {
                  val = val.map(function (v) {
                      return pipe(v, elem, "get")
                  })
              } else {
                  val = pipe(val, elem, "get")
              }
              if (val + "" !== elem.oldValue) {
                  try {
                      elem.setter(val)
                  } catch (ex) {
                      log(ex)
                  }
              }
          }
          function selectUpdate(elem, vnode) {
              avalon(elem).val(vnode.getterValue)
          }
          selectUpdate.priority = 2001
  
          markID(compositionStart)
          markID(compositionEnd)
          markID(duplexFocus)
          markID(duplexBlur)
          markID(inputListener)
          markID(propertychangeListener)
          markID(dragendListener)
          markID(checkboxListener)
          markID(selectListener)
  
          if (IEVersion) {
              avalon.bind(DOC, "selectionchange", function (e) {
                  var el = DOC.activeElement || {}
                  if (!el.msFocus && el.avalonSetter) {
                      el.avalonSetter()
                  }
              })
          }
  
          function fixNull(val) {
              return val == null ? "" : val
          }
          avalon.duplexHooks = {
              checked: {
                  get: function (val, elem) {
                      return !elem.oldValue
                  }
              },
              string: {
                  get: function (val) { //同步到VM
                      return val
                  },
                  set: fixNull
              },
              "boolean": {
                  get: function (val) {
                      return val === "true"
                  },
                  set: fixNull
              },
              number: {
                  get: function (val, elem) {
                      var number = parseFloat(val + "")
                      if (-val === -number) {
                          return number
                      }
  
                      var arr = /strong|medium|weak/.exec(elem.getAttribute("data-duplex-number")) || ["medium"]
                      switch (arr[0]) {
                          case "strong":
                              return 0
                          case "medium":
                              return val === "" ? "" : 0
                          case "weak":
                              return val
                      }
                  },
                  set: fixNull
              }
          }
  
          function pipe(val, elem, action) {
              var param = elem.getAttribute("data-pipe") || ""
              param.replace(rw20g, function (name) {
                  var hook = avalon.duplexHooks[name]
                  if (hook && typeof hook[action] === "function") {
                      val = hook[action](val, elem)
                  }
              })
              return val
          }
  //---------------
  
          var TimerID, ribbon = []
  
          avalon.tick = function (fn) {
              if (ribbon.push(fn) === 1) {
                  TimerID = setInterval(ticker, 60)
              }
          }
  
          function ticker() {
              for (var n = ribbon.length - 1; n >= 0; n--) {
                  var el = ribbon[n]
                  if (el() === false) {
                      ribbon.splice(n, 1)
                  }
              }
              if (!ribbon.length) {
                  clearInterval(TimerID)
              }
          }
  
          var watchValueInTimer = noop
              ;
          (function () { // jshint ignore:line
              try { //#272 IE9-IE11, firefox
                  var setters = {}
                  var aproto = HTMLInputElement.prototype
                  var bproto = HTMLTextAreaElement.prototype
                  function newSetter(value) { // jshint ignore:line
                      setters[this.tagName].call(this, value)
                      if (!this.msFocus && this.avalonSetter) {
                          this.avalonSetter()
                      }
                  }
                  var inputProto = HTMLInputElement.prototype
                  Object.getOwnPropertyNames(inputProto) //故意引发IE6-8等浏览器报错
                  setters["INPUT"] = Object.getOwnPropertyDescriptor(aproto, "value").set
  
                  Object.defineProperty(aproto, "value", {
                      set: newSetter
                  })
                  setters["TEXTAREA"] = Object.getOwnPropertyDescriptor(bproto, "value").set
                  Object.defineProperty(bproto, "value", {
                      set: newSetter
                  })
              } catch (e) {
                  //在chrome 43中 ms-duplex终于不需要使用定时器实现双向绑定了
                  // http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
                  // https://docs.google.com/document/d/1jwA8mtClwxI-QJuHT7872Z0pxpZz8PBkf2bGAbsUtqs/edit?pli=1
                  watchValueInTimer = avalon.tick
              }
          })()
  
          // jshint ignore:line
          function getCaret(ctrl) {
              var start = NaN, end = NaN
              if (ctrl.setSelectionRange) {
                  start = ctrl.selectionStart
                  end = ctrl.selectionEnd
              } else if (document.selection && document.selection.createRange) {
                  var range = document.selection.createRange()
                  start = 0 - range.duplicate().moveStart('character', -100000)
                  end = start + range.text.length
              }
              return {
                  start: start,
                  end: end
              }
          }
  
          function setCaret(ctrl, begin, end) {
              if (!ctrl.value || ctrl.readOnly)
                  return
              if (ctrl.createTextRange) {//IE6-8
                  var range = ctrl.createTextRange()
                  range.collapse(true)
                  range.moveStart("character", begin)
                  range.select()
              } else {
                  ctrl.selectionStart = begin
                  ctrl.selectionEnd = end
              }
          }
  
  
      })()
      avalon.directive("effect", {
          priority: 5,
          init: function (binding) {
              var text = binding.expr,
                  className,
                  rightExpr
              var colonIndex = text.replace(rexprg, function (a) {
                  return a.replace(/./g, "0")
              }).indexOf(":") //取得第一个冒号的位置
              if (colonIndex === -1) { // 比如 ms-class/effect="aaa bbb ccc" 的情况
                  className = text
                  rightExpr = true
              } else { // 比如 ms-class/effect-1="ui-state-active:checked" 的情况
                  className = text.slice(0, colonIndex)
                  rightExpr = text.slice(colonIndex + 1)
              }
              if (!rexpr.test(text)) {
                  className = quote(className)
              } else {
                  className = normalizeExpr(className)
              }
              binding.expr = "[" + className + "," + rightExpr + "]"
          },
          update: function (arr) {
              var name = arr[0]
              var elem = this.element
              if (elem.getAttribute("data-effect-name") === name) {
                  return
              } else {
                  elem.removeAttribute("data-effect-driver")
              }
              var inlineStyles = elem.style
              var computedStyles = window.getComputedStyle ? window.getComputedStyle(elem) : null
              var useAni = false
              if (computedStyles && (supportTransition || supportAnimation)) {
  
                  //如果支持CSS动画
                  var duration = inlineStyles[transitionDuration] || computedStyles[transitionDuration]
                  if (duration && duration !== '0s') {
                      elem.setAttribute("data-effect-driver", "t")
                      useAni = true
                  }
  
                  if (!useAni) {
  
                      duration = inlineStyles[animationDuration] || computedStyles[animationDuration]
                      if (duration && duration !== '0s') {
                          elem.setAttribute("data-effect-driver", "a")
                          useAni = true
                      }
  
                  }
              }
  
              if (!useAni) {
                  if (avalon.effects[name]) {
                      elem.setAttribute("data-effect-driver", "j")
                      useAni = true
                  }
              }
              if (useAni) {
                  elem.setAttribute("data-effect-name", name)
              }
          }
      })
  
      avalon.effects = {}
      avalon.effect = function (name, callbacks) {
          avalon.effects[name] = callbacks
      }
  
  
  
      var supportTransition = false
      var supportAnimation = false
  
      var transitionEndEvent
      var animationEndEvent
      var transitionDuration = avalon.cssName("transition-duration")
      var animationDuration = avalon.cssName("animation-duration")
      new function () {// jshint ignore:line
          var checker = {
              'TransitionEvent': 'transitionend',
              'WebKitTransitionEvent': 'webkitTransitionEnd',
              'OTransitionEvent': 'oTransitionEnd',
              'otransitionEvent': 'otransitionEnd'
          }
          var tran
          //有的浏览器同时支持私有实现与标准写法，比如webkit支持前两种，Opera支持1、3、4
          for (var name in checker) {
              if (window[name]) {
                  tran = checker[name]
                  break;
              }
              try {
                  var a = document.createEvent(name);
                  tran = checker[name]
                  break;
              } catch (e) {
              }
          }
          if (typeof tran === "string") {
              supportTransition = true
              transitionEndEvent = tran
          }
  
          //大致上有两种选择
          //IE10+, Firefox 16+ & Opera 12.1+: animationend
          //Chrome/Safari: webkitAnimationEnd
          //http://blogs.msdn.com/b/davrous/archive/2011/12/06/introduction-to-css3-animat ions.aspx
          //IE10也可以使用MSAnimationEnd监听，但是回调里的事件 type依然为animationend
          //  el.addEventListener("MSAnimationEnd", function(e) {
          //     alert(e.type)// animationend！！！
          // })
          checker = {
              'AnimationEvent': 'animationend',
              'WebKitAnimationEvent': 'webkitAnimationEnd'
          }
          var ani;
          for (name in checker) {
              if (window[name]) {
                  ani = checker[name];
                  break;
              }
          }
          if (typeof ani === "string") {
              supportTransition = true
              animationEndEvent = ani
          }
  
      }()
  
      var effectPool = []//重复利用动画实例
      function effectFactory(el, opts) {
          if (!el || el.nodeType !== 1) {
              return null
          }
          if (opts) {
              var name = opts.effectName
              var driver = opts.effectDriver
          } else {
              name = el.getAttribute("data-effect-name")
              driver = el.getAttribute("data-effect-driver")
          }
          if (!name || !driver) {
              return null
          }
  
          var instance = effectPool.pop() || new Effect()
          instance.el = el
          instance.driver = driver
          instance.useCss = driver !== "j"
          if (instance.useCss) {
              opts && avalon(el).addClass(opts.effectClass)
              instance.cssEvent = driver === "t" ? transitionEndEvent : animationEndEvent
          }
          instance.name = name
          instance.callbacks = avalon.effects[name] || {}
  
          return instance
  
  
      }
  
      function effectBinding(elem, binding) {
          var name = elem.getAttribute("data-effect-name")
          if (name) {
              binding.effectName = name
              binding.effectDriver = elem.getAttribute("data-effect-driver")
              var stagger = +elem.getAttribute("data-effect-stagger")
              binding.effectLeaveStagger = +elem.getAttribute("data-effect-leave-stagger") || stagger
              binding.effectEnterStagger = +elem.getAttribute("data-effect-enter-stagger") || stagger
              binding.effectClass = elem.className || NaN
          }
      }
      function upperFirstChar(str) {
          return str.replace(/^[\S]/g, function (m) {
              return m.toUpperCase()
          })
      }
  //var effectBuffer = new Buffer()
      function Effect() {
      }//动画实例,做成类的形式,是为了共用所有原型方法
  
      Effect.prototype = {
          contrustor: Effect,
          enterClass: function () {
              return getEffectClass(this, "enter")
          },
          leaveClass: function () {
              return getEffectClass(this, "leave")
          },
          // 共享一个函数
          actionFun: function (name, before, after) {
              if (document.hidden) {
                  return
              }
              var me = this
              var el = me.el
              var isLeave = name === "leave"
              name = isLeave ? "leave" : "enter"
              var oppositeName = isLeave ? "enter" : "leave"
              callEffectHook(me, "abort" + upperFirstChar(oppositeName))
              callEffectHook(me, "before" + upperFirstChar(name))
              if (!isLeave)
                  before(el) //这里可能做插入DOM树的操作,因此必须在修改类名前执行
              var cssCallback = function (cancel) {
                  el.removeEventListener(me.cssEvent, me.cssCallback)
                  if (isLeave) {
                      before(el) //这里可能做移出DOM树操作,因此必须位于动画之后
                      avalon(el).removeClass(me.cssClass)
                  } else {
                      if (me.driver === "a") {
                          avalon(el).removeClass(me.cssClass)
                      }
                  }
                  if (cancel !== true) {
                      callEffectHook(me, "after" + upperFirstChar(name))
                      after && after(el)
                  }
                  me.dispose()
              }
              if (me.useCss) {
                  if (me.cssCallback) { //如果leave动画还没有完成,立即完成
                      me.cssCallback(true)
                  }
  
                  me.cssClass = getEffectClass(me, name)
                  me.cssCallback = cssCallback
  
                  me.update = function () {
                      el.addEventListener(me.cssEvent, me.cssCallback)
                      if (!isLeave && me.driver === "t") {//transtion延迟触发
                          avalon(el).removeClass(me.cssClass)
                      }
                  }
                  avalon(el).addClass(me.cssClass)//animation会立即触发
  
                  effectBuffer.render(true)
                  effectBuffer.queue.push(me)
  
              } else {
                  callEffectHook(me, name, cssCallback)
  
              }
          },
          enter: function (before, after) {
              this.actionFun.apply(this, ["enter"].concat(avalon.slice(arguments)))
  
          },
          leave: function (before, after) {
              this.actionFun.apply(this, ["leave"].concat(avalon.slice(arguments)))
  
          },
          dispose: function () {//销毁与回收到池子中
              this.update = this.cssCallback = null
              if (effectPool.unshift(this) > 100) {
                  effectPool.pop()
              }
          }
  
  
      }
  
  
      function getEffectClass(instance, type) {
          var a = instance.callbacks[type + "Class"]
          if (typeof a === "string")
              return a
          if (typeof a === "function")
              return a()
          return instance.name + "-" + type
      }
  
  
      function callEffectHook(effect, name, cb) {
          var hook = effect.callbacks[name]
          if (hook) {
              hook.call(effect, effect.el, cb)
          }
      }
  
      var applyEffect = function (el, dir/*[before, [after, [opts]]]*/) {
          var args = aslice.call(arguments, 0)
          if (typeof args[2] !== "function") {
              args.splice(2, 0, noop)
          }
          if (typeof args[3] !== "function") {
              args.splice(3, 0, noop)
          }
          var before = args[2]
          var after = args[3]
          var opts = args[4]
          var effect = effectFactory(el, opts)
          if (!effect) {
              before()
              after()
              return false
          } else {
              var method = dir ? 'enter' : 'leave'
              effect[method](before, after)
          }
      }
  
      avalon.mix(avalon.effect, {
          apply: applyEffect,
          append: function (el, parent, after, opts) {
              return applyEffect(el, 1, function () {
                  parent.appendChild(el)
              }, after, opts)
          },
          before: function (el, target, after, opts) {
              return applyEffect(el, 1, function () {
                  target.parentNode.insertBefore(el, target)
              }, after, opts)
          },
          remove: function (el, parent, after, opts) {
              return applyEffect(el, 0, function () {
                  if (el.parentNode === parent)
                      parent.removeChild(el)
              }, after, opts)
          }
      })
  
      directives["{{}}"] = {
          init: noop,
          change: function (value, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              binding.array[binding.index] = value
              var nodeValue = binding.array.join("")
  
              if (nodeValue !== vnode.nodeValue) {
                  vnode.nodeValue = nodeValue
                  addHooks(this, binding)
              }
          },
          update: function (node, vnode, parent) {
              if (node.nodeType !== 3) {
                  parent.replaceChild(vnode.toDOM(), node)
              } else {
                  node.nodeValue = vnode.nodeValue
              }
          }
      }
      var rinexpr = /^\s*([\s\S]+) in (\w+)/
      var rkeyvalue = /\(\s*(\w+)\s*,\s*(\w+)\s*\)/
      var rremoveRepeat = /^ms-(repeat|each)/
      avalon.directive("repeat", {
          is: function (a, b) {
              if (Array.isArray(a)) {
                  if (!Array.isArray(b)) {
                      return false
                  }
                  if (a.length !== b.length) {
                      return false
                  }
                  return !a.some(function (el, i) {
                      return el !== b[i]
                  })
              } else {
                  return compareObject(a, b)
              }
          },
          init: function (binding) {
              //尝试使用ng风格的 el in array或(index, el) in array
              var expr = binding.expr, match
              if (match = expr.match(rinexpr)) {
                  binding.expr = match[2]
                  var keyvalue = match[1]
                  if (match = keyvalue.match(rkeyvalue)) {
                      binding.keyName = match[1]
                      binding.valueName = match[2]
                  } else {
                      binding.valueName = keyvalue
                  }
              }
  
              var vnode = binding.element
              disposeVirtual(vnode.children)
              var component = new VComponent("ms-repeat")
              var template = toString(vnode, rremoveRepeat) //防止死循环
              var type = binding.type
              var top = binding.vmodel, $outer = {}
              var signature = generateID(type)
              component.signature = signature
              //处理渲染完毕后的回调的函数
              var rendered = getBindingValue(vnode, "data-" + type + "-rendered", top)
              if (typeof rendered === "function") {
                  binding.rendered = function (a, b, c) {
                      rendered(type === "repeat" ? c : a)
                  }
              } else {
                  binding.rendered = noop
              }
  
  
              if (type === "repeat") {
                  // repeat组件会替换旧原来的VElement
                  var arr = binding.siblings
                  for (var i = 0, el; el = arr[i]; i++) {
                      if (el === vnode) {
                          arr[i] = component
                          break
                      }
                  }
                  component.template = template + "<!--" + signature + "-->"
              } else {
                  //each组件会替换掉原VComponent组件的所有孩子
                  disposeVirtual(vnode.children)
                  pushArray(vnode.children, [component])
                  component.template = vnode.template.trim() + "<!--" + signature + "-->"
              }
  
              binding.element = component //偷龙转风
              //计算上级循环的$outer
              //外层vmodel不存在$outer对象时, $outer为一个空对象
              if (top.hasOwnProperty("$outer") && typeof top.$outer === "object" && top.$outer.names) {
                  top.$outer.names.replace(rword, function (name) {
                      if (top.hasOwnProperty(name)) {
                          $outer[name] = top[name]
                      }
                  })
              }
              binding.$outer = $outer
              delete binding.siblings
          },
          change: function (value, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed) {
                  return
              }
              var cache = binding.cache || {}
              var newCache = {}, children = [], keys = [], command = {}, last, proxy
              //处理valueName, keyName, last
              var repeatArray = Array.isArray(value)
              if (repeatArray) {
                  last = value.length - 1
                  if (!binding.valueName) {
                      binding.valueName = binding.param || "el"
                      delete binding.param
                  }
                  if (!binding.keyName) {
                      binding.keyName = "$index"
                  }
              } else {
                  if (!binding.keyName) {
                      binding.keyName = "$key"
                  }
                  if (!binding.valueName) {
                      binding.valueName = "$val"
                  }
                  for (var k in value) {
                      if (value.hasOwnProperty(k)) {
                          keys.push(k)
                      }
                  }
                  last = keys.length - 1
              }
              //处理$outer.names
              if (!binding.$outer.names) {
                  var names = ["$first", "$last", "$index", "$outer"]
                  if (repeatArray) {
                      names.push("$remove")
                  }
                  avalon.Array.ensure(names, binding.valueName)
                  avalon.Array.ensure(names, binding.keyName)
                  binding.$outer.names = names.join(",")
              }
  
  
              //键值如果为数字,表示它将移动到哪里,-1表示它将移除,-2表示它将创建
              //只遍历一次算出所有要更新的步骤 O(n) ,比kMP (O(m+n))快
              for (var i = 0; i <= last; i++) {
                  if (repeatArray) {//如果是数组,以$id或type+值+"_"为键名
                      var item = value[i]
                      var component = isInCache(cache, item)//从缓存取出立即删掉
                  } else {//如果是对象,直接用key为键名
                      var key = keys[i]
                      item = value[key]
                      component = cache[key]
                      delete cache[key]
                  }
                  if (component) {
                      proxy = component.vmodel
                      command[proxy.$index] = i//标识其从什么位置移动什么位置
                  } else {//如果不存在就创建 
                      component = new VComponent("repeatItem")
                      component.template = vnode.template
                      component.construct(item, binding, repeatArray)
                      proxy = component.vmodel
                      proxy.$outer = binding.$outer
                      proxy[binding.keyName] = key || i
                      proxy[binding.valueName] = item
                      if (repeatArray) {
                          /* jshint ignore:start */
                          (function (array, el) {
                              proxy.$remove = function () {
                                  avalon.Array.remove(array, el)
                              }
                          })(value, item)
                          /* jshint ignore:end */
                      }
                      command[i] = -2
                  }
                  proxy.$index = i
                  proxy.$first = i === 0
                  proxy.$last = i === last
                  if (component._new) {
                      updateVirtual(component.children, proxy)
                      delete component._new
                  }
                  if (repeatArray) {
                      saveInCache(newCache, item, component)
                  } else {
                      newCache[key] = component
                  }
                  children.push(component)
              }
              for (i in cache) {
                  if (cache[i]) {
                      var ii = cache[i].vmodel.$index
                      if (command[ii] !== -2) {
                          //如果这个位置被新虚拟节点占领了，那么我们就不用移除其对应的真实节点
                          //但对应的旧虚拟节点还是要销毁的
                          command[ii] = -1
                      }
                      cache[i].dispose()
                      delete cache[i]
                  }
              }
              var vChildren = vnode.children
              vChildren.length = 0
              pushArray(vChildren, children)
              vChildren.unshift(new VComment(vnode.signature + ":start"))
              vChildren.push(new VComment(vnode.signature + ":end"))
              binding.cache = newCache
              if (repeatArray) {
                  binding.oldValue = value.concat()
              } else {
                  binding.oldValue = newCache
              }
              vnode.repeatCommand = command
              addHook(vnode, binding.rendered, "afterChange", 95)
              addHooks(this, binding)
          },
          update: function (node, vnode, parent) {
              if (!vnode.disposed) {
                  var groupText = vnode.signature
                  var nodeValue = node.nodeValue
                  if (node.nodeType === 8 && /\w+\d+\:start/.test(nodeValue) &&
                      nodeValue !== groupText + ":start"
                  ) {
                      updateSignature(node, nodeValue, groupText)
                  }
  
                  if (node.nodeType !== 8 || node.nodeValue !== groupText + ":start") {
                      var dom = vnode.toDOM()
                      var keepChild = avalon.slice(dom.childNodes)
                      if (groupText.indexOf("each") === 0) {
                          avalon.clearHTML(parent)
                          parent.appendChild(dom)
                      } else {
                          parent.removeChild(node.nextSibling)
                          parent.replaceChild(dom, node)
                      }
                      updateEntity(keepChild, getRepeatChild(vnode.children), parent)
                      return false
                  } else {
                      // console.log("最小化更新 ",parent.nodeName)
                      var breakText = groupText + ":end"
                      var fragment = document.createDocumentFragment()
                      //将原有节点移出DOM, 试根据groupText分组
                      var froms = {}, index = 0, next
                      while (next = node.nextSibling) {
                          if (next.nodeValue === breakText) {
                              break
                          } else if (next.nodeValue === groupText) {
                              fragment.appendChild(next)
                              froms[index] = fragment
                              index++
                              fragment = document.createDocumentFragment()
                          } else {
                              fragment.appendChild(next)
                          }
                      }
  
                      //根据repeatCommand指令进行删增重排
                      var children = []
                      for (var from in vnode.repeatCommand) {
                          var to = vnode.repeatCommand[from]
                          if (to >= 0) {
                              children[to] = froms[from]
                          } else if (to < -1) {//-2 
                              if (froms[from]) { //循环利用要被销毁的真实节点
                                  children[from] = froms[from]
                              } else {//如果真实节点数量不足
                                  children[from] = vnode.children[from].toDOM()
                              }
                          }
                      }
                      fragment = document.createDocumentFragment()
                      for (var i = 0, el; el = children[i++]; ) {
                          fragment.appendChild(el)
                      }
  
                      var entity = avalon.slice(fragment.childNodes)
                      parent.insertBefore(fragment, node.nextSibling)
                      var virtual = []
                      vnode.children.forEach(function (el) {
                          pushArray(virtual, el.children)
                      })
                      updateEntity(entity, virtual, parent)
                      return false
                  }
              }
              return false
          },
          old: function (binding, oldValue) {
              if (!Array.isArray(oldValue)) {
                  var o = binding.oldValue = {}
                  for (var i in oldValue) {
                      if (oldValue.hasOwnProperty(i)) {
                          o[i] = oldValue[i]
                      }
                  }
              }
          }
      })
  
      function updateSignature(elem, value, text) {
          var group = value.split(":")[0]
          do {
              var nodeValue = elem.nodeValue
              if (elem.nodeType === 8 && nodeValue.indexOf(group) === 0) {
                  elem.nodeValue = nodeValue.replace(group, text)
                  if (nodeValue.indexOf(":last") > 0) {
                      break
                  }
              }
          } while (elem = elem.nextSibling)
      }
  
      var repeatItem = avalon.components["repeatItem"] = {
          construct: function (item, binding, repeatArray) {
              var top = binding.vmodel
              if (item && item.$id) {
                  top = createProxy(top, item)
              }
              var keys = [binding.keyName, binding.valueName, "$index", "$first", "$last"]
              this.valueName = binding.valueName
              var proxy = createRepeatItem(top, keys, repeatArray)
              this.vmodel = proxy
              this.children = createVirtual(this.template, true)
              this._new = true
              this.dispose = repeatItem.dispose
              return this
          },
          dispose: function () {
              disposeVirtual([this])
              var proxy = this.vmodel
              var item = proxy[this.valueName]
              proxy && (proxy.$active = false)
              if (item && item.$id) {
                  item.$active = false
              }
          }
      }
  
  
  
      function createRepeatItem(before, keys, repeatArray) {
          var heirloom = {}
          var after = {
              $accessors: {},
              $outer: 1
          }
          for (var i = 0, key; key = keys[i++]; ) {
              after.$accessors[key] = makeObservable(key, heirloom)
          }
          if (repeatArray) {
              after.$remove = noop
          }
          if (Object.defineProperties) {
              Object.defineProperties(after, after.$accessors)
          }
  
          return createProxy(before, after, heirloom)
      }
  
      function getRepeatChild(children) {
          var ret = []
          for (var i = 0, el; el = children[i++]; ) {
              if (el.__type__ === "repeatItem") {
                  pushArray(ret, el.children)
              } else {
                  ret.push(el)
              }
          }
          return ret
      }
  
      avalon.directives.each = avalon.directives.repeat
      avalon.components["ms-each"] = avalon.components["ms-repeat"]
  
  
      function compareObject(a, b) {
          var atype = avalon.type(a)
          var btype = avalon.type(a)
          if (atype === btype) {
              var aisVM = atype === "object" && a.$id
              var bisVM = btype === "object"
              var hasDetect = {}
              if (aisVM && bisVM) {
                  for (var i in a) {
                      hasDetect[i] = true
                      if ($$skipArray[i])
                          continue
                      if (a.hasOwnProperty(i)) {
                          if (!b.hasOwnProperty(i))
                              return false //如果a有b没有
                          if (!compareObject(a[i], b[i]))
                              return false
                      }
                  }
                  for (i in b) {
                      if (hasDetect[i]) {
                          continue
                      }//如果b有a没有
                      return false
                  }
                  return true
              } else {
                  if (btype === "date")
                      return a + 0 === b + 0
                  return a === b
              }
          } else {
              return false
          }
      }
  
      function isInCache(cache, vm) {
          var isObject = Object(vm) === vm, c
          if (isObject) {
              c = cache[vm.$id]
              if (c) {
                  delete cache[vm.$id]
              }
              return c
          } else {
              var id = avalon.type(vm) + "_" + vm
              c = cache[id]
              if (c) {
                  var stack = [{id: id, c: c}]
                  while (1) {
                      id += "_"
                      if (cache[id]) {
                          stack.push({
                              id: id,
                              c: cache[id]
                          })
                      } else {
                          break
                      }
                  }
                  var a = stack.pop()
                  delete cache[a.id]
                  return a.c
              }
              return c
          }
      }
  
      function saveInCache(cache, vm, component) {
          if (Object(vm) === vm) {
              cache[vm.$id] = component
          } else {
              var type = avalon.type(vm)
              var trackId = type + "_" + vm
              if (!cache[trackId]) {
                  cache[trackId] = component
              } else {
                  while (1) {
                      trackId += "_"
                      if (!cache[trackId]) {
                          cache[trackId] = component
                          break
                      }
                  }
              }
          }
      }
  
      avalon.directive("html", {
          change: function (value, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              value = typeof value === "string" ? value : String(value)
              disposeVirtual(vnode.children)
              var children = createVirtual(value, true)
              pushArray(vnode.children, updateVirtual(children, binding.vmodel))
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              var child = vnode.children[0]
              if (!child)
                  return
              //这里就不用劳烦用created, disposed
              avalon.clearHTML(node)
              node.appendChild(child.toDOM())
          }
      })
  
      var rremoveIf = /^ms-if$/
      avalon.directive("if", {
          is: function (a, b) {
              if (b === void 0)
                  return false
              return Boolean(a) === Boolean(b)
          },
          init: function (binding) {
              var vnode = binding.element
              var templale = toString(vnode,rremoveIf) //防止死循环
              var component = new VComponent("ms-if")
              component.template = templale
              component.props.ok = createVirtual(templale, true)[0]
              component.props.ng = new VComment("ms-if")
              var arr = binding.siblings
              for (var i = 0, el; el = arr[i]; i++) {
                  if (el === vnode) {
                      arr[i] = component
                      break
                  }
              }
              delete binding.siblings
              binding.vnode = component
              return false
          },
          change: function (value, binding) {
              var elem = binding.element
              if (!elem || elem.disposed)
                  return
              elem.ifValue = !!value
              if (value) {
                  elem.children[0] = elem.props.ok
                  updateVirtual([elem.props.ok], binding.vmodel)
              } else {
                  elem.children[0] = elem.props.ng
              }
              addHooks(this, binding)
  
          },
          update: function (node, vnode, parent) {
              var dom = node, vdom = vnode.children[0]
              if (!node.keep) {//保存之前节点的引用,减少反复创建真实DOM
                  var c = vdom.toDOM()
                  c.keep = node
                  node.keep = c
              }
              parent.replaceChild(node.keep, node)
              dom = node.keep
              if (dom.nodeType === 1) {
                  updateEntity([dom], [vdom], parent)
              }
              return false
          }
      })
  
  
      avalon.components["ms-if"] = {
          toDOM: function (self) {
              return self.children[0].toDOM()
          }
      }
  //ms-important绑定已经在scanTag 方法中实现
  
      var rnoscripts = /<noscript.*?>(?:[\s\S]+?)<\/noscript>/img
      var rnoscriptText = /<noscript.*?>([\s\S]+?)<\/noscript>/im
  
      var getXHR = function () {
          return new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP") // jshint ignore:line
      }
  //将所有远程加载的模板,以字符串形式存放到这里
      var templatePool = avalon.templateCache = {}
  
      avalon.directive("include", {
          init: function (binding) {
              var elem = binding.element
              var vmodel = binding.vmodel
              var loaded = getBindingValue(elem, "data-include-loaded", vmodel)
              binding.loaded = typeof loaded === "function" ? loaded : noop
              var rendered = getBindingValue(elem, "data-include-rendered", vmodel)
              binding.rendered = typeof rendered === "function" ? rendered : noop
  
              binding.expr = normalizeExpr(binding.expr.trim())
              disposeVirtual(elem.children)
          },
          change: function (id, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              addHooks(this, binding)
              if (binding.param === "src") {
                  if (typeof templatePool[id] === "string") {
                      scanTemplate(binding, templatePool[id], id)
                  } else if (Array.isArray(templatePool[id])) { //#805 防止在循环绑定中发出许多相同的请求
                      templatePool[id].push(binding)
                  } else {
                      var xhr = getXHR()
                      xhr.onreadystatechange = function () {
                          if (xhr.readyState === 4) {
                              var s = xhr.status
                              if (s >= 200 && s < 300 || s === 304 || s === 1223) {
                                  var text = xhr.responseText
                                  var arr = templatePool[id]
                                  templatePool[id] = text
                                  for (var f = 0, data; data = arr[f++]; ) {
                                      scanTemplate(data, text, id)
                                  }
  
                              } else {
                                  log("ms-include load [" + id + "] error")
                              }
                          }
                      }
                      templatePool[id] = [binding]
                      xhr.open("GET", id, true)
                      if ("withCredentials" in xhr) {
                          xhr.withCredentials = true
                      }
                      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                      xhr.send(null)
                  }
              } else {
                  var node = document.getElementById(id)
                  //IE系列与够新的标准浏览器支持通过ID取得元素（firefox14+）
                  //http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
                  if (node) {
                      var text = node.tagName === "TEXTAREA" ? node.value :
                          node.tagName === "SCRIPT" ? node.text :
                              node.tagName === "NOSCRIPT" ? getNoscriptText(node) :
                                  node.innerHTML
                      scanTemplate(binding, text.trim(), "id:" + id)
                  }
              }
  
          },
          update: function (node) {
              var first = node.firstChild
              if (node.childNodes.length !== 1 ||
                  first.nodeType !== 1 ||
                  !first.getAttribute("data-include-id")) {
                  avalon.clearHTML(node)
              }
          }
      })
  
  
      function scanTemplate(binding, template, id) {
          template = template.trim()
          var cache = binding.cache || (binding.cache = {})
          if (!cache[id]) {
              var nodes = createVirtual(template, true), throwError
              if (nodes.length !== 1) {
                  throwError = true
              } else {
                  updateVirtual(nodes, binding.vmodel)
                  if (nodes.length !== 1 || getVType(nodes[0]) !== 1) {
                      throwError = true
                  }
              }
              if (throwError) {
                  throw "ms-include加载的内容必须用一个元素包元素"
              }
              binding.cache[id] = nodes[0]
              nodes[0].props["data-include-id"] = id
          }
          var vnode = binding.element
          vnode.children.pop()
          vnode.children.push(binding.cache[id])
          addHook(vnode, function (elem) {
              binding.loaded(elem.firstChild)
          }, "change", 1051)
          addHook(vnode, updateTemplate, "change", 1052)
          addHook(vnode, function (elem) {
              binding.rendered(elem.firstChild)
          }, "afterChange", 1053)
          batchUpdateEntity(binding.vmodel)
      }
  
      function updateTemplate(elem, vnode) {
          if (!vnode.disposed) {
              return
          }
          var vdom = vnode.children[0]
          var id = vdom.props["data-include-id"]
          var cache = elem.cache || (elem.cache = {})
          if (!cache[id]) {
              cache[id] = vdom.toDOM()
          }
          var target = elem.firstChild
          if (!target) {
              elem.appendChild(cache[id])
          } else if (target.getAttribute("data-include-id") !== id) {
              elem.replaceChild(cache[id], target)
          }
      }
  
      function getNoscriptText(el) {
          //IE9-11与chrome的innerHTML会得到转义的内容，它们的innerText可以
          if (el.textContent && /\S+/.test(el.textContent)) {
              return el.textContent
          }
          //IE7-8 innerText,innerHTML都无法取得其内容，IE6能取得其innerHTML
          if (IEVersion === 6 || IEVersion > 8 || window.netscape) {
              return el.innerHTML
          }
          //IE7,IE8需要用AJAX请求得到当前页面进行抽取
          var xhr = getXHR()
          xhr.open("GET", location, false)
          xhr.send(null)
          //http://bbs.csdn.net/topics/390349046?page=1#post-393492653
          var noscripts = DOC.getElementsByTagName("noscript")
          var array = (xhr.responseText || "").match(rnoscripts) || []
          var n = array.length
          for (var i = 0; i < n; i++) {
              var tag = noscripts[i]
              if (tag) {
                  //IE6-8中noscript标签的innerHTML,innerText是只读的
                  //http://haslayout.net/css/noscript-Ghost-Bug
                  tag.style.display = "none"
                  tag.textContext = (array[i].match(rnoscriptText) || ["", "&nbsp;"])[1]
              }
          }
          return el.textContent
      }
  //基于事件代理的高性能事件绑定
      var rdash = /\(([^)]*)\)/
      avalon.directive("on", {
          priority: 3000,
          init: function (binding) {
              var value = binding.expr
              binding.type = "on"
              // ms-on-mousemove-10
              binding.param = binding.param.replace(/-\d+$/, "")
              if (value.indexOf("(") > 0 && value.indexOf(")") > -1) {
                  // aaa() aaa($event)当成aaa处理
                  var matched = (value.match(rdash) || ["", ""])[1].trim()
                  if (matched === "" || matched === "$event") {
                      value = value.replace(rdash, "")
                  }
              }
              binding.expr = value
              binding.element.dispose = disposeOn
          },
          change: function (listener, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              var type = binding.param
              var uuid = markID(listener)
              var key = type + ":" + uuid + "??"
              if (!avalon.__eventVM__[key]) {//注册事件回调
                  avalon.__eventVM__[key] = binding.vmodel
              }
              var change = addData(vnode, "changeEvents")// 创建一个更新包
              change[key] = listener
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              if (!vnode.disposed) {
                  vnode._ = node
                  for (var key in vnode.changeEvents) {
                      var type = key.split(":").shift()
                      var listener = vnode.changeEvents[key]
                      avalon.bind(node, type, listener)
                  }
                  delete vnode.changeEvents
              }
          }
      })
  
      function disposeOn() {
          if (this._) {
              avalon.unbind(this._)
              this._ = null
          }
      }
  
  
  
      /*********************************************************************
       *                         各种指令                                  *
       **********************************************************************/
  
  //ms-skip绑定已经在scanTag 方法中实现
  
      avalon.directive("text", {
          change: function (value, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              value = typeof value === "string" ? value : String(value)
              disposeVirtual(vnode.children)
              var children = [new VText(value)]
              pushArray(vnode.children, updateVirtual(children, binding.vmodel))
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              var child = vnode.children[0]
              if (!child) {
                  return
              }
              if ("textContent" in node) {
                  node.textContent = child.toHTML()
              } else {
                  node.innerText = child.toHTML()
              }
          }
      })
  
      function parseDisplay(nodeName, val) {
          //用于取得此类标签的默认display值
          var key = "_" + nodeName
          if (!parseDisplay[key]) {
              var node = DOC.createElement(nodeName)
              root.appendChild(node)
              if (W3C) {
                  val = getComputedStyle(node, null).display
              } else {
                  val = node.currentStyle.display
              }
              root.removeChild(node)
              parseDisplay[key] = val
          }
          return parseDisplay[key]
      }
  
      avalon.parseDisplay = parseDisplay
  
      avalon.directive("visible", {
          init: noop,
          is: function (a, b) {
              return Boolean(a) === Boolean(b)
          },
          change: function (val, binding) {
              var vnode = binding.element
              if (!vnode || vnode.disposed)
                  return
              vnode.isShow = val
              addHooks(this, binding)
          },
          update: function (node, vnode) {
              if (vnode.isShow) {
                  node.style.display = vnode.displayValue || ""
                  if (avalon(node).css("display") === "none") {
                      node.style.display = vnode.displayValue = parseDisplay(node.nodeName)
                  }
              } else {
                  node.style.display = "none"
              }
          }
      })
      /*********************************************************************
       *                             自带过滤器                             *
       **********************************************************************/
  
      var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim
      var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
      var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig
      var rsanitize = {
          a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
          img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
          form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
      }
      var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
      var rnoalphanumeric = /([^\#-~| |!])/g;
  
      function numberFormat(number, decimals, point, thousands) {
          //form http://phpjs.org/functions/number_format/
          //number 必需，要格式化的数字
          //decimals 可选，规定多少个小数位。
          //point 可选，规定用作小数点的字符串（默认为 . ）。
          //thousands 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
          number = (number + '')
              .replace(/[^0-9+\-Ee.]/g, '')
          var n = !isFinite(+number) ? 0 : +number,
              prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
              sep = thousands || ",",
              dec = point || ".",
              s = '',
              toFixedFix = function (n, prec) {
                  var k = Math.pow(10, prec)
                  return '' + (Math.round(n * k) / k)
                          .toFixed(prec)
              }
          // Fix for IE parseFloat(0.55).toFixed(0) = 0;
          s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
              .split('.')
          if (s[0].length > 3) {
              s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
          }
          if ((s[1] || '')
                  .length < prec) {
              s[1] = s[1] || ''
              s[1] += new Array(prec - s[1].length + 1)
                  .join('0')
          }
          return s.join(dec)
      }
  
      function escape(str) {
          //将字符串经过 str 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt 
          return String(str).
              replace(/&/g, '&amp;').
              replace(rsurrogate, function (value) {
                  var hi = value.charCodeAt(0)
                  var low = value.charCodeAt(1)
                  return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
              }).
              replace(rnoalphanumeric, function (value) {
                  return '&#' + value.charCodeAt(0) + ';'
              }).
              replace(/</g, '&lt;').
              replace(/>/g, '&gt;')
      }
      var filters = avalon.filters = {
          uppercase: function (str) {
              return str.toUpperCase()
          },
          lowercase: function (str) {
              return str.toLowerCase()
          },
          truncate: function (str, length, truncation) {
              //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
              length = length || 30
              truncation = typeof truncation === "string" ? truncation : "..."
              return str.length > length ? str.slice(0, length - truncation.length) + truncation : String(str)
          },
          camelize: camelize,
          //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
          //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a> 
          //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
          //    <a href="jav	ascript:alert('XSS');">IE67chrome</a>
          //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
          //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
          sanitize: function (str) {
              return str.replace(rscripts, "").replace(ropen, function (a, b) {
                  var match = a.toLowerCase().match(/<(\w+)\s/)
                  if (match) { //处理a标签的href属性，img标签的src属性，form标签的action属性
                      var reg = rsanitize[match[1]]
                      if (reg) {
                          a = a.replace(reg, function (s, name, value) {
                              var quote = value.charAt(0)
                              return name + "=" + quote + "javascript:void(0)" + quote// jshint ignore:line
                          })
                      }
                  }
                  return a.replace(ron, " ").replace(/\s+/g, " ") //移除onXXX事件
              })
          },
          escape: escape,
          currency: function (amount, symbol, fractionSize) {
              return (symbol || "\uFFE5") + numberFormat(amount, isFinite(fractionSize) ? fractionSize : 2)
          },
          number: numberFormat
      }
  
      /*
       'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
       'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
       'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
       'MMMM': Month in year (January-December)
       'MMM': Month in year (Jan-Dec)
       'MM': Month in year, padded (01-12)
       'M': Month in year (1-12)
       'dd': Day in month, padded (01-31)
       'd': Day in month (1-31)
       'EEEE': Day in Week,(Sunday-Saturday)
       'EEE': Day in Week, (Sun-Sat)
       'HH': Hour in day, padded (00-23)
       'H': Hour in day (0-23)
       'hh': Hour in am/pm, padded (01-12)
       'h': Hour in am/pm, (1-12)
       'mm': Minute in hour, padded (00-59)
       'm': Minute in hour (0-59)
       'ss': Second in minute, padded (00-59)
       's': Second in minute (0-59)
       'a': am/pm marker
       'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
       format string can also be one of the following predefined localizable formats:
  
       'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
       'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
       'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
       'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
       'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
       'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
       'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
       'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
       */
      new function () {// jshint ignore:line
          function toInt(str) {
              return parseInt(str, 10) || 0
          }
  
          function padNumber(num, digits, trim) {
              var neg = ""
              if (num < 0) {
                  neg = '-'
                  num = -num
              }
              num = "" + num
              while (num.length < digits)
                  num = "0" + num
              if (trim)
                  num = num.substr(num.length - digits)
              return neg + num
          }
  
          function dateGetter(name, size, offset, trim) {
              return function (date) {
                  var value = date["get" + name]()
                  if (offset > 0 || value > -offset)
                      value += offset
                  if (value === 0 && offset === -12) {
                      value = 12
                  }
                  return padNumber(value, size, trim)
              }
          }
  
          function dateStrGetter(name, shortForm) {
              return function (date, formats) {
                  var value = date["get" + name]()
                  var get = (shortForm ? ("SHORT" + name) : name).toUpperCase()
                  return formats[get][value]
              }
          }
  
          function timeZoneGetter(date) {
              var zone = -1 * date.getTimezoneOffset()
              var paddedZone = (zone >= 0) ? "+" : ""
              paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
              return paddedZone
          }
          //取得上午下午
  
          function ampmGetter(date, formats) {
              return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
          }
          var DATE_FORMATS = {
              yyyy: dateGetter("FullYear", 4),
              yy: dateGetter("FullYear", 2, 0, true),
              y: dateGetter("FullYear", 1),
              MMMM: dateStrGetter("Month"),
              MMM: dateStrGetter("Month", true),
              MM: dateGetter("Month", 2, 1),
              M: dateGetter("Month", 1, 1),
              dd: dateGetter("Date", 2),
              d: dateGetter("Date", 1),
              HH: dateGetter("Hours", 2),
              H: dateGetter("Hours", 1),
              hh: dateGetter("Hours", 2, -12),
              h: dateGetter("Hours", 1, -12),
              mm: dateGetter("Minutes", 2),
              m: dateGetter("Minutes", 1),
              ss: dateGetter("Seconds", 2),
              s: dateGetter("Seconds", 1),
              sss: dateGetter("Milliseconds", 3),
              EEEE: dateStrGetter("Day"),
              EEE: dateStrGetter("Day", true),
              a: ampmGetter,
              Z: timeZoneGetter
          }
          var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/
          var raspnetjson = /^\/Date\((\d+)\)\/$/
          filters.date = function (date, format) {
              var locate = filters.date.locate,
                  text = "",
                  parts = [],
                  fn, match
              format = format || "mediumDate"
              format = locate[format] || format
              if (typeof date === "string") {
                  if (/^\d+$/.test(date)) {
                      date = toInt(date)
                  } else if (raspnetjson.test(date)) {
                      date = +RegExp.$1
                  } else {
                      var trimDate = date.trim()
                      var dateArray = [0, 0, 0, 0, 0, 0, 0]
                      var oDate = new Date(0)
                      //取得年月日
                      trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function (_, a, b, c) {
                          var array = c.length === 4 ? [c, a, b] : [a, b, c]
                          dateArray[0] = toInt(array[0])     //年
                          dateArray[1] = toInt(array[1]) - 1 //月
                          dateArray[2] = toInt(array[2])     //日
                          return ""
                      })
                      var dateSetter = oDate.setFullYear
                      var timeSetter = oDate.setHours
                      trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function (_, a, b, c, d) {
                          dateArray[3] = toInt(a) //小时
                          dateArray[4] = toInt(b) //分钟
                          dateArray[5] = toInt(c) //秒
                          if (d) {                //毫秒
                              dateArray[6] = Math.round(parseFloat("0." + d) * 1000)
                          }
                          return ""
                      })
                      var tzHour = 0
                      var tzMin = 0
                      trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function (z, symbol, c, d) {
                          dateSetter = oDate.setUTCFullYear
                          timeSetter = oDate.setUTCHours
                          if (symbol) {
                              tzHour = toInt(symbol + c)
                              tzMin = toInt(symbol + d)
                          }
                          return ""
                      })
  
                      dateArray[3] -= tzHour
                      dateArray[4] -= tzMin
                      dateSetter.apply(oDate, dateArray.slice(0, 3))
                      timeSetter.apply(oDate, dateArray.slice(3))
                      date = oDate
                  }
              }
              if (typeof date === "number") {
                  date = new Date(date)
              }
              if (avalon.type(date) !== "date") {
                  return
              }
              while (format) {
                  match = rdateFormat.exec(format)
                  if (match) {
                      parts = parts.concat(match.slice(1))
                      format = parts.pop()
                  } else {
                      parts.push(format)
                      format = null
                  }
              }
              parts.forEach(function (value) {
                  fn = DATE_FORMATS[value]
                  text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
              })
              return text
          }
          var locate = {
              AMPMS: {
                  0: "上午",
                  1: "下午"
              },
              DAY: {
                  0: "星期日",
                  1: "星期一",
                  2: "星期二",
                  3: "星期三",
                  4: "星期四",
                  5: "星期五",
                  6: "星期六"
              },
              MONTH: {
                  0: "1月",
                  1: "2月",
                  2: "3月",
                  3: "4月",
                  4: "5月",
                  5: "6月",
                  6: "7月",
                  7: "8月",
                  8: "9月",
                  9: "10月",
                  10: "11月",
                  11: "12月"
              },
              SHORTDAY: {
                  "0": "周日",
                  "1": "周一",
                  "2": "周二",
                  "3": "周三",
                  "4": "周四",
                  "5": "周五",
                  "6": "周六"
              },
              fullDate: "y年M月d日EEEE",
              longDate: "y年M月d日",
              medium: "yyyy-M-d H:mm:ss",
              mediumDate: "yyyy-M-d",
              mediumTime: "H:mm:ss",
              "short": "yy-M-d ah:mm",
              shortDate: "yy-M-d",
              shortTime: "ah:mm"
          }
          locate.SHORTMONTH = locate.MONTH
          filters.date.locate = locate
      }// jshint ignore:line
  
      /*********************************************************************
       *                           DOMReady                                *
       **********************************************************************/
          /*
           var readyList = [],
           isReady
           var fireReady = function (fn) {
           isReady = true
           var require = avalon.require
           if (require && require.checkDeps) {
           modules["domReady!"].state = 4
           require.checkDeps()
           }
           while (fn = readyList.shift()) {
           fn(avalon)
           }
           }
           function doScrollCheck() {
           try { //IE下通过doScrollCheck检测DOM树是否建完
           root.doScroll("left")
           fireReady()
           } catch (e) {
           setTimeout(doScrollCheck)
           }
           }
           if (DOC.readyState === "complete") {
           setTimeout(fireReady) //如果在domReady之外加载
           } else if (W3C) {
           DOC.addEventListener("DOMContentLoaded", fireReady)
           } else {
           DOC.attachEvent("onreadystatechange", function () {
           if (DOC.readyState === "complete") {
           fireReady()
           }
           })
           try {
           var isTop = window.frameElement === null
           } catch (e) {}
           if (root.doScroll && isTop && window.external) { //fix IE iframe BUG
           doScrollCheck()
           }
           }
           avalon.bind(window, "load", fireReady)
           avalon.ready = function (fn) {
           if (!isReady) {
           readyList.push(fn)
           } else {
           fn(avalon)
           }
           }
           avalon.config({
           loader: true
           })
           avalon.ready(function () {
           avalon.scan(DOC.body)
           })
           */
  
      ;(function () {
          avalon.config({
              loader: false
          })
          var fns = [], loaded = DOC.readyState === "complete", fn
          function flush(f) {
              loaded = 1
              while (f = fns.shift())
                  f()
          }
  
          avalon.bind(DOC, "DOMContentLoaded", fn = function () {
              avalon.unbind(DOC, "DOMContentLoaded", fn)
              flush()
          })
  
          var id = setInterval(function () {
              if (document.readyState === "complete" && document.body) {
                  clearInterval(id)
                  flush()
              }
          }, 50)
  
          avalon.ready = function (fn) {
              loaded ? fn(avalon) : fns.push(fn)
          }
          avalon.ready(function () {
              avalon.scan(DOC.body)
          })
      })()
  
  
  // Register as a named AMD module, since avalon can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase avalon is used because AMD module names are
  // derived from file names, and Avalon is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of avalon, it will work.
  
  // Note that for maximum portability, libraries that are not avalon should
  // declare themselves as anonymous modules, and avoid setting a global if an
  // AMD loader is present. avalon is a special case. For more information, see
  // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
      if (typeof define === "function" && define.amd) {
          define("avalon", [], function() {
              return avalon
          })
      }
  // Map over avalon in case of overwrite
      var _avalon = window.avalon
      avalon.noConflict = function(deep) {
          if (deep && window.avalon === avalon) {
              window.avalon = _avalon
          }
          return avalon
      }
  // Expose avalon identifiers, even in AMD
  // and CommonJS for browser emulators
      if (noGlobal === void 0) {
          window.avalon = avalon
      }
      return avalon
  
  }));

});
