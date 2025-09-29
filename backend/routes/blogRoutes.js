// routes/blogRoutes.js
const express = require("express");
const Blog = require("../models/Blog"); // 导入博客模型（用于操作数据库）

// 一、创建路由实例（类似“接口的容器”）
const router = express.Router();

// 二、定义接口：GET /api/blogs → 获取所有博客列表
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

// 三、新增：POST /api/blogs → 创建博客
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

// 四、新增：GET /api/blogs/:id → 根据 ID 获取单篇博客
router.get("/:id", async (req, res) => {
  try {
    // 1. 从 URL 参数中获取博客 ID（req.params.id）
    const blogId = req.params.id;

    // 2. 用 Blog.findById() 查询数据库（_id 是 MongoDB 自动生成的唯一标识）
    const blog = await Blog.findById(blogId);

    // 3. 处理“博客不存在”的情况（ID 格式正确但查不到数据）
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "未找到该博客（可能已被删除）",
      });
    }

    // 4. 查询成功，返回博客数据
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    // 5. 处理错误（如 ID 格式错误，MongoDB 会抛 CastError）
    if (err.name === "CastError") {
      // ID 格式错误（如长度不对、包含非法字符）
      return res.status(400).json({
        success: false,
        message: "博客 ID 格式错误",
      });
    }
    // 其他服务器错误
    res.status(500).json({
      success: false,
      message: "获取博客详情失败：" + err.message,
    });
  }
});

// 五、新增：PUT /api/blogs/:id → 更新博客内容
router.put("/:id", async (req, res) => {
  try {
    // 1. 获取 URL 中的博客 ID 和请求体中的更新数据
    const blogId = req.params.id;
    const { title, author, content } = req.body;

    // 2. 验证数据（标题和内容不能为空）
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "博客标题和内容不能为空",
      });
    }

    // 3. 查找并更新博客（Mongoose 的 findByIdAndUpdate 方法）
    // 选项 { new: true } 表示返回更新后的最新数据，而不是更新前的数据
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, author: author || "匿名作者", content }, // 要更新的字段
      { new: true, runValidators: true } // 启用 Schema 验证（确保更新后的数据符合规则）
    );

    // 4. 处理“博客不存在”的情况
    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "未找到该博客（可能已被删除）",
      });
    }

    // 5. 更新成功，返回最新数据
    res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (err) {
    // 6. 错误处理（ID 格式错误或服务器异常）
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "博客 ID 格式错误",
      });
    }
    res.status(500).json({
      success: false,
      message: "更新博客失败：" + err.message,
    });
  }
});

// 导出路由实例，供入口文件挂载
module.exports = router;
