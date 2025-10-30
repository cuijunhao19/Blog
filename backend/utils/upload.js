// backend/utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 定义图片存储目录（项目根目录下的uploads文件夹）
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // 自动创建目录
}

// 配置存储规则：重命名文件避免冲突
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// 限制文件类型（仅允许图片）和大小（5MB以内）
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('仅支持图片格式！'), false);
  }
});

module.exports = upload;