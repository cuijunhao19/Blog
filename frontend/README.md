# 博客前端项目说明

## 项目概述

本目录是博客系统的前端部分，基于 Vue 3 + Vite 构建，采用前后端分离架构，负责用户界面展示和交互逻辑。主要功能包括博客列表展示、博客创建 / 编辑 / 删除、用户登录注册等。

## 目录结构及功能说明

plaintext

```plaintext
frontend/
├── node_modules/          # 项目依赖包（自动生成，无需手动修改）
├── public/                # 静态资源目录（构建时会原样复制到输出目录）
│   ├── vite.svg           # 默认图标
│   └── tinymce/           # 富文本编辑器 TinyMCE 的插件和配置
│       └── plugins/       # TinyMCE 所需插件（如 help、toc 等）
├── src/                   # 源代码目录（核心开发目录）
│   ├── assets/            # 静态资源（样式、图片等，会被构建工具处理）
│   │   └── css/
│   │       └── global.css # 全局样式表
│   ├── components/        # 可复用组件
│   │   └── RichTextEditor.vue # 富文本编辑器组件（封装 TinyMCE）
│   ├── routes/            # 路由配置
│   │   └── index.js       # 定义路由规则、导航守卫（权限控制）
│   ├── utils/             # 工具函数
│   │   ├── request.js     # 封装 Axios（请求拦截、响应拦截、Token 处理）
│   │   └── format.js      # 格式化工具（如 HTML 转纯文本）
│   ├── views/             # 页面组件（对应路由的页面）
│   │   ├── BlogList.vue   # 博客列表页
│   │   ├── CreateBlog.vue # 创建博客页
│   │   ├── BlogDetail.vue # 博客详情页
│   │   ├── EditBlog.vue   # 编辑博客页
│   │   ├── Login.vue      # 登录页
│   │   ├── Register.vue   # 注册页
│   │   └── MyBlogs.vue    # 我的博客页
│   ├── App.vue            # 根组件（路由出口在此渲染）
│   └── main.js            # 入口文件（创建 Vue 实例、挂载路由）
├── .gitignore             # Git 忽略文件配置（如 node_modules、dist 等）
├── index.html             # 入口 HTML（Vue 应用挂载点）
├── package.json           # 项目配置（依赖、脚本命令）
├── package-lock.json      # 依赖版本锁定文件
├── vite.config.js         # Vite 构建配置（插件、服务器设置等）
└── README.md              # 本说明文件
```

## 核心文件作用详解

1. **src/routes/index.js**

定义路由规则和导航守卫：

- 配置页面路径与组件的映射（如  `/`  对应博客列表页）
- 通过  `meta.requiresAuth`  标记需要登录的路由（如创建 / 编辑博客）
- 导航守卫实现权限控制（未登录用户跳转至登录页）和动态页面标题设置。

2. **src/utils/request.js**

封装 Axios 实例：

- 配置后端基础地址（通过环境变量  `VITE_API_URL`  或默认  `http://localhost:5000`）
- 请求拦截器：自动添加 Token 到请求头（从  `localStorage`  获取）
- 响应拦截器：统一处理错误（如 Token 过期时清除缓存并跳转登录页）。

3. **src/views/CreateBlog.vue**

创建博客的核心页面：

- 使用  `RichTextEditor`  组件实现富文本编辑
- 表单验证（标题和内容不能为空）
- 提交数据到后端  `/api/blogs`  接口，成功后跳转至博客列表。

4. **vite.config.js**

Vite 构建配置：

- 集成 Vue 插件（`@vitejs/plugin-vue`）
- 配置静态资源目录和开发服务器（禁用缓存、监听静态资源变化）。
