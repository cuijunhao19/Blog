// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db"); // 导入数据库连接函数
const blogRoutes = require("./routes/blogRoutes"); // 导入博客路由

// 1. 初始化 Express 实例（创建后端服务器）
const app = express();

// 2. 连接数据库（必须在启动服务前连接）
connectDB();

// 3. 配置中间件（处理请求的“插件”）
app.use(cors()); // 解决跨域：允许前端调用接口
app.use(express.json()); // 解析 JSON 格式的请求体（前端提交数据时需要）

// 4. 挂载路由：把博客路由挂载到 /api/blogs 路径下
// 比如：blogRoutes 中的 GET / → 实际接口是 GET /api/blogs
app.use("/api/blogs", blogRoutes);

// 5. 启动服务器（监听 .env 中定义的 PORT 端口）
const PORT = process.env.PORT || 5000; // 没找到环境变量时默认用 5000
app.listen(PORT, () => {
  console.log(`后端服务器已启动，地址：http://localhost:${PORT}`);
});
