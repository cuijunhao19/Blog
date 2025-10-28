// src/utils/format.js
/**
 * 剥离HTML标签，保留纯文本（支持保留换行）
 * @param {string} html - 含HTML标签的字符串
 * @returns {string} 纯文本
 */
export const htmlToText = (html) => {
  if (!html) return '';
  // 1. 用DOMParser解析HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // 2. 获取纯文本（自动处理标签剥离）
  let text = doc.body.textContent || '';
  // 3. 替换多个空格为一个（优化显示）
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * 截取指定长度的摘要（超出部分加省略号）
 * @param {string} text - 纯文本
 * @param {number} length - 最大长度
 * @returns {string} 处理后的摘要
 */
export const getSummary = (text, length = 100) => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};