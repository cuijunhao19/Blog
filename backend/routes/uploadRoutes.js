// backend/routes/uploadRoutes.js（修改路由定义，添加错误处理）
const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { verifyToken } = require('../utils/jwt');

// 图片上传接口（添加错误处理中间件）
router.post('/', 
  verifyToken, 
  // 用 multer 处理文件，并捕获其错误
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        // multer 错误（如文件类型不对、大小超限）
        return res.status(400).json({
          success: false,
          msg: err.message || '文件上传失败'
        });
      }
      next(); // 无错误则继续执行后续逻辑
    });
  },
  // 处理上传成功后的逻辑
  (req, res) => {
    try {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: imageUrl
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        msg: '服务器处理失败：' + err.message
      });
    }
  }
);

module.exports = router;