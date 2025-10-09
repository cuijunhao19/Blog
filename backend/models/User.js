const mongoose = require("mongoose");
const bcrypt = require('bcrypt');  // 导入加密工具
const { create } = require("./Blog");

// 1. 定义用户的“数据模式”（Schema）：指定字段名、类型、是否必填等规则
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "用户名不能为空"],
    unique: true, // 用户名必须唯一
    trim : true,  // 去除首尾空格
    minlength: [3, "用户名至少 3 个字符"], 
    maxlength: [20, "用户名不能超过 20 个字符"],
  },
  password: {
    type: String,
    required: [true, "密码不能为空"],
    minlength: [6, "密码至少 6 个字符"],
    select : false, // 默认不返回密码字段
  },
  createdAT : {
    type : Date,
    default : Date.now,
    select : false, // 默认不返回创建时间
  }

});

// 2. 在保存用户前对密码进行加密
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();  // 只有密码被修改时才加密（避免更新其他字段时重复加密）
   
    // 加密密码：10 是加密强度（越高越安全，但耗时更长）
    this.password = await bcrypt.hash(this.password, 10);
    next(); // 继续执行保存

});

// 3. 定义验证密码的方法（用于登录时验证）
userSchema.methods.comparePassword = async function(candidatePassword) {
    // this.password 是数据库加密后的密码，candidatePassword 是用户输入的密码
    return await bcrypt.compare(candidatePassword, this.password);
};

// 4.创建并导出用户模型
const User = mongoose.model("User", userSchema);
module.exports = User;

