// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();  // 读取 .env 文件的环境变量

// 连接 MongoDB 的函数
const connectDB = async () => {
  try {
    // 调用 mongoose.connect 连接数据库
    await mongoose.connect(process.env.MONGODB_URI, {
      // 兼容配置（避免新版本 Mongoose 警告）
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 数据库连接成功！');
  } catch (err) {
    // 连接失败时打印错误，退出程序
    console.error('MongoDB 连接失败：', err.message);
    process.exit(1);  // 退出进程（1 表示异常退出）
  }
};

// 导出连接函数，供入口文件调用
module.exports = connectDB;