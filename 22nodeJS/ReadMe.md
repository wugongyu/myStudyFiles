# Node.js further study

## Node

### NODEJS的由来

  什么是Node?——**node是一个javascript（严格来说是ecmascript）运行时（runtime）**，runtime即运行时组件，可理解为一种**编程语言的运行环境**，这个运行环境包括运行代码所需要的编译器（解释器）以及操作系统的底层支持等。

  node底层使用C++实现，语法则是遵循ecmascript规范。

  实际上, javascript一早就能运行在前后端,但后续javascript在web应用中盛行,javascript能在服务端中运行的这件事也渐渐被淡忘.

  node的出现,将服务器端javascript这个领域重新焕新.

### 选用JS实现node

  设计高性能web服务器的几个要点：**事件驱动、非阻塞I/O**。

  考虑到**高性能、符合事件驱动、没有历史包袱**这三个主要原因，JavaScript成为了Node的实现语言。

  node的实现者起初将其项目称为web.js，目标为web服务器，后续项目发展变成了**构建网络应用的框架**。node发展为一个**强制不共享任何资源的单线程、单进程系统**，包含适宜网络的库，为构建大型分布式应用程序提供基础设施，目标是成为一个**构建快速、可伸缩的网络应用平台**。
  通过**通信协议**来组织许多node，从而通过**扩展**来达成构建大型网络应用的目的，每个**Node进程都构成这个网络应用的节点**。

### 浏览器与node

  node 与 chrome浏览器相比，除了HTML、Webkit和显卡这些ui技术没有支持外，Node结构与chrome十分相似（javascript，v8等）。

  **浏览器和Node都是基于事件驱动的异步架构**，浏览器通过事件驱动来服务界面上的交互，Node通过事件驱动来服务I/O。

  在node中，js可以访问本地文件，搭建微博socket服务器，可以连接数据库，可以向web workers一样玩转多进程。

  node不处理UI，但用 与浏览器相同的机制和原理运行。

  node打破了js只能在浏览器中运行的局面，**前后端编程环境统一，可以大大降低前后端转换所需要的上下文交换代价**。

### Node的特点

  1. 异步I/O
  Node底层构建了众多异步I/O，如文件读取、网络请求等。

  2. 事件与回调函数
  事件的编程方式具有轻量级、松耦合、只关注事务点等优势。
  回调函数是最好的接受异步调用返回数据的方式。

  3. 单线程
  Node保持了js在浏览器中的单线程的特点。**在Node中，js与其余线程是无法共享任何状态的**。

  单线程优点：
    - 不用在意状态的问题
    - 不存在死锁的情况
    - 没有上下文交换所带来的性能上的开销

  单线程的缺点：
    - 无法利用多核CPU
    - 错误会引起整个应用退出，应用的健壮性值得考验
    - 大量计算占用CPU导致无法继续调用异步I/O

  解决方案：
    node采用了与web workers相同的思路来解决单线程中大计算量的问题——child_process（子进程）。
    通过**将计算分发给各个子进程**，将大量计算分解掉，再通过**进程之间的事件消息来传递结果**，从而很好地保持应用模型的简单和低依赖。通过master-worker的管理方式，可以很好地管理各个工作进程，以达到更高的健壮性。
  4. 跨平台
  兼容windows和*nix平台主要得益于node在架构层面的改动，它在操作系统与Node上层模块系统之间构建了一层平台层架构，即libuv。libuv已成为许多系统实现跨平台的基础组件。

### Node的应用场景

  1. I/O密集型
    Node面向网络且擅长并行I/O，能够**有效地组织起更多地硬件资源，从而提供更多好的服务**。
    I/O密集地优势主要在于**Node利用事件循环的处理能力**， 而非启动每一个线程为每一个请求服务，资源占用极少。

  2. CPU密集型
    Node提供了一下两种方式来充分利用CPU
    - Node可以通过编写C/C++扩展的方式更高效地利用CPU，将一些v8不能做到性能极致地地方通过C/C++来实现。

    - 若单线程的Node不能满足需求，且用C/C++拓展后还觉得不够，可通过子进程方式，将一部分的Node进程当作常驻服务进程用于计算，然后利用进程间的消息来传递结果，将计算与I/O分离，充分利用多CPU。

    CPU密集不可怕，合理调度是诀窍。

## 模块机制

  JS的变迁：工具类库（用于浏览器兼容）-> 组件（实现功能模块）-> 框架（功能模块组织）-> 应用（业务模块组织）

  JS被不断地类聚和抽象，以更好地组织业务逻辑，但JS先天缺乏一项功能：模块。

  在不断发展中，社区提出的Commonjs规范乃是服务端js的重要发展里程碑。

### CommonJS规范

  **【注意】现代新项目中常用[esmodule](./esModuleReadme.md)，commonjs或会逐渐被esmodule替代**。
  
  对于JS自身而言，它的规范是薄弱的，有以下缺陷：

  1. 没有模块系统；
  2. 标准库较少；（ECMAScript仅定义了部分核心库，没有文件系统，I/O流等标准API；HTML5在W3C标准化下推进发展，但仅限于浏览器端）
  3. 没有标准接口；（JS中没有定义过web服务器或者数据库之类的标准统一接口）
  4. 缺乏包管理系统；（JS应用中基本没有自动加载和安装依赖的能力）

  而CommonJs规范的提出，正是为了弥补以上所提到的缺陷。目的是**用CommonJS API写出可以具备跨宿主环境执行的能力**，这样不仅可以利用JS开发富客户端应用，还可以编写一下应用：

  1. 服务端js应用程序；
  2. 命令行工具；
  3. 桌面图形界面应用程序；
  4. 混合应用。

  CommonJS规范涵盖了：模块、二进制、Buffer、字符集编码、I/O流、进程环境、文件系统、套接字、单元测试、web服务器网关接口、包管理等。

#### 1. CommonJS的模块规范

  CommonJS对模块的定义: 模块引入、模块定义、模块标识。

  1. 模块引入
  使用require关键字引入模块
  2. 模块定义
  在模块内使用**require**引入外部模块，
  使用**exports**对象用于导出当前模块的方法或变量，并且它是唯一导出的出口。
  模块中存在一个**module对象**，它代表模块自身。
  exports为module对象的属性。
  在node中，**一个文件就是一个模块**，将方法挂在在exports对象上作为属性即可定义导出的方式。
  3. 模块标识
  模块标识即为传递给require的参数，它必须是符合小驼峰命名的字符串，或者是以.、 ..开头的相对路径，或者绝对路径，可以省略文件名后缀.js。

    ```javascript
    var math = require('math');
    ```

模块的意义在于将类聚的方法和变量等限定在私有的作用域中，同时支持引入和导出功能以顺畅地连接上下游依赖。每个模块具有独立的空件，互不干扰。

### Node的模块实现

  在node中引入模块的步骤：

  1. 路径分析
  2. 文件定位
  3. 编译执行

  在node中，模块分为两类:

  1. 核心模块
  由Node提供的模块，核心模块在Node源代码的编译过程中，编译进了二进制执行文件。在node进程启动时，部分核心模块就被直接加载进内存中，所以引入这部分核心模块时可以**省略文件定位和编译执行步骤**，并且在路径分析中优先判断，所以它的**加载速度是最快的**。
  2. 文件模块
  用户编写的模块，在运行时动态加载，需要完整的路径分析，文件定位，编译执行过程，速度比核心模块慢。

#### 优先从缓存加载

  像浏览器会缓存静态脚本文件以提高性能，**Node会对引入过的模块进行缓存**，以减少二次引入时的开销，不同于浏览器仅仅缓存文件，node缓存的是编译和执行之后的对象。

  【注意】不论核心模块还是文件模块，对于相同模块的二次加载，require方法一律采用**缓存优先的方法，这是第一优先级的**。**不同之处在于核心模块的缓存检查优先于文件模块的缓存检查**。

#### 路径分析和文件定位

- 路径分析——模块标识符

  模块标识符类型：

  1. 核心模块，如http、fs、path等
  **核心模块的优先级仅次于缓存加载。**
  注意，试图加载一个与核心模块标识符相同的自定义模块是不会成功的。

  2. .或..开始的相对路径文件模块
  require方法会将路径转为真实路径，并以真实路径作为索引，将编译执行后的结果放到缓存中，使二次加载时更快。

  3. 以/开始的绝对路径文件模块
  4. 非路径形式的文件模块，如自定义的connect模块。

- 路径分析——模块路径
  模块路径是Node在定位文件模块的具体文件时指定的查找策略，具体表现为一个路径组成的数组。
  模块路径的生成规则：
  1. 当前文件目录下的node_modules目录
  2. 父目录下的node_modules目录
  3. 父目录的父目录下的node_modules目录
  4. 沿路径向上逐级递归，知道根目录下的node_modules目录
  它的生成方式和js的原型链和作用域链的查找非常相似。可以看出当前文件的路径越深，模块查找的耗时越多，因此自定义模块的加载速度时最慢的。

- 文件定位——文件扩展名分析
  require()在分析标识符的过程中，会出现标识符中不包含文件扩展名的情况。CommonJS模块规范允许**标识符中不包含文件扩展名，这种情况下，node会按.js、.json、.node的次序扩展名，依次尝试**。在尝试过程中，需调用fs模块同步阻塞式地判断文件是否存在，为缓解node单线程阻塞式调用的缺陷，对于.node、.json文件，传递给require()时加上扩展名，又或是同步配合缓存。

- 文件定位——目录分析和包
  在分析标识符的过程中，require()通过分析文件扩展名可能会得到一个目录，此时**node会将目录当作一个包处理**。
  node包解析过程：
  1. node在当前目录下**查找package.json**，通过JSON.parse解析出包描述对象，从中提**取出main属性指定的文件名进行定位**。如果文件名缺少扩展名，则进入扩展名分析步骤。
  2. 若main指定的文件名错误，或是压根没有package.json文件，**node会将index作为默认文件名，依次查找index.js、index.json、index.node**。
  3. 在目录分析中没有定位成功任何文件，则自定义模块进入下一个模块路径进行查找，若**模块路径数组遍历完毕依旧没找到目标文件，则抛出查找失败异常**。

#### 模块编译

  编译和执行为引入文件模块的最后一个阶段，定位到具体文件后，**node会新建一个模块对象，然后根据路径载入并编译**。
  对于不同的文件扩展名，其载入方法也有所不同：

  1. .js文件。通过fs模块同步读取文件后编译执行。
  2. .node文件。这是用C/C++编写的扩展文件，通过dlopen()方法加载最后编译生成的文件。
  3. .json文件。通过fs模块同步读取文件后，用JSON.parse()方法解析返回结果
  4. 其余扩展名文件。它们都被当做.js文件载入。

  **每一个编译成功的模块都会将其文件路径作为索引缓存在Module._cache对象上，以提高二次引入的性能**。

  根据不同的文件扩展名，node会调用不同的读取方式，在代码中调用require.extension可以知道系统中已有的扩展加载方式。

- js模块的编译
  在编译的过程中，**node对获取的javascript文件内容进行了头尾包装**。
  在头部添加了(function(exports, require, module, __filename,__dirname){\n，
  在尾部添加了\n}).

  这样每个模块文件之间都进行了**作用域隔离**，包装之后的代码会通过vm原生模块的**runInThisContext()方法执行**（类似eval，但具有明确上下文，不污染全局），返回具体的function对象，最后，将当前模块对象的exports属性、require()方法、module（模块对象自身）、__filename（完整文件路径）、__dirname（文件目录）**作为参数传递给这个function()执行**。

- C/C++模块的编译
  .node模块文件并不需要编译，它是编写C/C++模块之后编译生成的，所以这里只有加载和执行的过程。**在执行的过程中，模块的exports对象与.node模块产生联系，然后返回给调用者。**

- JSON文件的编译
  Node利用fs模块同步读写JSON文件的内容后，调用JSON.parse()方法得到对象，然后将它赋值给模块对象的exports，以供外部调用。

### 核心模块

#### Javascript核心模块的编译过程

  在编译所有C/C++文件之前，编译程序需要将所有的JavaScript模块文件编译为C/C++代码（非可执行代码）。

  1. 转存为C/C++代码
    node采用了V8附带的js2c.py工具，将所有内置的javascript代码（src/node.js和lib/*.js）转化为C++里的数组，生成node_natives.h头文件。

  2. 编译javascript核心模块
    引入核心模块的过程中也经历**头尾包装**的过程，与文件模块区别在于：
    js核心模块获取源代码的方式是从内存中加载的，其源文件通过process.binding('natives')取出，编译成功的核心模块缓存到NativeModule_cache上，
    文件模块则缓存到Module._cache。

#### C/C++核心模块的编译过程

  核心模块中，有些模块全由C/C++编写；有些则**由C/C++完成核心部分（主内），其他部分则由JavaScript实现包装或向外导出（主外）**，这种封装模式是Node能够**提高性能**的常见方式。

  因为通常，脚本语言（js）的开发速度由于静态语言（C/C++），但其性能弱于静态语言，**node这种复合模式可以在开发速度与性能之间找到平衡点**。

  由纯C/C++编写的部分统一成为**内建模块**。Node中的buffer、crypto、 evals、 fs、 os等模块都是部分通过C/C++编写的。

  1. 内建模块组织形式
    每一个内建模块在定义之后，都通过NODE_MODULE宏将模块定义到node命名空间中，模块的具体初始化挂载为结构的register_func成员。node_extension.h文件将这些散列的内建模块统一放进了一个叫node_module_list的数组中。node提供了get_builtin_module()方法从node_module_list数组中取出这些模块。

    **内建模块的优势**：
      - 本身**由C/C++编写**，性能上优于脚本语言
      - 文件编译时，被编译为**二进制脚本**，node开始执行时，被**直接加载进内存**中，无需再次做标识符定位、文件定位、编译等过程，直接可执行。

  2. 内建模块的导出
    在node所有模块类型中，文件模块可能依赖核心模块，核心模块可能依赖内建模块。
    node在启动时，会生成一个全局变量process，并提供binding()方法来协助加载内建模块。

    在加载内建模块时，先创建一个exports空对象，然后调用get_builtin_module()方法取出内建模块对象，通过执行register_func填充exports对象，最后将exports对象按模块名缓存，并返回给调用方完成导出。

### C/C++扩展模块

  C/C++扩展模块对于解决性能瓶颈有着极大的帮助。
  C/C++扩展模块属于文件模块中的一类。
  C/C++模块通过预先编译为.node文件，然后调用process.dlopen()方法加载执行。

#### 扩展模块在不同平台上的编译和加载过程

  *nix平台：C/C++源码 --> g++/gcc --编译源码--> .so文件 --生成.node文件--> 加载.so文件 --dlopen()加载--> 导出给javascript

  windows平台：C/C++源码 --> VC++ --编译源码--> .dll文件 --生成.node文件--> 加载.dll文件 --dlopen()加载--> 导出给javascript

#### 编写C/C++扩展模块的前提条件

- GYP项目生成器，生成各个平台下的项目文件
- V8引擎C++库，node自身的动力来源之一
- libuv库，node自身的动力来源之二
- node内部库
- 其他库

### C/C++扩展模块的编译

  扩展模块通过GYP工具进行编译，编写一份.gyp文件后，使用node-gyp configure命令创建build目录，并生成系统相关的项目文件，在*nix平台下，build目录中会出现makefile等文件，在windows下，则会生成vcxproj等文件。
  编译过程会根据平台不同，分别通过make或vcbuild进行编译，编译完成后在build/release目录下生成.node文件。

#### C/C++扩展模块的加载

  得到.node文件后，require()方法通过解析标识符、路径分析、文件定位，然后加载执行。

  C/C++扩展模块与JavaScript模块的区别在于：**加载之后不需要编译**，直接执行之后就可以被外部调用了，其**加载速度比javascript模块略快**。

  【使用C/C++扩展模块的好处】
  更灵活与动态地加载模块，保持node模块自身简单性，给予node无限可能性。
  
### 模块调用栈

  文件模块： JavaScript模块，C/C++扩展模块
  核心模块： JavaScript模块，C/C++内建模块

### 包与NPM

  node组织了自身的核心模块，也使得第三方文件模块可以有序地编写和使用。在模块之外，**包和NPM是将模块联系起来的一种机制**。

  node对模块规范的实现（CommonJS包规范），一定程度上**解决了变量依赖、依赖关系等代码组织性问题**。

  CommonJS的包规范：由包结构、包描述文件组成。

#### 包结构

  包结构用于组织包中的各种文件。

#### 包描述文件

包描述文件为JSON格式的文件——package.json
用于描述包的相关信息。

package.json必需字段

- name 包名
- description 包简介
- version 版本号
- keywords 关键词数组
- maintainers包维护者列表
- contributors 贡献者列表
- bugs 反馈bug的网页地址或邮件地址
- licenses 当前包所使用的许可证列表
- repositories 托管源代码的位置列表
- dependencies **当前包所依赖的包列表【重要！！】**

可选字段

- homepage 当前包网站地址
- os 操作系统支持列表
- cpu CPU架构支持列表
- engine 支持的JavaScript引擎列表
- builtin 标志当前包是否是内建在底层系统的标准组件
- directories 包目录说名
- implements 实现规范的列表，标志当前包实现了CommonJS的哪些规范
- scripts 脚本说明对象，**其主要被包管理器用来安装、编译、测试和卸载包**

**NPM实际需要的字段**主要有：name、version、description、keywords、repositories、author、bin、main、scripts、engines、dependencies、devDependencies

- author 包作者
- bin 使得**包可以作为命令行工具使用**，配置好bin字段后，通过npm install package_name -g命令可以将脚本添加到执行路径中，之后可以在命令行直接执行。
- main **模块引入方法require()在引入包时，会优先检查这个字段**，并将其作为包中其余模块的入口，若不存在这个字段，require()会查找包目录下的index.js、index.node、index.json文件作为默认入口
- devDependencies **一些模块只在开发时需要依赖**，该属性可提示包的后续开发者安装依赖包。

#### NPM常用功能

- 查看帮助：npm help
- 安装依赖包： npm install [package-name]
- npm钩子命令： npm [scripts中定义的字段命令]， scripts字段的提出就是让包在安装或卸载的过程中提供钩子机制。
- 发布包（编写模块、初始化包描述文件（npm init）、npm addUser注册仓库账号、上传包（npm publish）、安装包、分析包）

#### 局域NPM

  所谓局域NPM，即企业搭建自己的NPM仓库，这样不仅能能够享受到NPM上众多的包，同时也能对自己的包进行保密和限制。

  局域NPM仓库的搭建方法与搭建镜像站的方式几乎一样。
  与镜像仓库不同的地方在于，企业局域NPM可以选择不同步官方源仓库中的包。

#### NPM潜在问题

  鉴于开户人员水平不一，NPM平台上的包的质量也良莠不齐，而且Node代码可以运行在服务器端，需要考虑安全问题。

### 前后端共用模块

  Node的出现，让js比别的编程语言多了一项优势：即一些模块可以在前后端实现公用，因为很多API在各个宿主环境下都提供。

  浏览器端：浏览器端的js需要经历从同一个服务器端分发到多个客户端执行。（通过网络加载代码，瓶颈为带宽问题）
  服务器端：服务器端的js则是相同的代码需要多次执行。（从磁盘中加载，瓶颈为CPU和内存等资源）

#### AMD规范

    node的模块的引入过程几乎都是同步的，但如果前端模块也采用同步方式引入，将会在用户体验上造成很大问题，鉴于网络的原因，COMMONJS为后端js制定的规范并不完全是和前端的应用场景，由此，AMD规范（Asynchronous Module Definition）——异步模块定义在前端应用场景中脱颖而出。

    AMD规范是COMMONJS规范的一个延伸。

    AMD规范中，需要使用define来明确定义一个模块，通过形参传递依赖到模块内容中

  ```js
    define(id?, dependencies?, factory);

    define(function(){
      var exports = {}
      exports.sayHello = function() {
        alert('Hello from module：' + module.id);
      };
      return exports
    })
  ```

#### CMD规范

  CMD规范与AMD规范的主要区别在于定义模块和依赖引入的部分。

  AMD需要在声明模块的时候指定所有的依赖，通过形参传递依赖到模块内容中：

  ```js
  define(['dep1', 'dep2'], function(dep1, dep2) {
    return function() {};
  })
  ```

  CMD则更接近与Ndde在CommonJS规范的定义，在依赖部分，CMD支持动态引入,
  require、exports、module通过形参传递给模块，在需要依赖模块时，随时调用require()
  引入即可。

  ```js
  define(function(require, exports, module) {

  });
  ```

## 异步I/O

  把异步作为主要编程方式和设计理念的，Node是首个。

  与Node事件驱动、异步I/O设计理念比较相近的一个知名产品为Nginx，Nginx采用纯C编写，性能表现优异，区别在于，Nginx具备面向客户端管理连接的强大能力，但它的背后依然受限于各种同步方式的编程语言。但**node却是全方位的，既可以作为服务器区处理客户端带来的大量并发请求，也能作为客户端向网路中的各个应用进行并发请求。**

异步I/O的必要性：

- 提高用户体验
  页面获取资源时，通过异步，消除ui阻塞的想象，并采用异步方式，实现资源并发获取，从而提高用户体验。
- 有效进行资源分配
  业务场景中，当有一组互不相关的任务需要完成时，主流的方法有：单线程串行依次执行、多线程并行完成。
  但是，单线程同步编程模型会因则赛I/O导致硬件资源得不到更优的使用。多线程编程模型在编程中也会出现让人头疼的死锁、状态同步等问题。
  **node则是利用单线程，原理多线程死锁、状态同步等问题，利用异步I/O，让单线程原理阻塞，以更好地使用CPU.**

### 异步/同步，阻塞/非阻塞

- 阻塞I/O
  阻塞I/O的一个特点是调用之后一定要**等待系统内核层面完成所有操作之后，调用才结束**。

- 非阻塞I/O
  非阻塞I/O**调用之后会立即返回（在返回之后，CPU的时间片可以用来处理其他事务）**，但是此时返回的并不是业务层所期望的数据，而仅仅是当前调用的状态，故为了获取完整的数据，应用程序需要重复调用I/O操作来确认是否完成（轮询）。

  **轮询**技术满足了非阻塞I/O确保获取完整数据的需求，但对于应用程序而言，它只能算是一种**同步**，因为应用程序仍然需要等待I/O完全返回。

- 非阻塞异步I/O

  理想的异步I/O：应用程序发起非阻塞调用，无需通过遍历或事件唤醒等方式轮询，可以直接处理下一个任务，只需在I/O完成后通过信号或回调将数据传递给应用程序即可。

  现实的异步I/O：采用线程池与阻塞I/O模拟异步I/O(*nix平台)，另一种异步I/O方案则是windows下的IOCP(内部仍然是线程池原理，不同之处在于这些线程池有系统内核接手管理)。

  **node.js -> libuv -> (*nix:自定义线程池，windows: IOCP)**
  由于windows平台和*nix平台的差异，node提供了**libuv作为抽象封装层**，使得所有平台兼容性的判断都由这一层来完成，并**保证上层的node与下层的自定义线程池及IOCP之间各自独立**，node在编译期间会判断平台条件，选择性编译unix目录或是win目录下的源文件到目标程序中。

### Node的异步I/O

事实上，在node中，除了JavaScript是单线程的，node自身其实是多线程的，只是I/O线程使用的CPU较少。
**Node异步I/O模型的基本要素：事件循环、观察者、请求对象、I/O线程池**

#### 事件循环

  node自身的执行模型——事件循环，它使得回调函数十分普遍。
  在进程启动时，node便会创建一个类似于while(true)的循环，**每执行一次循环体的过程称为tick**，每次tick的过程即查看是否又事件待处理，如果有，就取出事件及其相关回调函数，如果存在关联的回调函数，就执行它们，然后进入下个循环，如果不再有事件处理，就退出进程。

#### 观察者

  对于每个tick的过程中，利用的是观察者来判断是否有事件需要处理。

  **每个事件循环中有一个或多个观察者，判断是否有事件要处理的过程即向这些观察者询问是否有要处理的事件**。

#### 请求对象、I/O线程池

  **事件循环是一个典型的生产者/消费者模型**，异步I/O、网络请求等则是事件的生产者，源源不断地为node提供不同类型的事件，这些事件被传递到对应的**观察者**那里，事件循环则从观察者那里取出事件并处理。

  在js中，对于一般的（非异步）回调函数，函数由我们自行调用。对于Node中的异步I/O调用而言，回调函数则不由开发者调用。

  从js发起调用到内核执行完I/O操作的过渡过程中，存在一种中间产物，叫做**请求对象**。

- 异步I/O的第一阶段：创建并组装**请求对象**，然后送入**I/O线程池**等待执行
  从js调用node的核心模块，核心模块调用C++内建模块，**内建模块通过libuv进行系统调用**，在这系统调用过程中，会创建一个对应的**请求对象**，从js层传入的**参数和当前方法**都被封装在这个请求对象中，而对应的**回调函数则被设置在这个对象的oncomplete_sym属性上**，在这个请求对象包装完毕后，会调用相关的方法将请求对象推入线程池等待，当线程池有可用线程时，会调用相关的方法，根据传入的参数调用相应的底层函数。

  由js层面发起的异步调用第一阶段结束后，**js线程可以继续执行当前任务的后续操作，当前的I/O操作在线程池等待执行，不管它是否阻塞I/O，都不会影响到js线程的后续执行，如此就达到了异步的目的**。

  **请求对象**是异步I/O过程中的重要中间产物，**所有的状态都保存在这个对象中**，包括送入线程池等待执行以及I/O操作完毕后的回调处理。
- 异步I/O的第二阶段：**回调通知，执行回调**
  线程池中的I/O操作完毕之后，会将获取的结果存储在req->result属性上，然后调用相关方法通知IOCP（向IOCP提交执行状态），告知当前对象操作已经完成，从而将线程归还给线程池

  在这个过程中，还动用了**事件循环中的I/O观察者**。在每次Tick的执行中，它会调用IOCP相关的方法检查线程线程中是否有执行完的请求，如果有，会将请求对象加入到I/O观察者的队列中，然后将其当作事件处理。
  **I/O观察者回调函数的行为就是取出请求对象中的的result属性性作为参数，取出oncomplete_sym属性作为方法，然后调用执行，以此达到调用JavaScript传入的回调函数的目的**。

  [异步io流程图](./imgs/%E5%BC%82%E6%AD%A5io%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

### Node的非I/O的异步API

  node中还存在一些与I/O无关的异步API，分别是setTimeout()、 setInterval()、 setImmediate()、 process.nextTick()。

#### 定时器

  setTimeout()和setInterval()与浏览器中的API是一致的，分别**用于单次和多次定时执行任务**。
  它们实现的原理与异步I/O比较类似，只是**不需要I/O线程池的参与**。

  调用色图Timeout或者setInterval创建的定时器会被插入到定时器观察者内部的一个红黑树中。每次tick执行时，会从该红黑树中迭代取出定时器对象，检查是否超过定时时间，如果超过，就形成一个事件，它的回调函数将立即执行。

  【注意】**定时器的问题在于，它并非精确的**（在容忍范围内）。经过事件循环十分块，但是如果某一次循环占用的时间较多，那么下次循环时，它也许已经超时很久了。

#### process.nextTick()

  利用process.nextTick()同样可以实现异步执行任务，相比于精确度不够的定时器以及较为浪费性能的setTimeout(fn, 0)的方式，**process.nextTick()方法的操作相对较为轻量**。

  每次调用process.nextTick()方法，只会将回调函数放入队列中，在下一轮Tick时取出执行。定时器采用红黑树的操作时间复杂度为O(lg(n))，**nextTick()的时间复杂度为O(1)**，相较之下，process.nextTick()更高效。

#### setImmediate()

  setImmediate()和process.nextTick()方法十分类似，都是将回调函数延迟执行。
  但是，process.nextTick()中的回调函数的优先级要高于setImmediate()的。
  因为在事件循环对观察者的检查是有先后顺序的，**process.nextTick()属于idle观察者，setImmediate()属于check观察者，在每一轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者**。

  在具体实现上，process.nextTick()的回调函数保存在一个数组中，setImmediate()的结果保存在链表中，在行为上，process.nextTick()在每轮循环中会将数组中的回调函数全部执行完，而setImmediate()在每轮循环中执行链表中的一个回调函数。

### 事件驱动与高性能服务器

#### 几种经典的服务器模型及优缺点

- 同步式
  一次只能处理一个请求，并且其余请求都处于等待状态
- 每进程/每请求
  为每个请求启动一个进程，可以处理多个请求，但不具备扩展性，因为系统资源有限。
- 每线程/每请求
  为每个请求启动一个线程，线程比进程轻量，但由于每个线程都占用一定内存，当大并发请求到来时，内存将会很快被用光，导致服务器缓慢。但其扩展性稍好。

#### Node的高性能服务器

  node通过**事件驱动**的方式处理请求，无需为每一个请求创建额外的对应线程，可以**省掉创建线程和销毁线程的开销**，同时操作系统在调度任务时因为**线程较少，上下文切换的代价很低**。这使得服务器能够有条不紊地处理请求，即使在大量连接的情况下，也不受线程上下文切换开销的影响。

  **nginx服务器也摒弃了多线程的方式，采用了和node相同的事件驱动**。node具有与nginx相同的特性，不同之处在于**nginx采用纯C写成**，性能较高，但它仅适合做web服务器，用于反向代理或负载均衡等服务，在处理具体业务方面较为欠缺。

  node作为一套高性能平台，可以构建与Nginx相同的功能，也可以处理各种具体业务，而且与背后的网络保持异步畅通。

## 异步编程

### 函数式编程

- 高阶函数
  高阶函数是可以把函数作为参数，或是将函数作为返回值的函数。

  根据node提供的最基本的事件模块可以看到，事件的处理方式正是基于高阶函数的特性来完成的。

- 偏函数用法
  偏函数用法是指创建一个调用另外一个部分（参数或变量已经预置的函数）的函数的用法。

  为了解决重复定义的问题，引入一个新函数，这个新函数可以如工厂一样批量创建一些类似的函数，**像这种通过指定部分参数来产生一个新的定制函数的形式就是偏函数**。

### 异步编程的优势与难点

- 优势
  Node带来的最大特性莫过于基于事件驱动的非阻塞I/O模型。非阻塞I/O可以使CPU与I/O不相互依赖等待，让资源得到更好的利用。对于网络应用而言，并行带来的想象空间更大，延展而开的是分布式和云。并行使得各个单点之间能够更有效地组织起来。

- 难点

  1. 异常处理
  过去处理异常时，通常使用try/catch/finally语句块进行异常捕获，但这对于异步编程而言并不一定适用。

  异步I/O的实现主要包含两个阶段：提交请求和处理结果。这两个阶段中间有事件循环的调度，两者互不关联。异步方法则通常在第一阶段提交请求后立即返回，因为异常不一定发生在这个阶段，try/catch的功效在此处不会发挥任何作用。
  2. 函数嵌套过深
  对于Node而言，事务中存在多个异步调用的场景比比皆是，当多个异步调用操作存在依赖关系时，深层次的函数嵌套由此产生。
  3. 阻塞代码
  注意，node中是没有向sleep()这样的线程沉睡功能，唯独能用于延时操作的只有setInterval()和setTimeout()这两个函数，但这两个函数并不能阻塞后续代码的持续操作。
  4. 多线程编程
  js是单一线程上执行的代码，在浏览器中，js执行线程与UI渲染公用一个线程；在node中，只是没有UI渲染的部分，模型基本相同。对于服务器而言，如果服务器是多核CPU，单个Node进程实质上是没有充分利用多核CPU的。
  5. 异步转同步

### 异步编程解决方案

  异步编程的主要解决方案：

#### 1. 事件发布/订阅模式

  事件监听器模式是一种广泛应用于异步编程的模式，是回调函数的事件化，又称发布/订阅模式，node自身提供的events模块是发布订阅模式的一个简单实现，node中部分模块都继承自它。
  订阅事件其实就是一个**高阶函数的应用**。事件发布订阅模式**可以实现一个事件与多个回调函数的关联**，这些回调函数又称为事件侦听器。通过emit()发布事件之后，消息会立即传递给当前事件的所有侦听器执行。侦听器可以很灵活地添加和删除，使得事件和具体处理逻辑之间可以很轻松地关联和解耦。

【注意】node基于健壮性对事件发布、订阅的机制做了一些额外的处理：

- 如果对一个事件添加了超过10个监听器，将会得到一条警告。（设计者认为侦听器太多可能导致内存泄漏，另外可能存在过多占用CPU的情景）
- 为了处理异常，EventEmitter对象对error事件进行了特殊对待。
  如果运行期间的错误触发了error事件，EventEmitter会检查是否有对error事件添加侦听器，若有，这回将错误交由该侦听器处理，否则该错误会作为异常抛出，若外部没有捕获这个异常，将会引起线程退出。

##### 集成events模块

  开发者通过集成EventEmitter类，利用事件机制解决业务问题

##### 利用事件队列解决雪崩问题

  所谓雪崩问题，及在高访问量、大并发量的情况下缓存实现的情景，此时大量的请求同时涌入数据库中，数据库无法同时承受如此大的查询请求，进而往前影响到网站整体的响应速度。

  而利用事件订阅与发布模式中的once()方法（通过它添加的侦听器只能执行一次，在执行之后就会将它与事件的关联一处），来过滤一些重复性的事件响应，从而解决雪崩问题。

##### 多异步之间的协作方案

  一般而言，事件与侦听器的关系是一对多，但在异步编程中，也会出现事件与侦听器的关系是多对一的情况。也就是说**一个业务逻辑可能依赖两个通过回调或事件传递的结果，这也是回调嵌套过深的原因**。

  【目标】既要享受异步I/O带来的性能提升，也要保持良好的编码风格。
  由于多个异步场景中回调函数的执行并不能保证顺序，且回调函数之间互相没有任何交集，所以需要**借助一个第三方函数和第三方变量来处理异步协作的结果，通常把这个用于检测次数的变量叫做哨兵变量**，可以**利用偏函数来处理哨兵变量和第三方函数的关系**。

  ```js
  var after = function (times,callback) {
    var count = 0, result = {};
    return function (key, value) {
      result[key] = value;
      count++;
      if(counts === times) {
        callback(results);
      }
    }
  }
  // 伪代码
  // 以渲染页面所需要的模板读取、数据读取、本地资源化读取为例来体现多个异步场景
  var done = after(times, render);
  fs.readFile(template_path, 'uft8', function(errr, template) {
    done("template", template);
  });
  db.query(sql, function(err, data) {
    done('data', data);
  });
  l10n.get(function(err, resources) {
    done('resources', resources);
  });
  ```

  随着业务增长，可以继续利用发布订阅方式来完成多对多的方案，结合利用简单的偏函数完成多对一的收敛和事件订阅发布模式中一对多的发散。

  ```js
  var emitter = nre events.Emitter();
  var done = after(time,render);

  // 利用发布订阅方式来完成多对多的方案
  emitter.on('done', done);
  emitter.on('done', other);
  fs.readFile(template_path, "uft8", function(err, template) {
    emitter.emit('done', "template", template);
  });
  db.query(sql, function(err, data) {
    emitter.emit('done', "data", data);
  });
  l10n.get(function(err, resources) {
    emitter.emit("done", "resources", resources);
  });
  ```

##### 自定义编写的EventProxy模块，对事件订阅发布模式进行扩充，可以自由订阅组合事件

  EventProxy提供了一个**all()方法来订阅多个事件，当每个事件都被触发之后，侦听器才会执行**，注意，在侦听器中返回数据的参数列表与定于组合时间的事件列表是一致对应的。

  另一个方法为tail()方法，它与all()的区别在于：all()的侦听器在满足条件之后只会执行一次，而tail()的侦听器在满足条件执行一次之后，如果组合事件中的某个事件被再次触发，侦听器会用最新的数据继续执行。

  after()方法可以实现事件在执行指定次数后执行侦听器的单一事件组合订阅方式。

  EventProxy提供了fail()和done()这两个实例方法来优化异常处理，使得开发者将精力关注在业务部分而不是在异常捕获上。

  ```js
  var proxy = new EventProxy();
  proxy.all("template", "data", "resources", function(template, data, resource) {

  });
  fs.readFile(template_path, "uft8", function(err, template) {
    proxy.emit('done', "template", template);
  });
  db.query(sql, function(err, data) {
    proxy.emit('done', "data", data);
  });
  l10n.get(function(err, resources) {
    proxy.emit("done", "resources", resources);
  });

  proxy.after("data", 10, function(datas) {

  });
  ```

#### 2. Promise/Deferred模式

  使用事件的方式时，执行流程需要被预先设定。即便是分支，也需要预先设定，这是由发布订阅模式的运行机制所决定的。

  ```js
  $.get('api', {
    success: onSuccess,
    error: onError,
    complete: onComplete,
  });
  ```

  而**Promise/Deferred模式则是一种先执行异步调用（promise），延迟传递处理（deferred）的方式**。

  ```js
  $.get('api')
  .success(onSuccess)
  .error(onError)
  .complete(onComplete);
  ```

  异步的广度使用使得回调、嵌套的出现，但是一旦出现深度的嵌套，就会让编程的体验不佳，而Promise/Deferred模式在一定程度上缓解了这个问题。

  Promise/Deferred模式包含两部分：Promise和Deferred

##### Promise/A 以点代面了解Promise/Deferred模式

  Promise/A对单个异步操作的抽象定义:

- Promise操作只会处在三种状态的一种：未完成态、完成态、失败态。
- Promise的状态只会出现从未完成态向完成态或失败态转化，不能逆反。完成态和失败态不能互相转化。
- Promise的状态一旦转化，将不能被更改。

  Promise.then()有如下要求：
- 接受完成态、错误态的回调方法。在操作完成或出现错误时，将会调用对应方法。
- 可选地支持progress事件回调作为第三个方法。
- then()方法只接受function对象，其余对象将被忽略
- then()方法继续返回promise对象，以实现链式调用。

```js
Promise.then(fulfilledHandler, errorHandler, progressHandler);
```

**then方法所做的事情就是将回调函数存放起来**，为了完成整个流程，还需要**触发执行这些回调函数***的地方，实现这个功能的对象通常被称为**Deferred**，即**延迟对象**。

**Deferred主要适用于内部，用于维护异步模型的状态**；**Promise则作用于外部，通过then()方法暴露给外部以添加自定义逻辑**。

Promise/Deferred模式将业务中不可变的部分封装在了Deferred中，将可变的部分交给了Promise。

**Promise是高级接口，事件是低级接口**。低级接口可以构成更多更复杂的场景，高级接口一旦定义，不太容易变化，不再有低级接口的灵活性，但对于**解决典型问题非常有效**。

Promise通过封装异步调用，实现了正向用例和反向用例的分离以及逻辑处理延迟，这使得回调函数相对优雅。

##### Promise的多异步协作

通过all()方法将两个单独的promise重新抽象组合成一个新的promise。通过all方法抽象多个异步操作，只有所有异步操作成功，这个异步操作才算成功，一旦其中一个异步操作失败，整个异步操作失败。

让Promise支持链式调用：

1. 将所有的回调都存到队列中；
2. Promise完成时，逐个执行回调，一旦检测到返回了新的promise对象，停止执行，然后将当前Deferred对象的promise引用改变为新的promise对象，并将队列中余下的回调转交给它。

#### 3. 流程控制库

##### 尾触发与Next

  尾触发，即需要手工调用才能持续执行后续调用的方法，关键词为next。

  尾触发应用最多的地方为Connect的中间件：每个中间件传递请求对象、响应对象和尾触发函数，通过队列形成一个处理流。

  中间件机制使得在处理网络请求时，可以像面向切面编程一样进行过滤、验证、日志等功能，而不与具体业务逻辑产生关联，以致产生耦合。

  【注意】中间件的尾触发模式并不要求每个中间方法都是异步的，但如果每个步骤都采用异步来完成，实际上只是**串行化的处理**，没办法通过并行的异步调用来提升业务的处理效率，流式处理可以将一些串行的逻辑扁平化，但是**并行逻辑处理还是需要搭配事件或者promise完成**的，这样业务在纵向和横向都能够各自清晰。

##### async

  流程控制模块——async，async模块提供了20多个方法用于处理异步的各种协作模式。

- 异步的串行执行
  async提供了**series()方法来实现一组任务的串行执行**。

  ```js
  async.series([
    function(callback) {
      fs.readFile('file1.txt', 'utf-8', callback)
    },
    function(callback) {
      fs.readFile('file2.txt', 'utf-8', callback)
    },
  ], function(err, results) {
    // results => [file1.txt, file2.txt]
  })
  ```

  可以发现， series()方法中传入的函数callback()并非由使用者指定。事实上，此处的回调函数由async通过高阶函数方式注入，这里隐含了特殊逻辑。每个callback()执行时会将结果保存起来，然后执行下一个调用，直到结束所有调用，最终的回调函数执行数，队列里的异步调用保存的结果以数组的方式传入。这里的异常处理规则是一旦出现异常，就结束所有调用，并将异常传递给最终回调函数的第一个参数。

- 异步的并行执行
  当需要通过并行提升性能时，async提供了**parallel()方法，用以并行执行一些异步操作**。

  parallel与series方法的回调函数以及异常处理类似。

  ```js
  async.parallel([
    function(callback) {
      fs.readFile('file1.txt', 'utf-8', callback)
    },
    function(callback) {
      fs.readFile('file2.txt', 'utf-8', callback)
    },
  ], function(err, results) {
    // results => [file1.txt, file2.txt]
  })
  ```

- 异步调用的依赖处理
  series适合无依赖的异步串行执行，但当前一个的结果时后一个调用的输入时，async提供了**waterfall()来满足这种场景的需求（有依赖输入处理）**。

  ```js
  async.waterfall([
    function(callback) {
      fs.readFile('file1.txt', 'utf-8', callback)
    },
    function(arg1, callback) {
      // arg1 => file2.txt
      fs.readFile(arg1, 'utf-8', callback)
    },
    function(arg1, callback) {
      // arg1 => file3.txt
      fs.readFile(arg1, 'utf-8', callback)
    },
  ], function(err, results) {
  })
  ```

- 自动依赖处理
  在现实同步/异步业务环境中，具有很多复杂的依赖关系，async提供了**auto()方法实现复杂业务处理**。

  有如下业务场景：
  1. 从磁盘读取配置文件
  2. 从配置文件连接MongoDB
  3. 从配置文件连接Redis
  4. 编译静态文件
  5. 上传静态文件到CDN
  6. 启动服务器

  上诉场景中：2，3依赖1，5依赖4，6则依赖所有1，2，3，4，5

  ```js
  var deps = {
    readConfig: function(callback) {
      callback()
    },
    connectMongoDB: ['readConfig', function(callback) {
      callback()
    }],
    connectRedis: ['readConfig', function(callback) {
      callback()
    }],
    compileAssets: function(callback) {
      callback()
    },
    uploadAssets:  ['compileAssets', function(callback) {
      callback()
    }],
    startup: ['connectMongoDB', 'connectRedis', 'uploadAssets', function(callback) {
      // startup
    }]
  }
  async.auto(deps);
  ```

##### Step

  step是另一个知名的流程控制库，它比async更轻量，在api的暴露上也更具备一致性，因为它只有一个接口——step。

  ```js
  Step(task1, task2, task3, ...);

  Step(
    function readFile1() {
      fs.readFile('file1.txt', 'utf-8', this);
    },
    function readFile2(err, content) {
      fs.readFile('file2.txt', 'utf-8', this);
    },
    function done(err, content) {

    }
  )
  ```

  Step接受任意数量的任务，所有的任务都将会串行依次执行。
  可以看到，Step用到了关键字this，事实上，它是Step内部的一个next方法，将异步调用的结果传递给下一个任务作为参数，并调用执行。

- 并行任务执行

  ```js
  Step(
    function readFile1() {
      fs.readFile('file1.txt', 'utf-8', this.parallel());
      fs.readFile('file2.txt', 'utf-8', this.parallel());
    },
    function done(err, content1, content2) {
      // content1-file1
      // content2-file2
    }
  )
  ```

 Step通过this.parallel()方法实现多个异步任务并行执行，它告诉Step，当前任务需要等内部所有任务完成时才进行下一个任务。

 Step的parallel()方法的原理是每次执行时将内部的计数器加1，然后返回一个回调函数，这个回调函数在异步调用结束时才执行。当回调函数执行时，将计数器减1。当计数器为0时，告知Step所有的异步调用结束了，Step会执行下一个方法。

 Step与Async有相同的异常处理，一旦有一个异常产生，这个异常会作为下一个方法的第一个参数传入。

- 结果分组
  Step使用this.group()对调用结果进行分组
  parallel传递给下一个任务的结果如下形式

  ```js
  function(err, result1, result2, ...) {

  }
  ```

  group传递的结果为如下，它返回的数据保存在数组中：

  ```js
  function(err, result) {
    // result: [result1, result2, ...]
  }
  ```

##### wind

 wind可以解决一些异步编程所面临的特殊场景。

 例如——使得冒泡排序动画起来：

  ```js
  var compare = function(x, y) {
    return x - y;
  }

  var swap = function(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  var bubbleSort = function(array) {
    for(var i = 0; i < array.length; i++) {
      for(var j = 0; j < array.length - i - 1; j++) {
        if(compare(array[j], array[j + 1]) > 0) {
          swap(array, j, j + 1);
        }
      }
    }
  }
  ```

要是冒泡排序动画起来，面临以下难点：

- 动画执行时无法停止排序算法的执行
- 排序算法的继续执行将会启动更多动画

wind使得冒泡排序动画起来的实现：

```js
var compare = function(x, y) {
    return x - y;
  }

var swapAsync = eval(Wind.compile("async", function(arr, i, j) {
  $await(Wind.Async.sleep(20)); // 暂停20毫秒
  var temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  paint(arr); // 重绘数组
}))
var bubbleSort = eval(Wind.compile("async", function(array) {
  for(var i = 0; i < array.length; i++) {
    for(var j = 0; j < array.length - i - 1; j++) {
      if(compare(array[j], array[j + 1]) > 0) {
        $await(swapAsync(array, j, j + 1);)
      }
    }
  }
}))
```

【注意】上述代码的三处特别之处

1. eval(Wind.compile("async", function(){}))
2. $await()
3. Wind.Async.sleep(20)

###### 异步任务定义

Wind利用了eval()访问上下文的特性，Wind.compile()会将普通的函数进行编译，然后将给eval()执行，也就是说**通过eval(Wind.compile("async", function(){}))定义了异步任务，Wind正式创建异步任务的方法为Wind.Async.Task.create()**。

而Wind.Async.sleep()则是内置了对setTimeout()的封装。

###### $await()与任务模型

Wind提供了$await()方法实现等待完成异步方法。
事实上，它并不是一个方法，也不存在于上下文中，只是一个等待的占位符，告之编译器这里需要等待。

$await()接受的参数为一个任务对象，表示等待任务结束后才会执行后续操作，每一个异步操作都可以转化为一个任务。

Wind.Async.Task.whenAll()来处理并发，通过$await关键字将等待配置的所有任务完成后才向下继续执行。

###### 异步方法转换辅助函数

  为将异步方法任务化，Wind提供了两个方法来辅助转换

- Wind.Async.Binding.fromCallback
对于node中的异步方法的回调传值无异常的调用，fromCallback将这类异步调用转换为wind中的任务
- Wind.Async.Binding.fromStandard
fromStandard则是将带异常的异步调用转换为wind中的任务。

### 异步并发控制

在同步I/O中，每个I/O都是彼此阻塞的，因此不会出现耗用文件描述符太多的情况，同时性能也是低下的。**异步I/O，虽然容易实现并发，但需要进行控制，并给予过载保护**。

#### bagpipe的解决方案

- 通过一个队列来控制并发量。
- 如果当前活跃（指调用发起但未执行回调）的异步调用量小于限定值，从队列阙处执行。
- 如果活跃调用达到限定指，调用暂时存放在队列里。
- 每个异步调用结束时，从队列中取出新的异步调用执行。

bagpipe主要暴露了一个push()方法和full事件

##### bagpipe的拒绝模式

```js
var bagpipe = new Bagpipe(10, {
  refuse: true, // 开启拒绝模式
})
```

在拒绝模式下，如果等待的调用队列也满了之后，信赖的调用就直接返给它一个队列太忙的拒绝异常。

##### bagpipe的超时控制

```js
var bagpipe = new Bagpipe(10, {
  timeout: 3000, // 超时控制
})
```

造成队列拥塞的主要原因是异步调用耗时太久，调用产生的速度远高于执行的速度，为防止某些异步调用占用太多时间，需设置一个时间基线，将那些执行时间太久的异步清理处活跃队列，让排队中的异步调用尽快执行。

bagpipe所提供的超时控制，是**为异步调用设置一个时间阈值**，如果异步调用没有在规定时间内完成，则先执行用户传入的回调函数，让用户得到一个超时异常，以尽早返回，然后让下一个等待队列中的调用执行。

#### async的解决方案

  async.parallelLimit(): 用于处理异步调用的限制的方法，它可以传入一个用于限制并发数量的参数，使得任务只能同时并发一定数量，而不是无限制并发。

  async.queue(): 可以事项动态添加并行任务，但其接受的参数是固定的，缺乏像parallelLimit所提供的多样性。

## 内存控制

  在海量请求和长时间运行的前提下，对于资源向来就寸土寸金的服务端而言，要为海量用户服务，就得使一切资源都要高效循环利用。

### V8的垃圾回收机制与内存限制
  
  js是由垃圾回收（garbage collection）机制进行自动内存管理的。

#### node与v8

  node是一个构建在chrome的js运行时上的平台。v8是node的js脚本引擎。v8的性能优势使得用js写高性能后台服务程序成为可能。

#### v8的内存限制

  在node中通过js使用内存时会发现只能使用部分内存（64位系统下约为1.4GB，32位系统下约为0.7GB），这样的限制会导致node无法直接操作大内存对象。

#### v8的对象分配

  在v8中，所有的js对象都是通过堆来进行分配的。node提供了v8中内存使用量的查看方式：node -> process.memoryUsage()。

  ```powershell
  >node
  >process.memoryUsage()
  // 控制台返回的v8内存使用情况对象
  {
    rss: 23064576,
    heapTotal: 9682944,
    heapUsed: 5285728,
    external: 8882 
  }
  ```

  通过上述node代码，返回的属性中，heapTotal和heapUsed是v8的堆内存使用情况，前者是已申请到的堆内存，后者是当前使用的量。

  当我们在代码中**声明变量并赋值**时，所使用对象的内存就**分配在堆中**。如果已申请的堆空闲内存**不够分配新的对象，将继续申请堆内存**，直到堆的大小**超过v8的限制为止**。

  v8限制堆的大小的原因：

  1. 表层原因：v8最初为浏览器而设计，不太可能遇到大量内存的场景。
  2. 深层原因：v8的垃圾回收机制的限制。
  以1.8GB的垃圾回收堆内存为例，V8做一次小的垃圾回收需要50ms以上，做一次非增量式的垃圾回收要1s以上，这是垃圾回收中引起js线程暂停执行的时间，这些时间花销无疑会使应用的性能和响应能力直线下降，因而进行了堆内存的限制。

  【注意】V8提供了选项可以打开内存的限制。node在启动时可以传递--max-old-space-size或--max-new-space-size来调整内存限制的大小

  ```powershell
  node --max-old-space-size=1700 test.js // 单位为MB
  node --max-new-space-size=1024 test.js // 单位为KB
  ```

#### V8的垃圾回收机制

  统计学在垃圾回收算法的发展中产生了较大的作用，现代的垃圾回收算法中**按对象的存活时间将内存的垃圾回收进行不同的分代**，然后分别对不同分代的内存施以更高效的算法。

1. V8的内存分代
在v8中，主要将内存分为**新生代**和**老生代**两代。
新生代中的对象为**存活时间较短的对象**，
老生代中的对象为**存活时间较长或常驻内存的对象**，
V8堆整体大小就是新生代所用内存空间加上老生代的内存空间。

前面提到的--max-old-space-size则为设置老生代内存空间最大值的命令参数， --max-new-space-size则为设置新生代内存空间大小的参数。

通过源码可知：
老生代的内存最大值设置：1400MB（64位系统），700MB（32位系统）；
新生代的内存最大值设置：32MB（64位系统）， 16MB（32位系统）。

默认情况下，V8堆内存的最大值：1464MB（64位系统，约1.4GB） 732MB（32位系统，约0.7GB）。

2. V8主要的垃圾回收算法

1. scavenge算法
    scavenge——英文含义为清扫、清除废物。
    **新生代**中的对象主要通过scavenge算法进行垃圾回收，在scavenge的具体实现中，主要采用了**cheney算法**（C.J.Cheney发表）。

    Cheney算法是一种采用**复制**的方式实现的垃圾回收算法。
    它将堆内存一分为二，每一部分的空间称为semispace，在这两个空间中，只有一个处于使用中（称为From空间），另一个处于闲置状态（称为To空间）。
    在分配对象时，先从From空间进行分配。
    在开始进行垃圾回收时，先检查From空间的存活对象，这些**存活对象将被复制到To空间**，非存活对象占用的空间将被释放。**完成复制后，From空间和To空间的角色发生对换（又称反转）**。

    scavenge缺点时只能使用堆内存的一半，但由于它只复制存活的对象，而对于**生命周期短**（新生代中的对象的生命周期较短）的场景存活对象只占少部分，所以它**在时间效率上有优异表现**。scavenge为典型的牺牲空间换取时间的算法。

    【注意】当一个对象经过多次复制依然存活时，它将会被认为是声明周期较长的对象，这种**较长生命周期的对象随后会被移动到老生代中**，采用新的算法进行管理。对象从新生代中迁移到老生代的过程成为**晋升**。所以在分代式垃圾回收下，From空间中的存活对象在复制到To空间之前**需要进行检查，以完成对象晋升**。

    对象晋升的条件有两个：
    - 对象是否经历过scavenge回收
      若对象经历过scavenge回收，会将该对象从From空间复制到老生代空间中，若没有，则复制到To空间中。
    - To空间的内存占用比超过限制（限制值为25%）
      如果To空间已经使用超过25%，会将该对象直接晋升到老生代空间中，因为如果To空间的使用率占比过高，会影响后续的内存分配。

2. Mark-Sweep & Mark-Compact
    老生代中的对象，由于存活对象占比较大，若采用scavenge算法则有两个问题：复制存活对象效率较低、会浪费一半内存空间。

    因此**老生代中主要采用了Mark-Sweep和Mark-Compact相结合的方式进行垃圾回收**。

    Mark-Sweep意为标记清除，它分为标记和清除两个阶段。

    Mark-Sweep在**标记阶段遍历堆中的所有对象**，并**标记活着的对象**，在随后的**清除阶段中，只清除没有被标记的对象**。（死对象在老生代中只占较小部分）。

    Mark-Sweep最大的问题是进行一次标记清除回收后，**内存空间会出现不连续的状态**，这种内存碎片会对后续的内存分配造成问题，当出现需要分配一个大对象时，所有碎片空间无法完成此次分配，就会提前触发非必要的垃圾回收。

    为解决Mark-Sweep的内存碎片问题，Mark-Compact由此产生。

    Mark-Compact意为标记整理，其基于Mark-Sweep演变而来。**Mark-Sweep在对象被标记为死亡之后，在整理的过程中，将活着的对象往一端移动，移动完成后，直接清理掉边界外的内存以完成回收**。注意，因为Mark-Compact需要移动对象，所以它的执行速度不可能很快。

    V8主要使用Mark-Sweep，在空间不足以对从新生代晋升过来的对象进行分配时才使用Mark-Compact。

  3. Incremental Marking
    为了避免出现js应用逻辑与垃圾回收器看到的不一致的情况，垃圾回收的三种基本算法都需要将应用逻辑暂停下来，待执行完垃圾回收后再回复执行应用逻辑，这种行为被称为“**全停顿**”（stop-the-world）。

    【注意】由于V8的老生代通常配置得较大，且存活对象较多，**全堆垃圾回收（full垃圾回收）的标记、清理、整理的动作造成的停顿就会比较可怕**。

    为了降低全堆垃圾回收带来的停顿事件，V8从标记阶段入手，将原本要一口气停顿完成的动作改为**增量标记**（incremental marking），即拆分为许多小“步进”，每做完一“步进”，将让js应用逻辑执行一会，**垃圾回收与应用逻辑交替执行直到标记阶段完成**。

    v8经过增量标记的改进后，垃圾回收的最大停顿事件减少到原来的1/6左右。
    V8后续还引入了**延迟清理（lazy sweeping）与增量式整理（incremental compaction）**，实现增量式的清理与整理动作，并引入了**并行标记与并行清理**，进一步利用多核性能降低每次停顿的事件

#### 查看垃圾回收日志

  ```powershell
    node --trace_gc -e "var a = []; for(var i = 0; i < 100000; i++) a.push(new Array(100));" > gc.log
  ```

  [gc.log](./gc.log);

  通过在node启动时使用--prof参数，可以得到v8执行时的性能分析数据，其中包含了垃圾回收执行时占用的时间。

### 高效使用内存

  在V8中，需要让垃圾回收机制更高效的工作，但要注意的是，在js中，**无法立即回收的内存有：闭包、全局变量引用这两种情况**，所以对于这两类情况，需要十分注意。

#### 作用域

  在js中能形成作用域的有函数调用、with以及全局作用域。

- 标识符查找、作用域链
  JS在执行时会去查找对应变量定义的位置，它最先查找的是当前作用域，如果当前作用域中无法找到该变量的声明，将会向上级的作用域里查找，直到找到为止。

- 变量的主动释放
  如果变量是全局变量（不通过var声明或定义在global变量上），由于**全局作用域需要直到进程退出才能释放**，此时将导致引用的对象常驻内存（常驻在老生代中），如果需要释放常驻内存的对象，可**通过delete操作来删除引用关系，或将变量重新赋值，让旧的对象脱离引用关系**。在接下来的老生代内存清楚和整理的过程中，会被回收释放。

#### 闭包

  在JS中，实现外部作用域访问内部作用域中变量的方法叫做闭包（closure），这得益于高阶函数的特性：函数可以作为参数或者返回值。

  ```js
  var foo = function() {
    var bar = function() {
      var local = 'xx';
      return function() {
        return local;
      }
    };
    var baz = bar();
    console.log(baz())
  }
  ```

  一般而言，函数执行完毕后，局部变量将会随着作用域的销毁而被回收，但由于闭包的缘故，**外部作用域可以通过中间函数访问到内部的变量**，一旦有变量引用了这个中间函数，这个**中间函数将不会释放，同时也使得原始作用域不会得到释放，作用域中产生的内存占用也不会得到释放**。除非不再有引用，才会逐步释放。

### 内存指标

#### 查看进程的内存占用

```powershell
$ node
> process.memoryUsage
{ rss: 24268800,
  heapTotal: 9682944,
  heapUsed: 5279128,
  external: 8905 }
```

node 的process.memoryUsage可以查看node进程的内存占用情况。
返回的结果中：
rss: resident set size —— 即进程的常驻内存部分。
heapTotal —— V8的堆内存信息。
heapUsed —— 目前堆中使用的内存量。
以上三个值的单位均为字节。

进程的内存：一部分为rss，其余部分在交换器（swap）或者文件系统（file system）中。

#### 查看系统的内存占用

```powershell
$ node
> os.totalmem()
17067458560
> os.freemem()
7081287680
```

os.totalmem() 查看操作系统的总内存，单位为字节
os.freemem() 查看操作系统的闲置内存，单位为字节

#### 堆外内存

  通过process.memoryUsage()可以看到，**堆中的内存用量总是小于进程的常驻内存用量**。这意味这node中的内存使用并非都是通过V8进行分配的，将那些不是通过V8分配的内存称为**堆外内存**。

  注意，**Buffer对象**不同于其他对象，它不经过V8的内存分配机制，所以也**不会有堆内存的大小限制，这意味这利用堆外内存可以突破内存限制的问题**。

### 内存泄漏

内存泄漏的实质是：应当回收的对象出现意外而没有被回收，编程了常驻在老生代的对象。

造成内存泄漏的原因有如下几个

- 缓存
- 队列消费不及时
- 作用域未释放

#### 慎将内存当作缓存

  **缓存可以十分有效地节省资源**，它的访问效率比I/O效率高，一旦命中缓存，可以节省一次I/O的时间。

  【注意】node中，**一旦一个对象被当作缓存使用，则意味它将常驻在老生代中**。缓存中存储的键越多，长期存活的对象则越多，这将导致垃圾回收在进行扫描和整理时，对这些对象做无用功。

- 缓存限制策略

    为解决缓存中对象永远无法释放的问题，需加入一种策略来吸纳之缓存的无限增长。

    简单的限制策略：即记录键在数组中，一旦超过数量，就以先进先出的方式淘汰。

    [高效的缓存策略](https://github.com/isaacs/node-lru-cache)

- 缓存的解决方案
    1. 将缓存转移到外部，减少常驻内存的对象的数量，让垃圾回收更高效。
    2. 进程之间可以共享缓存。
    例如： Redis Memcached

#### 关注队列状态

  在js中可以通过队列（数组对象）来完成许多特殊的需求。队列在消费者-生产者模型中经常充当中间产物，在大多数应用场景下，消费的熟读远远大于生产的速度，内存泄漏不易产生，但是一旦**消费速度远低于生产速度，就会形成堆积**，而js中相关的作用域也不会得到释放，内存占用不会回落，从而出现内存泄漏。

  深度的解决方案为：

  1. **监控队列的长度**，一旦堆积，通过监控系统产生报警并通知相关人员。
  2. 任意异步调用都应包含**超时机制**，一旦在限定的时间内未完成响应，通过回调函数传递超时异常，使得任意异步调用的回调都具备可控的响应时间，给消费速度一个下限值。

### 内存泄漏排查

  常用的用于定位NODE应用的内存泄漏的工具：

  1. v8-profiler
  用于对V8堆内存抓取快照和对CPU进行分析，但该项目缺少维护
  2. node-heapdump
    对V8堆内存抓取快照，用于事后分析

    ```powershell
    $ npm install heapdump
    ```

  3. dtrace
    dtrace工具用于分析内存泄漏
  4. node-memwatch

    ```powershell
    $ npm install memwatch
    ```

    在进程中使用node-memwatch，每次进行全堆垃圾回收时，将会触发一次**stats事件，这个事件将会传递内存的统计信息**。

    如果**经过连续5次垃圾回收后，内存仍然没有被释放，则意味有内存泄漏的产生**，node-memwatch会触发一个leak事件。

    node-memwatch提供了**抓取快照和比较快照**的功能，能够比较堆上对象的名称和分配数量，从而找出导致内存泄漏的元凶。

### 大内存应用

  node提供了stream模块用于处理大文件。

  由于V8内存限制，无法通过fs.readFile()和fs.writeFile()直接进行大文件的操作，而改用fs.createReadStream()和fs.createWriteStream()方法通过流的方式实现对大文件的操作。

## Buffer

  在Node中，应用需要处理网络协议、操作数据库、处理图片、接收上传文件等，在网络流和文件的操作中，还要处理大量二进制数据，JavaScript自有的字符串远远不能满足这些需求，于是Buffer应运而生。

### Buffer结构

  Buffer是一个像Array的对象，但它主要用于操作字符。

  Buffer是一个典型的JavaScript与C++结合的模块，它将性能相关部分用C++实现，非性能相关部分用JavaScript实现。

  【注意】Buffer所占的内存不是通过V8分配的，属于堆外内存。

#### Buffer对象

  Buffer的元素为十六进制的两位数，即0-255的数值。
  Buffer可以访问length属性得到长度，也可以通过下标访问元素，亦可以通过下标进行赋值。

  【注意】当给元素赋值但值不为0-255的整数或是小数时：如果该值小于0（大于255），就将该值逐次添加（减）256，直到得到一个0-255之间的整数，如果是小数，只保留整数部分。

#### Buffer内存分配

  对于Buffer，node在内存的使用上应用的是**在C++层面申请内存、在JavaScript中分配内存的策略**。

  node采用了**slab分配机制**来高效地使用申请来的内存。slab是一种动态内存管理机制，简单来说slab就是一块申请好固定大小的内存区域。

  slab有如下3种状态：

- full：完全分配状态。
- partial：部分分配状态。
- empty：没有被分配状态。

  node以**8KB(每个slab的大小值)为界限**区分Buffer是大对象还是小对象。

##### 分配小Buffer对象

  如果指定Buffer的大小少于8KB，Node会按照小对象的方式进行分配。Buffer分配的过程中主要使用一个局部变量pool作为中间处理对象，处于分配状态的slab单位都指向它。

  一个新的slab单元中的几个关键属性

- 当前buffer对象的parent是指向该slab的；
- offset记录的是当前slab开始使用的位置；
- used记录的是当前slab被使用的字节量；

  [新构造slab单元](./imgs/buffer_slab_1.png);
  [slab单元初次分配](./imgs/buffer_slab_2.png);
  [slab单元再次分配](./imgs/buffer_slab_3.png);

  【注意】当从slab单元中再次分配但slab剩余空间不够时，将会构造新的slab，原slab中剩余的空间将会造成浪费。

  由于同一个slab可能分配给多个Buffer对象使用，只有这些小Buffer对象再作用域释放并都可回收时，slab的8KB空间才会被回收。尽管创建了1字节的Buffer对象，但如果不释放它，实际可能是8KB的内存没有释放。

##### 分配大Buffer对象

  如果需要超过8KB的Buffer对象，将会直接分配一个SlowBuffer对象作为slab单元，这个slab单元将会被这个大Buffer对象独占。

  注意SlowBuffer类是在C++中定义的，虽然引用Buffer模块可以访问到它，但不推荐直接操作，而是用Buffer替代。

### Buffer的转换

  Buffer可以与以下字符串之间相互转换：

- ASCII
- UTF-8
- UTF-16LE/UCS-2
- Base64
- Binary
- Hex

#### 字符串转Buffer

  字符串转Buffer对象主要通过构造函数完成：

  new Buffer(str, [encoding]);
  
  encoding不传值时，默认按UTF-8进行转码和存储。

#### Buffer转字符串

  Buffer对象的toString()可以将Buffer对象转换为字符串。

  var buf = new Buffer();
  buf.toString([encoding], [start], [end])

#### Buffer不支持的编码类型

  Buffer提供了一个isEncoding()函数来判断编码是否支持转换：
  Buffer.isEncoding(encoding);

  在中国常用的GBK、GB2312、BIG-5编码都不在支持的行列中。

  对于不支持的编码类型，可借助Node生态圈中的模块（例如iconv、iconv-lite模块等）完成转换。

  icon-lite采用纯js实现（轻量且性能较好），iconv则通过C++调用libiconv库完成。

  iconv和iconv-lite对于无法转换的内容进行的降级处理方案不尽相同。iconv-lite对于无法转换的内容：多字节内容输出为�，单字节内容输出为?。iconv则有三级降级策略：尝试翻译无法转换的内容，或者忽略这些内容，若不设置忽略，iconv对于无法转换的内容会得到EILSEQ异常。

### Buffer的拼接

  注意，在Buffer的使用场景中给，通常是以一段一段的方式传输，对于国外的英文环境而言，分段式进行代码拼接不会出现问题，但对于**宽字节的中文**，在**文件可读流的每次读取的buffer长度设置了限制**的情况下，却会形成问题，乱码由此而产生。

  ```js
  var fs = require('fs');

  // var rs = fs.createReadStream('test.md');
  var rs = fs.createReadStream('test.md', { highWaterMark: 11 }); // 将文件可读流的每次读取的Buffer长度限制为11
  var data = '';
  rs.on("data", function(chunk) {
    data += chunk;
  });
  rs.on("end", function() {
    console.log(data);
  });
  ```

#### 乱码的产生以及解决方案

##### setEncoding()与string_decoder()

  可读流有一个设置编码的方法**setEncoding()**，它的作用为**让data事件中传递的不再时一个Buffer对象，而是编译后的字符串**。

  ```js
  var rs = fs.createReadStream('test.md', { highWaterMark: 11 });
  rs.setEncoding('utf8');
  ```

  setEncoding如何解决乱码的？
  在调用setEncoding()时，可读流对象在内部设置了一个**decoder对象**，每次data事件都**通过该decoder对象进行Buffer到字符串的解码**，然后传递给调用者。而decoder对象是string_decoder模块StringDecoder的实例对象。

  StringDecoder在得到编码后，虽然如前面例子，每一次buffer长度限制为11，但在知道**宽字节字符串在UTF-8编码下是以3个字节的方式存储的**，所以第一次write()写入时，只输出钱9个字节转码形成的字符，两个**剩余字节被保留在StringDecoder实例内部**，在第二次write()写入时，会**将前面剩余的字节和后续字节组合在一起，再次用3的整数倍字节进行转码**，于是乱码就通过这种中间形式被解决了。

  但注意，**string_decoder模块只能处理UTF-8、Base64和UCS-2/UTF-16LE这3种编码**。

##### 正确拼接Buffer

  正确的拼接方式是用一个数组来存储接收到的所有Buffer片段并记录下所有片段的总长度，然后调用Buffer.concat()方法生成一个合并的Buffer对象。（Buffer.concat()方法封装了从小Buffer对象向大Buffer对象的复制过程）

  ```js
  var fs = require('fs');
  var iconv = require('iconv-lite');
  var rs = fs.createReadStream('test.md', { highWaterMark: 11 }); // 将文件可读流的每次读取的Buffer长度限制为
  var chunks = [];
  var size = 0;

  rs.on("data", function(chunk) {
    chunks.push(chunk);
    size += chunk.length;
  });

  rs.on("end", function() {
    var buf = Buffer.concat(chunks, size);
    var str = iconv.decode(buf, "utf8");
    console.log(str);
})
  ```

### Buffer与性能

  Buffer在文件I/O和网络I/O中运用广泛，尤其在网络传输中，其性能举足轻重。在应用中，通常会操作字符串，但在网路传输中，都需要转换为Buffer，用以进行二进制数据传输，在web应用中，字符串转换到Buffer是时时刻刻发生的，故**提高字符串到Buffer的转换效率，可以很大程度地提高网络吞吐率**。

  ```js
  var http = require('http');
  var helloworld = '';
  for(var i = 0; i < 1024 * 10; i++) {
    helloworld += "a";
  }

  // helloworld  = new Buffer(helloworld); // 预先转换静态内容为Buffer对象

  http.createServer(function(req, res) {
    res.writeHead(200);
    res.end(helloworld)
  }).listen(8001);
  ```

  通过**预先转换静态内容为Buffer对象，可以有效地减少CPU的重复使用，节省服务器资源**。在Node构建的web应用中，可以选择将页面中的动态内容和静态内容分离，静态内容部分可以通过预先转换为Buffer的方式，使性能得到提升。由于文件自身是二进制数据，所以在不需要改变内容的场景下，尽量只读取buffer，然后直接传输，不做额外的转换，避免损耗。

  此外，在文件读取中，highWaterMark的设置对性能的影响至关重要。

- highWaterMark设置对Buffer内存的分配和使用有一定的影响。
- highWaterMark设置过小，可能会导致系统调用次数过多。

  对于读取一个相同的大文件时，**highWaterMark值的大小与读取速度的关系：该值越大，读取速度越快**。

## 网络编程

  在web领域，大多数编程语言需要专门的web服务器作为容器，如ASP、ASP.NET需要IIS作为服务器，PHP需要搭载Apache或nginx环境，JSP需要tomcat服务器等。而对于Node而言，只需几行代码即可构建服务器，无需额外的容器。

### 构建TCP服务

  **TCP全名为传输控制协议**，在OSI模型中（物理层、链路层、网络层、传输层、会话层、表示层、应用层）中属于传输层协议。
  许多应用层协议基于TCP创建，如HTTP、SMTP、IMAP等协议。

  TCP为面向连接的协议，在传输之前需要**3次握手**形成会话。在会话形成之后，服务器端和客户端之间才能发送数据。
  在创建会话的过程中，服务器端和客户端分别提供一个**套接字**，两个套接字共同形成一个连接，服务器端和客户端通过套接字实现两者之间连接的操作。

#### 创建一个TCP服务器

  ```js
  var net = require('net');
  var server  = net.createServer(function(socket) {
    socket.on("data", function(data) {
      socket.write("in data transfer")
    });
    socket.on("end", function() {
      console.log('disconnect');
    });
    socket.write("welcome to tcp server");
  });
  server.listen(8124, function() {
    console.log("server bound");
  })
  ```

#### TCP服务的事件

##### 服务器事件

  通过net.createServer()创建的服务器（server），它的本质是一个EventEmitter实例，它的自定义事件有：

- listening
  server.listen(port, listeningListener)，作为listen第二个参数传入；
  调用server.listen()绑定端口或者Domain Socket后触发
- connection
  net.createServer(..., connection)，作为最后一个参数传入；
  每个客户端套接字连接到服务器端时触发
- close
  当服务器关闭时触发
  在调用server.close()后，服务器将停止接受新的套接字连接，但保持当前存在的连接，等待所有连接都断开后，会触发该事件。
- error
  当服务器发生异常时触发该事件
  如侦听一个使用中的端口（server.on("error", handler)），将会触发一个异常，
  如不侦听error事件，服务器将会抛出异常

##### 连接事件

  服务器可以同事与多个客户端连接，对于每个连接而言是典型的可读可写**Stream对象**。Stream对象可以用于服务器和客户端之间的通信，既可以通过data事件从一端**读取**另一端发来的数据，也可以通过**write()**方法从一端向另一端**发送数据**。它的自定义事件有：

- data
  当一端调用write()发送数据时，另一端会触发data事件，事件传递的数据即是write发送的数据。
- end
  当连接中的任意一端发送FIN数据时将触发该事件。
- connect
  该事件用于客户端，当套接字与服务器端连接成功时被触发。
- drain
  当任意一端调用write()发送数据时，当前这端会触发该事件。
- error
  异常发生时触发该事件。
- close
  套接字完全关闭时触发该事件。
- timeout
  当一定时间后连接不再活跃，该事件被触发，通知用户当前该连接已经被闲置。

  **TCP的套接字为可读可写的Stream对象。**可利用pipe()方法巧妙地实现管道操作。

  TCP针对网络中的**小数据包有一定的优化策略：Nagle算法**。若每次只发送一个字节的内容，网络中将充满只有极少数有效数据的数据包，将十分浪费网络资源。Nagle算法则是针对这种情况，**要求缓冲区的数据达到一定数量或者一定时间后才将其发出**，所以小数据包会被Nagle算法合并，以此优化网络。这样虽然能使网络带宽被有效利用，但**数据可能被延迟发送**。

  node中，TCP默认启用Nagle算法。

### 构建UDP服务

  UDP——用户数据包协议，属于传输层协议。

  UDP与TCP：
  均属于传输层协议，
  UDP不是面向连接。
  TCP连接一旦建立，所有会话都**基于连接完成**，客户端如果要与另一个TCP服务通信，需要另外创建一个套接字来完成连接。
  UDP中一个套接字可以与多个UDP服务通信，其提供面向事务的简单不可靠信息传输服务，网络差的情况下存在丢包严重的问题。
  **UDP无需连接、资源消耗低、处理快速且灵活**，偶尔丢包问题影响不打，常用于音、视频。

#### 创建UDP服务

##### 创建UDP套接字

  UDP套接字一旦创建，既可以作为客户端发送数据，也可以作为服务器端接收数据。

  ```js
  // 创建UDP套接字
  var dgram = require("dgram");
  var socket = dgram.createSocket("udp4");
  ```

##### 创建UDP服务器端

  调用dgram.bind(port, [address])绑定网卡和端口可以让UDP套接字接收网络消息。

  ```js
  // 创建UDP套接字
  var dgram = require("dgram");
  var server = dgram.createSocket("udp4");

  // 创建UDP服务器端
  server.on("message", function(msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  });

  server.on("listening", function() {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
  });

  server.bind(41234);
  ```

##### 创建UDP客户端
  
  当套接字对象用在客户端时，可以调用send()方法发送消息到网络中。其参数为：发送的消息、消息的偏移量、消息的长度、目标端口、目标地址、发送完成后的回调。

```js
var dgram = require("dgram");
var message = "client of udp message";
var client = dgram.createSocket("udp4");
client.send(message,0, message.length, 41234, "localhost", function(err, bytes) {
  client.close();
})
```

##### UDP套接字事件

  UDP套接字是一个EventEmitter实例。它具备如下自定义事件：

- message
  当UDP套接字侦听网卡端口后，接收到消息时触发该事件。
- listening
  当UDP套接字开始侦听时触发该事件。
- close
  调用close方法时触发该事件，并不再触发message事件，如需再次触发message事件，重新绑定即可
- error
  异常发生时触发该事件，若不侦听，异常直接抛出，是进程退出。

### 构建HTTP服务

  ```js
  var http = require('http');
  http.createServer(function(req, res) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end("server of http\n");
  }).listen(1337, '127.0.0.1');
  console.log("server running at http://127.0.0.1:1337/");
  ```

  node提供了基本的http和https模块用于HTTP和HTTPS的封装。
  http全名为超文本传输协议（hyper text transfer protocol），它属于应用层协议。

#### http

##### http报文

查看报文
```powershell
curl -v http://127.0.0.1:1337
```

报文如下：
```text
StatusCode        : 200
StatusDescription : OK
Content           : server of http

RawContent        : HTTP/1.1 200 OK
                    Connection: keep-alive
                    Transfer-Encoding: chunked
                    Content-Type: text/plain
                    Date: Wed, 13 Aug 2025 09:07:22 GMT

                    server of http

Forms             : {}
Headers           : {[Connection, keep-alive], [Transfer-Encoding, chunked], [Content-Type, text/plain], [Date, Wed, 13 Aug 2025 09:07:22 GMT]}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 15
```

从协议的角度而言，如浏览器应用，它其实是一个HTTP代理，用户的行为将会通过它转化为HTTP请求报文发送给服务器端，服务器端在处理请求后，发送响应报文给代理，代理在解析报文后，将用户所需要的内容呈现在界面上。简而言之，**HTTP服务只做两件事情：处理HTTP请求和发送HTTP响应。**

#### http模块

  在node中，HTTP服务继承自TCP服务器（net模块），它能够与多个客户端保持连接，由于其采用事件驱动的形式，并不为每一个连接创建额外的线程或进程，保持很低的内存占用，所以能实现高并发。

  HTTP服务与TCP服务：
   在开启keepalive之后，一个TCP会话可以用于多次请求和响应，**TCP服务以connection为单位进行服务，HTTP服务以request为单位进行服务**。http模块即是将connection到request的过程进行了封装。

  http模块将连接所用套接字的读写抽象为serverRequest和serverResponse对象，它们分别对应请求和响应操作。

1. HTTP请求
  对于TCP连接的读操作。http模块将其封装为ServerRequest对象。

2. HTTP响应
  ServerResponse对象，它封装了对底层连接的写操作，可看成一个可写的流对象。
  影响报文头部信息的API: res.setHeader()——设置头部信息，res.writeHeader()——将修改后的头部信息写入到连接中。
  设置报文体部分：res.write()——发送数据，res.end()发送信号告知服务器响应结束。res.end()会先调用write发送数据，然后再发送信号。
  【注意】**报头是在报文体发送前发送的**，一旦开始了数据的发送，writeHead()和setHeader()将不再生效。此外，无论服务器在处理业务时是否发生异常，**务必在结束时调用res.end()结束请求**，否则客户端将一直处于等待的状态。
  
3. HTTP服务的事件
  HTTP服务器抽象了一些事件，以供应用层使用，同样典型的是，服务器也是一个EventEmitter实例。

- connection事件
  当客户端与服务器端建立底层的TCP连接时，服务器触发一次connection事件。
- request事件
  建立连接后，当请求数据发送到服务器端，在解析出HTTP请求头后将会触发该事件。
- close事件
  当已有的连接都断开时，触发该事件。
- checkContinue事件
  客户端再发送较大的数据时，并不会将数据直接发送，而是先将一个头部带except: 100-continue的请求发送到服务器，服务器会触发checkContinue事件（若无监听该事件，服务器自动响应客户端100 continue状态码，表示接收数据上传），相应客户端400 bad request则表示拒绝客户端继续发送数据。
  【注意】**当该事件发生时不会触发request事件，两个事件之间互斥**。
- connect事件
  客户端发起CONNECT请求时触发，而发起CONNECT请求通常在HTTP代理时出现。若不监听该事件，发起该请求的连接将会关闭。
- upgrade事件
  当客户端要求升级连接的协议时，需要和服务器端协商，客户端会在请求头中带上upgrade字段，服务器端会在接收到这样的请求时触发该事件。
- clientError事件
  连接的客户端触发error事件时，这个错误会传递到服务器端，此时触发该事件。

#### http客户端

  http模块提供了一个底层API：http.request(options,connect)用于构造HTTP客户端。

  ```js
  var options = {
    hostname: '127.0.0.1',
    port: 1224,
    path: "/",
    method: "GET",
  }
  var req = http.request(options, function(res){})
  ```

  options参数决定了HTTP请求头中的内容，它的选项有：

- host
  服务器域名或IP地址，默认localhost
- hostname
  服务器名称
- port
  服务器端口，默认80
- localAddress
  建立网络连接的本地网卡
- socketPath
  domain套接字路径
- method
  HTTP请求方法，默认GET
- path
  请求路径，默认/
- headers
  请求头对象
- auth
  basic认证

  报文体的内容由请求对象的write()和end()方法实现：通过write()方法向连接中写入数据，通过end()方法告知报文结束。

##### HTTP响应

  在ClientRequest对象中，它的事件叫做response。ClientRequest在解析响应报文时，解析完响应头则触发response事件，同时传递一个响应对象以供操作ClientResponse。后续响应报文体以只读流的方式提供。

##### HTTP代理

  http提供的ClientRequest对象是基于TCP层实现的，**在keepalive情况下，一个底层会话连接可以多次用于请求**。http模块包含一个**默认的客户端代理对象http.globalAgent**，它对每个服务器端（host+port）创建的连接进行管理，默认情况下，ClientRequest对象对同一个服务器端发起的HTTP请求**最多可以创建5个连接**。

##### HTTP客户端事件

- response
  与服务器端的request事件对应的客户端在请求发出后得到服务器响应时，会触发该事件。
- socket
  底层连接池中建立的连接分配给当前请求对象时触发该事件。
- connect
  客户端向服务器端发起CONNECT请求时，服务器端若响应200，客户端触发该事件。
- upgrade
  客户端向服务器端发起UPGRADE请求时，服务器端若响应101，客户端触发该事件。
- continue
  客户端向服务器端发起Except: 100-continue头信息试图发送较大数据量，服务器端若响应100，客户端触发该事件。

### 构建WebSocket服务

WebSocket更接近于传输层协议， 它是在TCP上定义独立的协议。
WebSocket协议与node之间的配合堪称完美：

- WebSocket客户端**基于事件的编程模型**与Node中自定义事件相差无几。
- WebSocket实现了**客户端与服务器端之间的长连接**，而Node事件驱动的方式十分擅长**与大量的客户端保持高并发连接**。

相比于传统HTTP，WebSocket有如下好处：

- 客户端与服务器端**只建立一个TCP连接**，可以使用更少的连接。
- WebSocket**服务器端可以推送数据到客户端**，远比HTTP请求响应模式更灵活、更高效。
- 有**更轻量级的协议头**，减少数据传送量。


在WebSocket之前，网页客户端与服务器端进行通信最高效的是**Comet技术**。实现Comet技术的细节为采用长轮询（long-polling）或iframe流。**长轮询原理**为客户端向服务器端发起请求，服务器端**只在超时或有数据响应时断开连接**（res.end()）；客户端在收到数据或超时后重新发起请求。这个请求行为拖着长长的尾巴，是故用Comet（彗星）来命名它。

使用websocket，**网页客户端只需一个TCP连接即可完成双向通信**，在服务器端与客户端频繁通信时，无需频繁断开连接与重发请求。连接可以得到高效应用，编程模型也十分简洁。

#### WebSocket握手

  客户端建立连接时，通过HTTP发起请求报文。
  ```
  GET /chat HTTP/1.1
  Host: server.example.com
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
  Sec-WebSocket-Protocol: chat, superchat
  Sec-WebSocket-Version: 13
  ```

  与普通的HTTP请求协议略有区别的部分在于WebSocket包含如下协议头：

  ```
  Upgrade: websocket
  Connection: Upgrade
  ```

  上述Upgrade、Connection两个字段表示请求服务器升级协议为WebSocket；**Sec-WebSocket-Key用于安全校验**，它的值为随机生成的Base64编码的字符串，**服务端接收到之后将其与对应的字符串相连，形成新字符串**，并**通过sha1安全散列算法**计算出结果后，再进行Base64编码，最后返回给客户端。

  Sec-WebSocket-Protocol与Sec-WebSocket-Version分别指定子协议和版本号。

  服务器端在处理完请求后，响应如下报文（告知客户端正在更换协议，更换应用层协议为WebSocket协议）：
  ```
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= 
  Sec-WebSocket-Protocol: chat
  ```

Sec-WebSocket-Accept为基于Sec-WebSocket-Key生成的字符串， **客户端会校验Sec-WebSocket-Accept的值**，如果成功，将开始数据传输。

一旦websocket握手成功，服务器端与客户端将会呈现对等的效果，都能接收和发送消息。

#### WebSocket数据传输

  在握手顺利完成后，当前连接将不再进行HTTP的交互，而是开始**WebSocket的数据帧协议**，实现客户端与服务器端的数据交换。

  [协议升级](./imgs/websocket_protocol_upgrade.png)


  握手完成后，**客户端的onopen()将会被触发执行**。服务端没有onopen()方法可言，为完成TCP套接字事件到WebSocket事件的封装，需在接收数据时进行处理，**WebSocket的数据帧协议是在底层data事件上封装完成的**。

  客户端调用**send()发送数据**时，服务器端**触发onmessage()**；服务器端调用send()发送数据，客户端onmessage()触发。

  出于安全，客户端需对发送的数据帧进行掩码处理，**服务器一旦收到无掩码数据帧，连接将关闭**。而服务器发送到客户端的数据则无须做掩码处理，**客户端若收到带掩码的数据帧，连接将关闭**。

##### websocket数据帧

  websocket数据帧每8位（即1个字节）为一列。

  [websocket](./imgs/websocket%E6%95%B0%E6%8D%AE%E5%B8%A7.png)

- fin
  若该数据帧为最后一帧，fin位值为1，其余情况为0。当数据没有被分为多帧时，它既为第一帧也为最后一帧。
- rsv1、rsv2、rsv3
  各为1位长，用于扩展。当有已协商的扩展时，这些值可能为1，其余情况为0。
- opcode
  长为4位的操作码，值范围为0-15，用于解释当前数据帧，具体值含义如下所示
  0：附加数据帧；1：文本数据帧；2：二进制数据帧；8：发送一个连接关闭的数据帧；
  9：ping数据帧；10：pong数据帧；其余值暂未定义。
  **ping\pong数据帧用于心跳检测，当一端发送ping数据帧时，另一端必须发送pong数据帧作为响应**，告知对方这一端仍然处于响应状态。
- masked
  是否进行掩码处理，长度为1位。客户端发送给服务端，值为1；服务端发送给客户端，值为0。
- payload length
  一个7、7+16、7+64位长的数据位，标识数据的长度。
  值在0~125之间：该值为数据真实长度；
  值为126：后16位的值为数据的真实长度；
  值位127：后64位的值为数据的真实长度。
- masking key
  masked值为1时存在，是一个32位长的数据位，用于解密数据。
- payload data
  目标数据，位数为8的倍数。

【注意】node没有内置websocket库，但社区ws模块封装了websocket的底层实现。

### 网络服务与安全
  
  node在网络安全上提供了3个模块，分别为**crypto、tls、https**。

- crypto:主要用于加密解密，比如SHA1、MD5等加密算法。
- tls模块:提供了与net模块类似的功能，区别在于它建立在TLS/SSL加密的TCP连接上。
- https: 它完全与http模块接口一致，区别也仅在于它建立于安全的连接之上。

#### TLS/SSL

##### 密钥

  TLS/SSL是一个**公钥/私钥非对称**的结构，每个服务器端和客户端都有自己的公私钥。**公钥用来加密传输数据，私钥用来解密接收数据**。公私钥是配对的，通过公钥加密的数据需要通过私钥进行解密。故**在建立安全连接之前，客户端和服务器端之间需要交换公钥**。客户端/服务器端发送数据时需要通过服务器端/客户端的公钥进行解密，如此才能完成加解密过程。

  [客户端和服务器端交换密钥](./imgs/tls_ssl_%E5%8A%A0%E8%A7%A3%E5%AF%86%E8%BF%87%E7%A8%8B.png)

  node底层采用openssl实现TLS/SSL。

  【注意】非对称的公私钥加密，在网络中是可能**存在窃听的情况**，典型例子为：中间人攻击。客户端与服务器端在交换公钥的过程中，中间人对客户端扮演服务器端的角色，对服务器端扮演客户端的角色，因此客户端和服务器端几乎感受不到中间人的存在。
  为解决这种问题，**数据传输过程中需对得到的公钥进行认证，以确认所得公钥出自目标服务器**，TLS/SSL则是引入了**数字证书**来进行认证。

  ```shell
  # 生成服务器端私钥
  openssl genrsa -out server.key 1024
  # 生成客户端私钥
  openssl genrsa -out client.key 1024
  # 生成服务端公钥
  openssl rsa -in server.key -pubout -out server.pem
  # 生成客户端公钥
  openssl rsa -in client.key -pubout -out client.pem
  ```

##### 数字证书

  数字证书中包含了服务器的名称、主机名、服务器的公钥、签名颁发机构的名称、来自签名颁发机构的签名。在建立连接之前，会通过整数中的签名确认收到的公钥是来自目标服务器的，从而产生信任关系。

  数字认证中心（CA —— Certificate Authority）为站点颁发证书，这个证书中具有CA通过自己的公私钥实现的签名。
  为得到签名证书**服务器端通过自己的私钥生成CSR文件**（Certificate Signing Request，证书签名请求）。**CA机构通过该CSR文件颁发属于该服务器端的签名证书**，通过CA机构即可验证证书是否合法。

  自签名证书：即自己扮演CA机构，给自己的服务器端颁发证书签名。
  
1. 以下生成了扮演CA角色所需的文件：
  ```shell
  # 生成私钥
  openssl genrsa -out ca.key 1024
  # 生成CSR文件
  openssl req -new -key ca.key -out ca.csr
  # 通过私钥自签名生成证书
  openssl x509 -req -in ca.csr -signkey ca.key -out ca.crt
  ```

2. 对于服务器端，需向CA机构申请签名证书，在申请签名证书前依旧要创建服务器端自己的CSR文件
```shell
```

3. 服务器端向自己的CA机构申请签名，得到一个带有CA签名的证书

4. 客户端在发起连接前获取服务器端证书，通过CA证书验证服务器端证书的真伪，此外还包含对服务器名称、IP地址等进行验证过程。

#### TLS服务

  将构建服务所需的证书备齐后，通过node的tls模块可创建一个安全的TCP服务。

  1. TLS服务器端
    ```shell
    # 生成服务器端端私钥
    openssl genrsa -out server.key 1024
    # 生成csr
    openssl req -new -key server.key -out server.csr
    # 生成签名证书
    openssl x509 -req -CA ca.crt -CAkey ca.key -CAcreateserial -in server.csr -out server.crt
    ```

  2. TLS客户端
  在构建客户端之气那，同样需要为客户端生成自己的私钥和签名

  ```shell
  # 生成客户端私钥
  openssl genrsa -out client.key 1024
  # 生成csr
  openssl req -new -key client.key -out client.csr
  # 生成签名证书
  openssl x509 -req -CA ca.crt -CAkey ca.key -CAcreateserial -in client.csr -out client.crt
  ```

【注】openssl命令参数说明
```text
  说明：
  -in 文件名：指定输入文件
  -out 文件名：指定输出文件
  -inkey file：指定密钥输入文件，默认是私钥文件，指定了"-pubin"则表示为公钥文件，使用"-certin"则表示为包含公钥的证书文件
  -pubin：指定"-inkey file"的file是公钥文件
  -certin：使用该选项时，表示"-inkey file"的file是包含公钥的证书文件
  -passin arg：传递解密密码。若验证签名时实用的公钥或私钥文件是被加密过的，则需要传递密码来解密。密码的格式见"openssl 密码格式"
  【功能选项：】
  -sign：签名并输出签名结果，注意，该选项需要提供RSA私钥文件
  -verify：使用验证签名文件
  -encrypt：使用公钥加密文件
  -decrypt：使用私钥解密文件
```

#### HTTPS服务

  HTTPS服务就是工作在TLS/SSL上的HTTP。

  创建HTTPS服务：

  1. 准备证书，可直接用上文生成的私钥和证书
  2. 创建HTTPS服务
  创建HTTPS服务只比HTTP服务多一个选项配置，其余地方几乎相同。
  3. HTTPS客户端