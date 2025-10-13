// routes/blogRoutes.js
const express = require("express");
const Blog = require("../models/Blog"); // 导入博客模型（用于操作数据库）
const User = require("../models/User"); // 导入用户模型，用于关联作者
const { verifyToken } = require("../utils/jwt"); // 导入权限中间件

// 一、创建路由实例（类似“接口的容器”）
const router = express.Router();

// 二、定义接口：GET /api/blogs → 获取所有博客列表
router.get("/", async (req, res) => {
  try {
    // 1. 接收前端传的分页参数（默认值：第1页，每页10条）
    const page = parseInt(req.query.page) || 1; // 页码，默认1
    const limit = parseInt(req.query.limit) || 10; // 每页数量，默认10

    // 2. 计算“跳过的条数”（比如第2页，每页10条：跳过前10条，取11-20条）
    const skip = (page - 1) * limit;

    // 3. 分页查询：skip(跳过条数) + limit(取多少条) + sort(排序)
    const blogs = await Blog.find()
      .sort({ publishTime: -1 }) // 按发布时间倒序（最新在前）
      .skip(skip)
      .limit(limit);

    // 4. 查询总条数（用于计算总页数）
    const total = await Blog.countDocuments(); // countDocuments() 统计集合中总文档数

    // 5. 返回分页数据（包含当前页数据、总页数、总条数等）
    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: page, // 当前页码
        pageSize: limit, // 每页数量
        totalItems: total, // 总博客数
        totalPages: Math.ceil(total / limit), // 总页数（向上取整，比如11条→2页）
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "获取博客列表失败：" + err.message,
    });
  }
});

// 新增：获取当前登录用户的所有博客（需验证Token）
router.get("/my-blogs", verifyToken, async (req, res) => {
  try {
    // 1. 从Token中获取当前用户ID（req.userId由verifyToken中间件提供）
    const userId = req.userId;

    // 2. 按authorId查询博客，按发布时间倒序
    const myBlogs = await Blog.find({ authorId: userId }).sort({
      publishTime: -1,
    }); // 最新发布的在前

    res.status(200).json({
      success: true,
      data: myBlogs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "获取我的博客失败：" + err.message,
    });
  }
});

// 三、新增：POST /api/blogs → 创建博客 , 改动：需要权限
router.post("/", verifyToken, async (req, res) => {
  try {
    // 1. 从请求体中获取前端提交的博客数据（req.body 由 express.json() 中间件解析）
    const { title, content } = req.body;

    // 2. 验证数据（虽然前端也会验证，但后端必须再验证一次，防止恶意提交）
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "博客标题和内容不能为空",
      });
    }

    // 关联当前登录用户（req.userId 是 verifyToken 中间件存入的用户 ID）
    // 先查询用户信息，获取用户名（也可直接存 userId，后续查询时关联）
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    // 3. 用 Blog 模型创建新博客（存入数据库）
    const newBlog = await Blog.create({
      title,
      content,
      author: user.username, // 存入用户名
      authorId: req.userId, // 新增：存入用户 ID（用于后续验证权限）
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

// 五、新增：PUT /api/blogs/:id → 更新博客内容, 添加权限，判断是不是自己的博客
router.put("/:id", verifyToken, async (req, res) => {
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

    // 3. 先查询博客，验证是否存在 + 是否是当前用户的博客
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "博客不存在" });
    }

    // 验证权限：只有博客的作者（authorId 等于当前登录用户 ID）才能编辑
    if (blog.authorId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "没有权限编辑此博客" });
    }

    // 更新博客
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (err) {
    // 4. 错误处理（ID 格式错误或服务器异常）
    res.status(500).json({
      success: false,
      message: "更新博客失败：" + err.message,
    });
  }
});

// 新增：DELETE /api/blogs/:id → 删除博客, 添加权限
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    // 1. 获取 URL 中的博客 ID
    const blogId = req.params.id;

    // 2.验证博客是否存在 + 是否是自己的博客
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "博客不存在" });
    }

    if (blog.authorId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "没有权限删除此博客" });
    }

    // 3.删除博客
    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ success: true, message: "博客已删除" });
  } catch (err) {
    // 4. 错误处理（ID 格式错误或服务器异常）
    res.status(500).json({
      success: false,
      message: "删除博客失败：" + err.message,
    });
  }
});

// 导出路由实例，供入口文件挂载
module.exports = router;
