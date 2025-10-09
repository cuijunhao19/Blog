// models/Blog.js
const mongoose = require("mongoose");

// 1. 定义博客的“数据模式”（Schema）：指定字段名、类型、是否必填等规则
const blogSchema = new mongoose.Schema({
  title: {
    type: String, // 字段类型：字符串（博客标题）
    required: [true, "博客标题不能为空"], // 必填，没填的话提示错误
    maxlength: [100, "标题不能超过 100 个字符"], // 长度限制
  },
  content: {
    type: String, // 字段类型：字符串（博客内容）
    required: [true, "博客内容不能为空"],
  },
  author: {
    type: String, // 字段类型：字符串（作者名，暂时手动输入，后续关联用户）
    required: [true, "作者名不能为空"],
    default: "匿名作者", // 默认值：没填作者时显示“匿名作者”
  },
  authorId: {
    // 新增：关联用户 ID（用于验证权限）
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 关联 User 模型
    required: true,
  },
  publishTime: {
    type: Date, // 字段类型：日期（发布时间）
    default: Date.now, // 默认值：当前时间（创建博客时自动填充）
  },
});

// 2. 根据 Schema 创建“数据模型”（Model）：对应 MongoDB 中的 `blogs` 集合（表）
// 注意：mongoose 会自动把模型名（Blog）转成小写复数形式作为集合名（blogs）
const Blog = mongoose.model("Blog", blogSchema);

// 3. 导出模型，供路由使用（后续用它操作数据库：增删改查）
module.exports = Blog;
