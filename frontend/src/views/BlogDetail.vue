<!-- src/views/BlogDetail.vue -->
<template>
    <div class="blog-detail-container">
        <!-- 1. 加载中状态 -->
        <div class="loading" v-if="loading">
            加载中...
        </div>

        <!-- 2. 错误状态（404/500等） -->
        <div class="error" v-else-if="error">
            ❌ {{ error }}
            <button class="back-btn" @click="$router.push('/')">返回列表页</button>
        </div>

        <!-- 3. 博客详情内容（加载成功） -->
        <div v-else>
            <!-- 标题 -->
            <h1 class="blog-title">{{ blog.title }}</h1>

            <!-- 作者和时间 -->
            <div class="blog-meta">
                <span>作者：{{ blog.author }}</span>
                <span>发布时间：{{ formatDate(blog.publishTime) }}</span>
            </div>

            <!-- 分割线 -->
            <hr class="divider">

            <!-- 完整内容 -->
            <div class="blog-content">
                <!-- 用 pre 标签保留换行和空格（如果内容有换行） -->
                <pre>{{ blog.content }}</pre>
            </div>

            <!-- 返回按钮 -->
            <button class="back-btn" @click="$router.push('/')">
                ← 返回博客列表
            </button>
        </div>
    </div>
</template>

<script setup>
// 1. 导入工具
import request from '../utils/request';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';  // route 用于获取参数，router 用于跳转

// 2. 获取路由参数和路由实例
const route = useRoute();  // 用于获取 URL 中的 id 参数
const router = useRouter();

// 3. 响应式数据
const blog = ref(null);    // 存储单篇博客数据
const loading = ref(true); // 加载状态（初始为 true，因为需要立即加载）
const error = ref('');     // 错误信息

// 4. 日期格式化函数（复用列表页的逻辑，后续可抽成工具函数）
const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const padZero = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

// 5. 获取博客详情的函数
const getBlogDetail = async () => {
    try {
        loading.value = true;
        error.value = '';

        // 从路由参数中获取博客 ID（route.params.id）
        const blogId = route.params.id;

        // 调用后端接口：GET /api/blogs/:id
        const response = await request.get(`/api/blogs/${blogId}`);

        // 接口成功，赋值博客数据
        blog.value = response.data;
    } catch (err) {
        // 接口失败，存储错误信息
        error.value = err;
    } finally {
        // 结束加载
        loading.value = false;
    }
};

// 6. 页面加载时调用（首次进入详情页时获取数据）
onMounted(() => {
    getBlogDetail();
});
</script>

<style scoped>
/* 容器样式 */
.blog-detail-container {
    width: 800px;
    margin: 50px auto;
    padding: 0 20px;
}

/* 加载中样式 */
.loading {
    text-align: center;
    padding: 100px 0;
    color: #666;
    font-size: 18px;
}

/* 错误提示样式 */
.error {
    text-align: center;
    padding: 100px 0;
    color: #e53935;
    font-size: 18px;
}

/* 标题样式 */
.blog-title {
    color: #2d3748;
    font-size: 28px;
    margin-bottom: 15px;
    line-height: 1.3;
}

/* 作者和时间样式 */
.blog-meta {
    display: flex;
    gap: 20px;
    /* 两个信息之间的间距 */
    color: #718096;
    font-size: 14px;
    margin-bottom: 20px;
}

/* 分割线样式 */
.divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0 30px;
}

/* 内容样式 */
.blog-content {
    color: #4a5568;
    line-height: 1.8;
    font-size: 16px;
    white-space: pre-wrap;
    /* 保留换行符和空格 */
    margin-bottom: 40px;
}

/* 返回按钮样式 */
.back-btn {
    padding: 10px 20px;
    background-color: #f7fafc;
    color: #2d3748;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background-color: #edf2f7;
}
</style>