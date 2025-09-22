// routes/blogRoutes.js
const express = require("express");
const Blog = require("../models/Blog"); // 导入博客模型（用于操作数据库）

// 1. 创建路由实例（类似“接口的容器”）
const router = express.Router();

// 2. 定义接口：GET /api/blogs → 获取所有博客列表
router.get("/", async (req, res) => {
  try {
    // 从数据库中查询所有博客，按发布时间倒序（最新的博客排在前面）
    const blogs = await Blog.find().sort({ publishTime: -1 });

    // 给前端返回成功响应：状态码 200，数据是 blogs 数组
    res.status(200).json({
      success: true,
      count: blogs.length, // 博客总数
      data: blogs, // 博客列表数据
    });
  } catch (err) {
    // 出错时返回错误响应：状态码 500（服务器内部错误）
    res.status(500).json({
      success: false,
      message: "服务器错误，获取博客列表失败",
    });
  }
});

// 新增：POST /api/blogs → 创建博客
router.post("/", async (req, res) => {
  try {
    // 1. 从请求体中获取前端提交的博客数据（req.body 由 express.json() 中间件解析）
    const { title, author, content } = req.body;

    // 2. 验证数据（虽然前端也会验证，但后端必须再验证一次，防止恶意提交）
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "博客标题和内容不能为空",
      });
    }

    // 3. 用 Blog 模型创建新博客（存入数据库）
    const newBlog = await Blog.create({
      title: title,
      author: author || "匿名作者", // 若前端没传作者，用默认值
      content: content,
      // publishTime 不用传，模型中已配置 default: Date.now
    });

    // 4. 返回成功响应（包含创建的博客数据）
    res.status(201).json({
      // 201 状态码表示“创建成功”
      success: true,
      data: newBlog,
    });
  } catch (err) {
    // 5. 捕获错误（如数据库异常）
    res.status(500).json({
      success: false,
      message: "创建博客失败：" + err.message,
    });
  }
});

// 3. 导出路由实例，供入口文件挂载
module.exports = router;
