// utils/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. 生成 Token（登录成功后调用）
const generateToken = (userId) => {
  // 签名密钥：从环境变量读取（避免硬编码，可在 .env 中自定义）
  const secret = process.env.JWT_SECRET || "your-secret-key"; // 开发环境默认值，生产环境必须改！

  // 生成 Token：包含 userId，有效期 7 天
  return jwt.sign(
    { id: userId }, // Token 中携带的用户信息（避免敏感数据）
    secret,
    { expiresIn: "7d" } // 有效期
  );
};

// 2. 验证 Token 的中间件（需要权限的接口前调用）
const verifyToken = (req, res, next) => {
  try {
    // 从请求头中获取 Token（前端需在请求头携带 Authorization: Bearer <Token>）
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "未登录或 Token 不存在",
      });
    }

    // 提取 Token（去掉 "Bearer " 前缀）
    const token = authHeader.split(" ")[1];

    // 验证 Token 有效性
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret); // decoded 包含 Token 中的用户信息（如 userId）

    // 将用户 ID 存入 req 对象，后续接口可通过 req.userId 获取当前登录用户
    req.userId = decoded.id;
    next(); // Token 有效，继续执行后续接口逻辑
  } catch (err) {
    // Token 无效（如过期、篡改）
    return res.status(401).json({
      success: false,
      message: "Token 无效或已过期，请重新登录",
    });
  }
};

// 导出工具函数
module.exports = { generateToken, verifyToken };
