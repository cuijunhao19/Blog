// routes/authRoutes.js
const express = require("express");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt"); // 导入生成 Token 的函数
const router = express.Router();

// 1. 用户注册接口：POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "用户名已被注册，请更换用户名",
      });
    }

    // 创建新用户（密码会在 User 模型的 pre('save') 中间件中自动加密）
    const user = await User.create({ username, password });

    // 生成 Token（注册成功后自动登录，返回 Token）
    const token = generateToken(user._id);

    // 返回成功响应（不返回密码）
    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        username: user.username,
        token, // 返回 Token，前端存储后用于后续请求
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "注册失败：" + err.message,
    });
  }
});

// 2. 用户登录接口：POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      });
    }

    // 查询用户（需要显式 select('+password')，因为模型中 password 的 select 为 false）
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 验证密码（调用 User 模型的 comparePassword 方法）
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成 Token
    const token = generateToken(user._id);

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: "登录成功",
      data: {
        username: user.username,
        userId: user._id, // 新增：返回用户ID
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "登录失败：" + err.message,
    });
  }
});

module.exports = router;
