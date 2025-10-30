# 博客后端项目说明

## 项目概述

本目录是博客系统的后端部分，基于 Node.js + Express 构建，提供 RESTful API 服务，负责数据存储、业务逻辑处理和权限控制。采用 MongoDB 作为数据库，支持博客 CRUD、用户认证、文件上传等功能。

## 目录结构及功能说明

plaintext

```plaintext
backend/
├── node_modules/          # 项目依赖包（自动生成，无需手动修改）
├── config/                # 配置文件
│   └── db.js              # 数据库连接配置（连接 MongoDB）
├── models/                # 数据模型（定义 MongoDB 集合结构）
│   ├── Blog.js            # 博客模型（标题、内容、作者、发布时间等字段）
│   └── User.js            # 用户模型（用户名、密码、邮箱等字段，用于认证）
├── routes/                # 路由定义（处理 API 请求）
│   ├── blogRoutes.js      # 博客相关接口（列表、创建、详情、更新、删除）
│   ├── authRoutes.js      # 认证相关接口（登录、注册）
│   └── uploadRoutes.js    # 文件上传接口（如图片上传）
├── utils/                 # 工具函数
│   └── jwt.js             # JWT 工具（生成 Token、验证 Token）
├── uploads/               # 文件上传目录（存储用户上传的图片等资源）
├── .env                   # 环境变量（端口、数据库连接字符串、JWT 密钥等，不纳入 Git）
├── app.js                 # 后端入口文件（配置中间件、挂载路由、启动服务器）
├── package.json           # 项目配置（依赖、脚本命令）
└── README.md              # 本说明文件
```

## 核心文件作用详解

1. **app.js**

后端入口文件：

- 初始化 Express 实例，配置中间件（`cors`  解决跨域、`express.json()`  解析 JSON 请求体）
- 连接数据库（通过  `config/db.js`）
- 挂载路由（如  `/api/blogs`  对应博客接口、`/api/auth`  对应认证接口）
- 开放  `uploads`  目录为静态资源（允许前端直接访问上传的文件）
- 启动服务器，监听环境变量配置的端口（默认 5000）。

2. **models/Blog.js**

博客数据模型：

- 定义博客字段（标题、内容、作者名、作者 ID、发布时间等）
- 字段验证（如标题和内容必填，标题长度不超过 100 字符）
- 关联用户（`authorId`  字段关联 User 模型，用于权限验证）。

3. **routes/blogRoutes.js**

博客接口实现：

- `GET /`：分页获取博客列表（支持按发布时间排序）
- `POST /`：创建博客（需验证 Token，关联当前登录用户）
- `GET /:id`：获取单篇博客详情
- `PUT /:id`：更新博客（验证权限：仅作者可修改）
- `DELETE /:id`：删除博客（验证权限：仅作者可删除）
- `GET /my-blogs`：获取当前登录用户的所有博客。

4. **utils/jwt.js**

JWT 认证工具：

- `generateToken`：根据用户 ID 生成 Token（设置过期时间）
- `verifyToken`：中间件，验证请求头中的 Token 有效性，解析用户 ID 并挂载到  `req.userId`
