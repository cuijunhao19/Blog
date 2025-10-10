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

        <!-- 新增：分页组件（只有有数据时显示） -->
        <div class="pagination" v-if="blogs.length > 0 && pagination.totalPages > 1">
            <!-- 上一页按钮（第一页时禁用） -->
            <button class="page-btn prev-btn" @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage === 1">
                上一页
            </button>

            <!-- 页码按钮（循环渲染总页数） -->
            <button class="page-btn number-btn" v-for="page in pagination.totalPages" :key="page"
                @click="changePage(page)" :class="{ active: pagination.currentPage === page }">
                {{ page }}
            </button>

            <!-- 下一页按钮（最后一页时禁用） -->
            <button class="page-btn next-btn" @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === pagination.totalPages">
                下一页
            </button>

            <!-- 分页信息（显示“共x条，x页”） -->
            <div class="page-info">
                共 {{ pagination.totalItems }} 条 · 共 {{ pagination.totalPages }} 页
            </div>
        </div>
    </div>
</template>

<script setup>
// 导入需要的工具：封装的 Axios、Vue 组合式 API
import request from '../utils/request';
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue';

// 分页相关响应式数据（新增）
const pagination = ref({
    currentPage: 1,  // 当前页码，默认1
    pageSize: 10,    // 每页数量，默认10
    totalItems: 0,   // 总条数（后端返回）
    totalPages: 0    // 总页数（后端返回）
});

//  定义响应式数据（页面状态和数据）
const router = useRouter();
const blogs = ref([]);    // 存储博客列表数据（初始为空数组）
const loading = ref(false);  // 加载状态（初始为 false，加载时设为 true）
const error = ref('');    // 错误信息（初始为空，出错时赋值）
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
const getBlogList = async (page = 1, limit = 2) => {
    try {
        loading.value = true;
        error.value = '';

        // 调用接口时传递分页参数（page 和 limit）
        const response = await request.get('/api/blogs', {
            params: { page, limit } // 会拼接到 URL 后：/api/blogs?page=1&limit=10
        });

        // 赋值博客数据和分页信息（后端返回的 pagination 字段）
        blogs.value = response.data;
        pagination.value = response.pagination; // 接收后端的分页信息
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};

// 新增：切换页码的函数
const changePage = (targetPage) => {
    // 边界控制：目标页码不能小于1，也不能大于总页数
    if (targetPage < 1 || targetPage > pagination.value.totalPages) return;

    // 调用获取列表函数，传入目标页码
    getBlogList(targetPage, pagination.value.pageSize);

    // 可选：页面滚动到顶部（优化体验）
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 5. 页面加载时，获取第1页数据
onMounted(() => {
    getBlogList(pagination.value.currentPage, pagination.value.pageSize);
});


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
    padding: 12px 0;
    /* 稍微减少高度 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 增加轻微阴影 */
}

.navbar-container {
    width: 100%;
    max-width: 800px;
    /* 使用max-width替代固定width，增强响应式 */
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 确保垂直居中 */
    padding: 0 20px;
    box-sizing: border-box;
    /* 包含padding在宽度内 */
}

.logo {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
    /* 增加字母间距 */
}

.user-info {
    display: flex;
    align-items: center;
}

/* 登录状态下的用户操作区 */
.user-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    /* 固定间距 */
}

/* 未登录状态下的认证操作区 */
.auth-actions {
    display: flex;
    align-items: center;
    gap: 20px;
    /* 登录/注册链接间距更大一些 */
}

.username {
    color: #e2e8f0;
    font-size: 14px;
    white-space: nowrap;
    /* 防止用户名换行 */
}

.logout-btn {
    padding: 6px 12px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    /* 过渡动画更流畅 */
}

.logout-btn:hover {
    background-color: #c53030;
    transform: translateY(-1px);
    /* 轻微上浮效果 */
}

.auth-link {
    color: #e2e8f0;
    text-decoration: none;
    font-size: 14px;
    padding: 5px 0;
    /* 增加点击区域 */
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
    margin: 30px 0;
    /* 使用margin替代margin-bottom */
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    /* 增加分隔线 */
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

/* 新增：分页组件样式 */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 40px 0 60px;
    font-size: 14px;
}

/* 页码按钮通用样式 */
.page-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 按钮 hover 样式 */
.page-btn:hover:not(:disabled) {
    border-color: #4299e1;
    color: #4299e1;
}

/* 禁用状态样式 */
.page-btn:disabled {
    background-color: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
    border-color: #e2e8f0;
}

/* 当前页高亮样式 */
.number-btn.active {
    background-color: #4299e1;
    color: white;
    border-color: #4299e1;
}

/* 分页信息样式 */
.page-info {
    margin-left: 15px;
    color: #718096;
}
</style>