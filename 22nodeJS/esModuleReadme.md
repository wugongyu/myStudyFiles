
CommonJS (CJS) 和 ES Module (ESM) 是 JavaScript 中两种主流的**模块系统**，它们在设计理念、语法和运行机制上有显著区别。以下是它们的核心对比：

---

### **1. 语法差异**

| 特性         | CommonJS (CJS)                     | ES Module (ESM)                     |
|--------------|------------------------------------|-------------------------------------|
| **导出**     | `module.exports = ...` 或 `exports.foo = ...` | `export const foo = ...` 或 `export default ...` |
| **导入**     | `const mod = require('path')`      | `import mod from 'path'` 或 `import { foo } from 'path'` |

```javascript
// CommonJS 示例
// 导出
module.exports = { a: 1 };
exports.b = 2;

// 导入
const mod = require('./mod');
console.log(mod.a); // 1
```

```javascript
// ESM 示例
// 导出
export const a = 1;
export default { b: 2 };

// 导入
import def, { a } from './mod.js';
console.log(a); // 1
console.log(def.b); // 2
```

---

### **2. 加载机制**

| 特性          | CommonJS                          | ES Module                          |
|---------------|-----------------------------------|------------------------------------|
| **加载时机**  | **运行时同步加载**（动态导入）     | **编译时静态解析**（静态导入）      |
| **动态性**    | 支持 `require()` 动态路径          | 路径必须是静态字符串（`import()` 除外） |
| **作用域**    | 模块作用域（`module`, `exports` 等） | 顶层作用域（严格模式默认启用）       |

- **CommonJS** 在运行时加载模块，可动态拼接路径（如 `require(path + '/mod')`）。
- **ESM** 在代码解析阶段确定依赖关系，路径必须为静态字符串（动态导入需用 `import()`）。

---

### **3. 执行与绑定**

| 特性          | CommonJS                          | ES Module                          |
|---------------|-----------------------------------|------------------------------------|
| **值复制**    | 导出的是值的**浅拷贝**             | 导出的是值的**只读引用**（动态绑定） |
| **循环依赖**  | 可能因加载顺序导致不一致            | 静态分析解决循环引用（更安全）      |

- **ESM 的绑定是活的**：

  ```javascript
  // ESM 示例
  // a.js
  export let count = 1;
  export const increment = () => { count++ };

  // b.js
  import { count, increment } from './a.js';
  console.log(count); // 1
  increment();
  console.log(count); // 2 （值实时更新）
  ```

- **CommonJS 复制值**：

  ```javascript
  // a.js
  let count = 1;
  module.exports = { count, increment: () => { count++ } };

  // b.js
  const { count, increment } = require('./a');
  console.log(count); // 1
  increment();
  console.log(count); // 1 （值未更新，因为解构是浅拷贝）
  ```

---

### **4. 环境支持**

| 环境          | CommonJS                     | ES Module                     |
|---------------|------------------------------|-------------------------------|
| **Node.js**  | 原生支持（`.js`, `.cjs`）     | 需设置 `"type": "module"` 或 `.mjs` 后缀 |
| **浏览器**    | 需打包工具（如 Webpack）      | 原生支持（`<script type="module">`） |
| **动态导入**  | `require()`                  | `import()`（返回 Promise）     |

---

### **5. 关键差异总结**

| **维度**       | **CommonJS**               | **ES Module**               |
|----------------|----------------------------|-----------------------------|
| **设计目标**   | 服务端模块化（Node.js）     | 语言标准（浏览器+服务端）    |
| **加载方式**   | 同步加载（阻塞执行）         | 异步加载（支持顶层 `await`） |
| **静态优化**   | 不支持 Tree-Shaking         | 支持 Tree-Shaking（打包优化） |
| **循环依赖**   | 可能出错                   | 通过引用绑定安全解决         |
| **未来趋势**   | 逐渐被 ESM 取代            | JavaScript 官方标准          |

---

### **6. 互操作性**

- **Node.js 中混合使用**：
  - ESM 可导入 CJS 模块（`import cjs from 'cjs-module'`），但只能获取 `module.exports` 的默认导出。
  - CJS **不能**直接导入 ESM 模块（需用 `import()` 动态导入）。
- **浏览器环境**：仅支持 ESM（CJS 需通过打包工具转换）。

---

### **何时选择？**

1. **新项目**：优先使用 **ES Module**（语言标准、静态优化、异步加载）。
2. **旧 Node.js 项目**：继续用 CommonJS，逐步迁移到 ESM。
3. **库开发**：同时提供 CJS 和 ESM 双版本（通过 `package.json` 的 `exports` 字段指定）。

```json
// package.json 示例
{
  "name": "my-package",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js", // ESM 入口
      "require": "./dist/cjs/index.js" // CJS 入口
    }
  }
}
```

---

### **总结**

- **CommonJS**：Node.js 的传统模块系统，动态加载，适用于服务端。
- **ES Module**：JavaScript 语言标准，静态结构，适用于浏览器和现代 Node.js，是未来方向。
- **迁移建议**：新项目首选 ESM，旧项目逐步迁移，库作者提供双格式支持。
