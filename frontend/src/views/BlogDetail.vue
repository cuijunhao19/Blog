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
                <!-- 新增：编辑按钮 -->
                <button class="edit-btn" @click="$router.push(`/edit-blog/${blog._id}`)">
                    编辑博客
                </button>
                <!-- 新增：删除按钮 -->
                <button class="delete-btn" @click="showDeleteConfirm = true">
                    删除博客
                </button>
            </div>


            <!-- 分割线 -->
            <div class="divider">

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

        <!-- 新增：删除确认弹窗（遮罩层 + 弹窗） -->
        <div class="modal-backdrop" v-if="showDeleteConfirm">
            <div class="modal">
                <h3 class="modal-title">确认删除？</h3>
                <p class="modal-content">
                    此操作将永久删除该博客，删除后无法恢复，是否继续？
                </p>
                <div class="modal-btns">
                    <button class="modal-cancel" @click="showDeleteConfirm = false">
                        取消
                    </button>
                    <button class="modal-confirm" @click="handleDelete" :disabled="deleting">
                        <span v-if="deleting">删除中...</span>
                        <span v-else>确认删除</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 导入工具
import request from '../utils/request';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';  // route 用于获取参数，router 用于跳转

// 获取路由参数和路由实例
const route = useRoute();  // 用于获取 URL 中的 id 参数
const router = useRouter();

// 响应式数据
const blog = ref(null);    // 存储单篇博客数据
const loading = ref(true); // 加载状态（初始为 true，因为需要立即加载）
const error = ref('');     // 错误信息
const showDeleteConfirm = ref(false);  // 控制删除确认弹窗显示/隐藏
const deleting = ref(false);           // 删除操作的加载状态

// 日期格式化函数（复用列表页的逻辑，后续可抽成工具函数）
const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const padZero = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

// 获取博客详情的函数
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

// 新增：处理删除博客的函数
const handleDelete = async () => {
    try {
        deleting.value = true;  // 开始删除，禁用按钮

        // 调用 DELETE /api/blogs/:id 接口
        await request.delete(`/api/blogs/${blog.value._id}`);

        // 删除成功：关闭弹窗，跳转回列表页，提示用户
        showDeleteConfirm.value = false;
        alert('博客已成功删除！');
        router.push('/');  // 跳回列表页
    } catch (err) {
        // 删除失败：提示错误（弹窗不关闭，方便用户重试）
        alert('删除失败：' + err);
    } finally {
        deleting.value = false;  // 结束删除，恢复按钮状态
    }
};


// 页面加载时调用（首次进入详情页时获取数据）
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


/* 新增：编辑按钮样式 */
.edit-btn {
    margin-left: auto;
    /* 靠右显示 */
    padding: 5px 12px;
    background-color: #48bb78;
    /* 绿色 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.edit-btn:hover {
    background-color: #38a169;
}

/* 调整 .blog-meta 为 flex 布局，让按钮靠右 */
.blog-meta {
    display: flex;
    align-items: center;
    /* 垂直居中 */
    gap: 20px;
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

/* 新增：删除按钮样式 */
.delete-btn {
    margin-left: 10px;
    padding: 5px 12px;
    background-color: #e53e3e;
    /* 红色 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.delete-btn:hover {
    background-color: #c53030;
}

/* 新增：弹窗遮罩层样式（半透明黑色背景） */
.modal-backdrop {
    position: fixed;
    /* 固定在视口 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    /* 半透明黑色 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    z-index: 1000;
    /* 确保在页面内容上方 */
}

/* 新增：弹窗样式 */
.modal {
    width: 400px;
    background-color: white;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 弹窗标题 */
.modal-title {
    margin: 0 0 15px;
    color: #2d3748;
    font-size: 18px;
}

/* 弹窗内容 */
.modal-content {
    margin: 0 0 20px;
    color: #4a5568;
    line-height: 1.5;
}

/* 弹窗按钮组 */
.modal-btns {
    display: flex;
    justify-content: flex-end;
    /* 按钮靠右 */
    gap: 10px;
}

/* 取消按钮 */
.modal-cancel {
    padding: 8px 16px;
    background-color: #f7fafc;
    color: #2d3748;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

/* 确认删除按钮 */
.modal-confirm {
    padding: 8px 16px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-confirm:disabled {
    background-color: #ed64a6;
    cursor: not-allowed;
}
</style>