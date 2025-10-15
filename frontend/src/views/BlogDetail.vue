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
                <button class="btn btn-edit" @click="$router.push(`/edit-blog/${blog._id}`)">
                    编辑博客
                </button>
                <button class="btn btn-danger" @click="showDeleteConfirm = true">
                    删除博客
                </button>
            </div>


            <!-- 分割线 -->
            <div class="divider">

                <!-- 完整内容 -->
                <div class="blog-content">
                    <div class="blog-content" v-html="blog.content"></div>
                </div>

                <!-- 返回按钮 -->
                <button class="back-btn" @click="handleBack">
                    <!-- 根据 from 参数显示不同文本 -->
                    {{ from === 'myblogs' ? '← 返回我的博客' : '← 返回博客列表' }}
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
const route = useRoute();  // 用于获取 URL 中的 id 参数 和from参数
const router = useRouter();

// 响应式数据
const blog = ref(null);    // 存储单篇博客数据
const loading = ref(true); // 加载状态（初始为 true，因为需要立即加载）
const error = ref('');     // 错误信息
const showDeleteConfirm = ref(false);  // 控制删除确认弹窗显示/隐藏
const deleting = ref(false);           // 删除操作的加载状态
const from = ref(route.query.from || 'list');  // 获取 from 参数，决定返回按钮跳转到哪里（列表页/我的博客页）默认值为 'list'

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

// 新增：处理返回按钮点击，根据 from 参数决定跳转路径
const handleBack = () => {
    // 根据 from 参数决定跳转路径
    if (from.value === 'myblogs') {
        router.push('/my-blogs');
    } else {
        router.push('/');
    }
};
// 页面加载时调用（首次进入详情页时获取数据）
onMounted(() => {
    getBlogDetail();
});
</script>


<style scoped>
.blog-detail-container {
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 30px 20px;
}

/* 加载和错误状态 */
.loading,
.error {
    text-align: center;
    padding: 60px 20px;
    font-size: 18px;
}

.error {
    color: var(--danger-color);
}

/* 博客内容区域 */
.blog-title {
    color: var(--text-dark);
    font-size: 32px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 20px;
}

.blog-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    color: var(--text-light);
    font-size: 14px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.blog-content {
    color: var(--text-normal);
    line-height: 1.8;
    font-size: 16px;
    margin-bottom: 40px;
    white-space: pre-wrap;
}

/* 按钮组 */
.action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
}

.back-btn {
    margin-top: 20px;
}

/* 模态框 */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal {
    width: 90%;
    max-width: 400px;
    background-color: var(--bg-white);
    border-radius: var(--border-radius);
    padding: 25px;
    box-shadow: var(--shadow-md);
}

.modal-title {
    margin-bottom: 15px;
    color: var(--text-dark);
    font-size: 18px;
}

.modal-content {
    margin-bottom: 20px;
    color: var(--text-normal);
    line-height: 1.5;
}

.modal-btns {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>