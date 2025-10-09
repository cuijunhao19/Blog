<!-- src/views/BlogList.vue -->
<template>
    <div class="blog-list-container">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="navbar-container">
                <h1 class="logo">我的博客</h1>
                <div class="user-info">
                    <!-- 已登录：显示用户名和退出按钮 -->
                    <div v-if="isLoggedIn" class="user-actions">
                        <span class="username">欢迎，{{ username }}</span>
                        <button class="logout-btn" @click="handleLogout">退出登录</button>
                    </div>
                    <!-- 未登录：显示登录/注册链接 -->
                    <div v-else class="auth-actions">
                        <router-link to="/login" class="auth-link">登录</router-link>
                        <router-link to="/register" class="auth-link">注册</router-link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 创建博客按钮 -->
        <div class="top-bar">
            <h1>我的博客列表</h1>
            <button class="create-btn" @click="$router.push('/create-blog')" v-if="isLoggedIn">
                + 创建新博客
            </button>
        </div>


        <!-- 1. 加载中状态 -->
        <div class="loading" v-if="loading">
            加载中...
        </div>

        <!-- 2. 错误提示状态 -->
        <div class="error" v-else-if="error">
            ❌ {{ error }}
        </div>

        <!-- 3. 无数据状态 -->
        <div class="empty" v-else-if="blogs.length === 0">
            📭 暂无博客文章，快去创建第一篇博客吧！
        </div>

        <!-- 4. 渲染博客列表（真实数据） -->
        <div class="blog-card" v-for="blog in blogs" :key="blog._id">

            <!-- 博客列表渲染部分 -->

            <!-- 修改：将标题改为 router-link，跳转到详情页 -->
            <h2 class="blog-title">
                <router-link :to="`/blog/${blog._id}`" class="title-link">
                    {{ blog.title }}
                </router-link>
            </h2>


            <!-- 博客信息（作者 + 发布时间） -->
            <div class="blog-meta">
                作者：{{ blog.author }} |
                发布时间：{{ formatDate(blog.publishTime) }}
            </div>
            <!-- 博客内容（截取前100字，避免内容过长） -->
            <div class="blog-content">
                {{ blog.content.length > 100
                    ? blog.content.slice(0, 100) + '...'
                    : blog.content
                }}
            </div>
        </div>
    </div>
</template>

<script setup>
// 导入需要的工具：封装的 Axios、Vue 组合式 API
import request from '../utils/request';
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue';

// 计算属性：判断是否登录，获取用户名
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('blog_token');
});
const username = computed(() => {
    return localStorage.getItem('blog_username') || '';
});

// 退出登录函数
const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
        // 清除 localStorage 中的 Token 和用户名
        localStorage.removeItem('blog_token');
        localStorage.removeItem('blog_username');
        // 跳转到首页
        router.push('/');
    }
};



//  定义响应式数据（页面状态和数据）
const router = useRouter();
const blogs = ref([]);    // 存储博客列表数据（初始为空数组）
const loading = ref(false);  // 加载状态（初始为 false，加载时设为 true）
const error = ref('');    // 错误信息（初始为空，出错时赋值）

// 定义日期格式化函数（把后端返回的 ISO 时间转成 YYYY-MM-DD 格式）
const formatDate = (isoDate) => {
    // 后端返回的 publishTime 是 ISO 格式（如 "2024-10-01T08:00:00.000Z"）
    const date = new Date(isoDate);
    // 补零函数（比如 1 → 01）
    const padZero = (num) => num.toString().padStart(2, '0');
    // 拼接成 YYYY-MM-DD 格式
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
};

// 定义获取博客列表的函数（核心：调用后端接口）
const getBlogList = async () => {
    try {
        loading.value = true;  // 开始加载：设为 true
        error.value = '';      // 清空之前的错误信息

        // 调用后端接口：GET /api/blogs（baseURL 已在 request 中配置，只需写路径）
        const response = await request.get('/api/blogs');

        // 接口成功：把响应数据赋值给 blogs（后端返回的格式是 { success: true, data: [...] }）
        blogs.value = response.data;  // response.data 就是后端返回的 blogs 数组
    } catch (err) {
        // 接口失败：捕获错误信息，赋值给 error
        error.value = err;  // err 是 request 响应拦截器抛出来的错误提示
    } finally {
        // 无论成功/失败，都结束加载
        loading.value = false;
    }
};

// 页面加载时自动调用获取博客列表的函数（onMounted 是 Vue 生命周期钩子）
onMounted(() => {
    getBlogList();
});
</script>
<style scoped>
/* 导航栏样式优化 */
.navbar {
    background-color: #2d3748;
    color: white;
    padding: 12px 0; /* 稍微减少高度 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 增加轻微阴影 */
}

.navbar-container {
    width: 100%;
    max-width: 800px; /* 使用max-width替代固定width，增强响应式 */
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center; /* 确保垂直居中 */
    padding: 0 20px;
    box-sizing: border-box; /* 包含padding在宽度内 */
}

.logo {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px; /* 增加字母间距 */
}

.user-info {
    display: flex;
    align-items: center;
}

/* 登录状态下的用户操作区 */
.user-actions {
    display: flex;
    align-items: center;
    gap: 15px; /* 固定间距 */
}

/* 未登录状态下的认证操作区 */
.auth-actions {
    display: flex;
    align-items: center;
    gap: 20px; /* 登录/注册链接间距更大一些 */
}

.username {
    color: #e2e8f0;
    font-size: 14px;
    white-space: nowrap; /* 防止用户名换行 */
}

.logout-btn {
    padding: 6px 12px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease; /* 过渡动画更流畅 */
}

.logout-btn:hover {
    background-color: #c53030;
    transform: translateY(-1px); /* 轻微上浮效果 */
}

.auth-link {
    color: #e2e8f0;
    text-decoration: none;
    font-size: 14px;
    padding: 5px 0; /* 增加点击区域 */
    transition: all 0.2s ease;
}

.auth-link:hover {
    color: white;
    text-decoration: underline;
}

/* 容器样式保持不变 */
.blog-list-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
}

/* 顶部栏样式优化 */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30px 0; /* 使用margin替代margin-bottom */
    padding-bottom: 15px;
    border-bottom: 1px solid #eee; /* 增加分隔线 */
}

/* 创建博客按钮样式优化 */
.create-btn {
    padding: 10px 20px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.create-btn:hover {
    background-color: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

/* 以下样式保持不变 */
.loading {
    text-align: center;
    padding: 50px;
    color: #666;
    font-size: 18px;
}

.error {
    text-align: center;
    padding: 50px;
    color: #e53935;
    font-size: 18px;
}

.empty {
    text-align: center;
    padding: 50px;
    color: #666;
    font-size: 18px;
}

.blog-card {
    margin: 20px 0;
    padding: 25px;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
}

.blog-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.blog-title {
    margin-top: 0;
    color: #2d3748;
    font-size: 22px;
}

.blog-meta {
    color: #718096;
    font-size: 14px;
    margin: 10px 0;
}

.blog-content {
    color: #4a5568;
    line-height: 1.6;
    font-size: 16px;
    margin-top: 15px;
}

.title-link {
    color: #2d3748;
    text-decoration: none;
    transition: color 0.3s ease;
}

.title-link:hover {
    color: #4299e1;
    text-decoration: underline;
}
</style>