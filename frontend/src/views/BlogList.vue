<!-- src/views/BlogList.vue -->
<template>
    <div class="blog-list-container">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="navbar-container">
                <h1 class="logo">JH博客</h1>
                <div class="user-info">
                    <!-- 已登录：显示用户名和退出按钮 -->
                    <div v-if="isLoggedIn" class="user-actions">
                        <span class="username">欢迎，{{ username }}</span>
                        <!-- 新增：我的博客链接 -->
                        <router-link to="/my-blogs" class="my-blogs-link">我的博客</router-link>
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
            <h1>博客列表</h1>
            <button class="btn btn-primary" @click="$router.push('/create-blog')" v-if="isLoggedIn">
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
        <div class="blog-card gradient-card hover-lift animate-fadeInUp" v-for="blog in blogs" :key="blog._id">

            <!-- 博客列表渲染部分 -->

            <!-- 修改：将标题改为 router-link，跳转到详情页 -->
            <h2 class="blog-title">
                <router-link :to="`/blog/${blog._id}?from=list`" class="title-link">
                    {{ blog.title }}
                </router-link>
            </h2>


            <!-- 博客信息（作者 + 发布时间） -->
            <div class="blog-meta">
                作者：{{ blog.author }} |
                发布时间：{{ formatDate(blog.publishTime) }}
            </div>
            <!-- 替换：用处理后的纯文本摘要 -->
            <p class="blog-summary">{{ getSummary(htmlToText(blog.content)) }}</p>
            <!-- 博客内容（截取前100字，避免内容过长）
            <div class="blog-content">
                {{ blog.content.length > 100
                    ? blog.content.slice(0, 100) + '...'
                    : blog.content
                }}
            </div> -->
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
import { htmlToText, getSummary } from '../utils/format'; // 导入工具函数
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request'; // 确保该文件存在且正确

// 1. 定义必要的响应式数据（解决 "未定义" 错误的核心）
const blogs = ref([]); // 博客列表数据
const loading = ref(false); // 加载状态
const error = ref(''); // 错误信息
const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
});

// 2. 登录状态相关计算属性
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('blog_token');
});

const username = computed(() => {
    return localStorage.getItem('blog_username') || '';
});

// 3. 路由相关
const router = useRouter();

// 4. 获取博客列表的核心方法
const getBlogList = async (page = 1, limit = 3) => {
    try {
        loading.value = true;
        error.value = '';

        // 调用后端接口获取博客列表（确保接口地址正确）
        const response = await request.get('/api/blogs', {
            params: { page, limit }
        });

        blogs.value = response.data;
        pagination.value = response.pagination || {
            currentPage: 1,
            pageSize: 10,
            totalItems: blogs.value.length,
            totalPages: 1
        };
    } catch (err) {
        error.value = err.message || '获取博客列表失败';
        blogs.value = [];
    } finally {
        loading.value = false;
    }
};

// 5. 切换页码方法
const changePage = (targetPage) => {
    if (targetPage < 1 || targetPage > pagination.value.totalPages) return;
    getBlogList(targetPage, pagination.value.pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 6. 退出登录方法
const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('blog_token');
        localStorage.removeItem('blog_username');
        router.push('/');
        getBlogList(); // 重新加载列表
    }
};

// 7. 日期格式化方法（如果模板中用到）
const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString();
};

// 8. 页面加载时获取数据
onMounted(() => {
    getBlogList();
});
</script>


<style scoped>
/* 导航栏固定顶部 */
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

/* 主容器 */
.blog-list-container {
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 30px 20px;
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

.create-btn {
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.create-btn:hover {
    background-color: var(--primary-hover);
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

/* 博客卡片 */
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

/* 分页 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 40px;
}

.page-btn {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-white);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.page-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.number-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.page-info {
    margin-left: 20px;
    color: var(--text-light);
    font-size: 14px;
}

.blog-summary {
    color: var(--text-light);
    margin: 10px 0;
    line-height: 1.6;
}
</style>