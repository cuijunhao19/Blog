<!-- src/views/BlogList.vue -->
<template>
    <div class="blog-list-container">
        <!-- 新增：创建博客按钮 -->
        <div class="top-bar">
            <h1>我的博客列表</h1>
            <button class="create-btn" @click="$router.push('/create-blog')">
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
            <!-- 博客标题 -->
            <h2 class="blog-title">{{ blog.title }}</h2>
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
// 1. 导入需要的工具：封装的 Axios、Vue 组合式 API
import request from '../utils/request';
import { ref, onMounted } from 'vue';

// 2. 定义响应式数据（页面状态和数据）
const blogs = ref([]);    // 存储博客列表数据（初始为空数组）
const loading = ref(false);  // 加载状态（初始为 false，加载时设为 true）
const error = ref('');    // 错误信息（初始为空，出错时赋值）

// 3. 定义日期格式化函数（把后端返回的 ISO 时间转成 YYYY-MM-DD 格式）
const formatDate = (isoDate) => {
    // 后端返回的 publishTime 是 ISO 格式（如 "2024-10-01T08:00:00.000Z"）
    const date = new Date(isoDate);
    // 补零函数（比如 1 → 01）
    const padZero = (num) => num.toString().padStart(2, '0');
    // 拼接成 YYYY-MM-DD 格式
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
};

// 4. 定义获取博客列表的函数（核心：调用后端接口）
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

// 5. 页面加载时自动调用获取博客列表的函数（onMounted 是 Vue 生命周期钩子）
onMounted(() => {
    getBlogList();
});
</script>

<style scoped>
/* 容器样式 */
.blog-list-container {
    width: 800px;
    margin: 50px auto;
    padding: 0 20px;
}

/* 加载中样式 */
.loading {
    text-align: center;
    padding: 50px;
    color: #666;
    font-size: 18px;
}

/* 错误提示样式 */
.error {
    text-align: center;
    padding: 50px;
    color: #e53935;
    /* 红色 */
    font-size: 18px;
}

/* 无数据样式 */
.empty {
    text-align: center;
    padding: 50px;
    color: #666;
    font-size: 18px;
}

/* 博客卡片样式 */
.blog-card {
    margin: 20px 0;
    padding: 25px;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
    /* hover 阴影动画 */
}

/* 鼠标 hover 卡片时加深阴影 */
.blog-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 博客标题样式 */
.blog-title {
    margin-top: 0;
    color: #2d3748;
    /* 深灰色 */
    font-size: 22px;
}

/* 博客信息（作者+时间）样式 */
.blog-meta {
    color: #718096;
    /* 浅灰色 */
    font-size: 14px;
    margin: 10px 0;
}

/* 博客内容样式 */
.blog-content {
    color: #4a5568;
    /* 中灰色 */
    line-height: 1.6;
    font-size: 16px;
    margin-top: 15px;
}

/* 新增：顶部栏样式（标题 + 按钮） */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

/* 新增：创建博客按钮样式 */
.create-btn {
    padding: 10px 20px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.create-btn:hover {
    background-color: #3182ce;
}
</style>