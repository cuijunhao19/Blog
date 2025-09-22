// src/router/index.js
// 导入 vue-router 的核心函数和组件
import { createRouter, createWebHistory } from "vue-router";
// 导入页面组件（后续创建博客列表页，先占位）
// 注意：这里用“懒加载”（() => import(...)），优化性能（只在访问时加载组件）
const BlogList = () => import("../views/BlogList.vue");
// 新增：导入创建博客页面组件（懒加载）
const CreateBlog = () => import("../views/CreateBlog.vue");

// 定义路由规则：“路径 → 组件”的映射
const routes = [
  {
    path: "/", // 根路径（http://localhost:5173/）
    name: "BlogList", // 路由名（可选，用于编程式导航）
    component: BlogList, // 对应页面组件（博客列表页）
  },
  { 
    path: '/create-blog', 
    name: 'CreateBlog', 
    component: CreateBlog,
    meta: { title: '创建博客' }  // 可选：设置页面标题
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 用 HTML5 历史模式（URL 中没有 #）
  routes, // 传入路由规则
});

// 路由导航守卫，动态设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' | 我的博客';
  } else {
    document.title = '我的博客';
  }
  next();
});

// 导出路由实例：供 main.js 导入
export default router;
