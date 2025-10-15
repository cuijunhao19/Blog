<template>
    <div class="my-blogs-container">
        <!-- 导航栏（复用BlogList的导航栏逻辑） -->
        <nav class="navbar">
            <div class="navbar-container">
                <h1 class="logo">JH博客</h1>
                <div class="user-info">
                    <div v-if="isLoggedIn" class="user-actions">
                        <span class="username">欢迎，{{ username }}</span>
                        <button class="logout-btn" @click="handleLogout">退出登录</button>
                    </div>
                    <div v-else class="auth-actions">
                        <router-link to="/login" class="auth-link">登录</router-link>
                        <router-link to="/register" class="auth-link">注册</router-link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 页面标题和返回按钮 -->
        <div class="top-bar">
            <h1>我的博客</h1>
            <button class="btn btn-outline" @click="$router.push('/')">
                返回博客列表
            </button>
        </div>

        <!-- 加载状态 -->
        <div class="loading" v-if="loading">加载中...</div>

        <!-- 错误状态 -->
        <div class="error" v-else-if="error">
            ❌ {{ error }}
        </div>

        <!-- 无数据状态 -->
        <div class="empty" v-else-if="blogs.length === 0">
            📝 你还没有发布任何博客，快去创建第一篇吧！
        </div>

        <!-- 我的博客列表（和BlogList渲染逻辑一致） -->
        <div class="blog-card gradient-card hover-lift animate-fadeInUp" v-for="blog in blogs" :key="blog._id">
            <h2 class="blog-title">
                <router-link :to="`/blog/${blog._id}?from=myblogs`" class="title-link">
                    {{ blog.title }}
                </router-link>
            </h2>
            <div class="blog-meta">
                作者：{{ blog.author }} |
                发布时间：{{ formatDate(blog.publishTime) }}
            </div>
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
import request from '../utils/request';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';

// 登录状态相关
const isLoggedIn = computed(() => !!localStorage.getItem('blog_token'));
const username = computed(() => localStorage.getItem('blog_username') || '');
const router = useRouter();

// 博客数据相关
const blogs = ref([]);
const loading = ref(false);
const error = ref('');

// 日期格式化（复用之前的函数）
const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const padZero = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
};

// 获取我的博客列表
const getMyBlogs = async () => {
    try {
        loading.value = true;
        error.value = '';

        // 调用新增的“我的博客”接口
        const response = await request.get('/api/blogs/my-blogs');
        blogs.value = response.data;
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};

// 删除博客（复用之前的逻辑）
const handleDelete = async (blogId) => {
    if (confirm('确定要删除这篇博客吗？')) {
        try {
            await request.delete(`/api/blogs/${blogId}`);
            alert('删除成功！');
            // 重新获取列表，刷新页面
            getMyBlogs();
        } catch (err) {
            alert('删除失败：' + err);
        }
    }
};

// 退出登录（复用之前的逻辑）
const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('blog_token');
        localStorage.removeItem('blog_username');
        router.push('/');
    }
};

// 页面加载时获取数据
onMounted(() => {
    // 如果未登录，跳转到登录页
    if (!isLoggedIn.value) {
        router.push('/login?redirect=/my-blogs');
        return;
    }
    getMyBlogs();
});
</script>

<style scoped>
.my-blogs-container {
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 30px 20px;
}

/* 导航栏 - 复用BlogList的样式 */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-white);
    border-bottom: 1px solid var(--border-color);
    padding: 15px 0;
    z-index: 1000;
    box-shadow: var(--shadow);
}

.navbar-container {
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
}

.user-actions,
.auth-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.username {
    color: var(--text-light);
    font-size: 14px;
}

/* 顶部栏 */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.top-bar h1 {
    color: var(--text-dark);
    font-size: 28px;
    font-weight: 700;
}

/* 状态提示 */
.loading,
.error,
.empty {
    text-align: center;
    padding: 60px 20px;
    font-size: 18px;
    color: var(--text-light);
}

.error {
    color: var(--danger-color);
}

/* 博客卡片 - 复用BlogList的卡片样式 */
.blog-card {
    background: var(--bg-white);
    border-radius: var(--border-radius);
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    transition: var(--transition);
    border: 1px solid var(--border-color);
}

.blog-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.blog-title {
    margin-bottom: 12px;
}

.title-link {
    color: var(--text-dark);
    text-decoration: none;
    font-size: 20px;
    font-weight: 600;
    transition: var(--transition);
}

.title-link:hover {
    color: var(--primary-color);
}

.blog-meta {
    color: var(--text-light);
    font-size: 14px;
    margin-bottom: 16px;
}

.blog-content {
    color: var(--text-normal);
    line-height: 1.6;
}
</style>