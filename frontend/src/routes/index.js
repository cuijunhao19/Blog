// src/router/index.js
// 导入 vue-router 的核心函数和组件
import { createRouter, createWebHistory } from "vue-router";
// 导入页面组件（后续创建博客列表页，先占位）
// 注意：这里用“懒加载”（() => import(...)），优化性能（只在访问时加载组件）
const BlogList = () => import("../views/BlogList.vue");
const CreateBlog = () => import("../views/CreateBlog.vue");
const BlogDetail = () => import("../views/BlogDetail.vue");
const EditBlog = () => import("../views/EditBlog.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");

// 检查是否登录的工具函数（从 localStorage 获取 Token）
const isLoggedIn = () => {
  return !!localStorage.getItem('blog_token');
};

// 定义路由规则：“路径 → 组件”的映射
const routes = [
  {
    path: "/", // 根路径（http://localhost:5173/）
    name: "BlogList", // 路由名（可选，用于编程式导航）
    component: BlogList, // 对应页面组件（博客列表页）
  },
  {
    path: "/create-blog",
    name: "CreateBlog",
    component: CreateBlog,
    meta: { title: "创建博客" , requiresAuth:true}, 
  },
  // 新增：详情页路由（:id 是动态参数，接收博客 ID）
  {
    path: "/blog/:id",
    name: "BlogDetail",
    component: BlogDetail,
    meta: { title: "博客详情" },
  },
  // 新增：编辑页路由（:id 是要编辑的博客 ID）
  {
    path: "/edit-blog/:id",
    name: "EditBlog",
    component: EditBlog,
    meta: { title: "编辑博客" , requiresAuth: true},
  },
  {
    path:"/login",
    name:"Login",
    component: Login,
    meta:{title:"登录"}
  },
  {
    path:"/register",
    name:"Register",
    component:Register,
    meta:{title:"注册"}
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 用 HTML5 历史模式（URL 中没有 #）
  routes, // 传入路由规则
});

// 路由导航守卫，动态设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title + " | 我的博客";
  }else{
    document.title = "我的博客";
  } 
  // 验证需要登录的路由
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // 未登录，跳转到登录页，并记录目标路径（登录后可跳回）
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// 导出路由实例：供 main.js 导入
export default router;
