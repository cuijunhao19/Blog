### 从零开始构建前后端分离项目（基于本仓库）

## 一、前端构建步骤

1. **初始化项目**

使用 Vite 创建 Vue 3 项目：

bash

```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install  # 安装依赖
```

2. **安装核心依赖**

bash

```bash
# 路由：vue-router
npm install vue-router@4
# HTTP 请求：axios
npm install axios
# 富文本编辑器：tinymce 及 Vue 组件
npm install tinymce @tinymce/tinymce-vue@5
```

3. **配置路由**

- 创建  `src/routes/index.js`，定义路由规则和导航守卫（参考本仓库实现）
- 在  `main.js`  中通过  `app.use(router)`  挂载路由。

4. **封装 HTTP 请求**

创建  `src/utils/request.js`，封装 Axios 并配置拦截器（处理 Token、错误统一处理）。

5. **开发页面组件**

在  `src/views`  目录下创建博客列表、创建 / 编辑博客等页面，实现 UI 和交互逻辑。

6. **运行与构建**

bash

```bash
npm run dev  # 启动开发服务器（默认地址：http://localhost:5173）
npm run build  # 构建生产版本（输出到 dist 目录）
```

## 二、后端构建步骤

1. **初始化项目**

bash

```bash
mkdir backend && cd backend
npm init -y  # 生成 package.json
```

2. **安装核心依赖**

bash

```bash
# Web 框架：express
npm install express@5
# 数据库：mongoose（MongoDB ODM）
npm install mongoose
# 跨域处理：cors
npm install cors
# 环境变量：dotenv
npm install dotenv
# 认证：jsonwebtoken、bcrypt（密码加密）
npm install jsonwebtoken bcrypt
# 文件上传：multer
npm install multer
```

3. **配置数据库**

创建  `config/db.js`，使用 mongoose 连接 MongoDB（通过  `.env`  配置连接字符串）。

4. **定义数据模型**

在  `models`  目录下创建  `Blog.js`  和  `User.js`，定义数据结构和验证规则。

5. **实现 API 路由**

在  `routes`  目录下创建博客、认证、上传相关路由，处理 CRUD 逻辑和权限验证。

6. **配置入口文件**

创建  `app.js`，配置中间件、挂载路由、启动服务器（参考本仓库实现）。

7. **运行后端**

bash

```bash
# 在 package.json 中添加脚本："dev": "node app.js"
npm run dev  # 启动服务器（默认地址：http://localhost:5000）
```

## 三、前后端联调

1. 确保前端  `src/utils/request.js`  中配置的后端地址与后端启动地址一致（如  `http://localhost:5000`）。
2. 分别启动前端（`npm run dev`）和后端（`npm run dev`），通过前端界面测试接口功能（如注册、登录、发布博客）。
