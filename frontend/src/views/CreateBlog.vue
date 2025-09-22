<!-- src/views/CreateBlog.vue -->
<template>
    <div class="create-blog-container">
        <h1>创建新博客</h1>
        <!-- 表单：提交到后端 POST /api/blogs 接口 -->
        <form class="blog-form" @submit.prevent="handleSubmit">
            <!-- 1. 标题输入框 -->
            <div class="form-group">
                <label for="title">博客标题 <span class="required">*</span></label>
                <input type="text" id="title" v-model.trim="form.title" placeholder="请输入博客标题（不超过100字）" maxlength="100"
                    required>
                <p class="error-tip" v-if="errors.title">{{ errors.title }}</p>
            </div>

            <!-- 2. 作者输入框 -->
            <div class="form-group">
                <label for="author">作者</label>
                <input type="text" id="author" v-model.trim="form.author" placeholder="请输入作者名（默认：匿名作者）" maxlength="20">
            </div>

            <!-- 3. 内容输入框（多行文本） -->
            <div class="form-group">
                <label for="content">博客内容 <span class="required">*</span></label>
                <textarea id="content" v-model="form.content" placeholder="请输入博客内容（不能为空）" rows="8" required></textarea>
                <p class="error-tip" v-if="errors.content">{{ errors.content }}</p>
            </div>

            <!-- 4. 提交按钮（加载状态切换） -->
            <div class="form-btn">
                <button type="submit" class="submit-btn" :disabled="loading">
                    <span v-if="loading">提交中...</span>
                    <span v-else>发布博客</span>
                </button>
                <!-- 取消按钮：跳转回列表页 -->
                <button type="button" class="cancel-btn" @click="$router.push('/')">
                    取消
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
// 1. 导入工具：封装的 Axios、Vue 响应式 API
import request from '../utils/request';
import { ref } from 'vue';
import { useRouter } from 'vue-router';  // 用于跳转页面

// 2. 初始化路由实例（跳转用）
const router = useRouter();

// 3. 定义响应式数据：表单数据、加载状态、错误提示
const form = ref({
    title: '',    // 博客标题
    author: '',   // 作者
    content: ''   // 博客内容
});
const loading = ref(false);  // 提交按钮加载状态
const errors = ref({         // 表单验证错误提示
    title: '',
    content: ''
});

// 4. 表单提交处理函数
const handleSubmit = async () => {
    // 第一步：前端表单验证（先于后端验证，提升用户体验）
    let isValid = true;
    errors.value = { title: '', content: '' };  // 清空之前的错误

    // 验证标题
    if (!form.value.title.trim()) {
        errors.value.title = '标题不能为空';
        isValid = false;
    } else if (form.value.title.length > 100) {
        errors.value.title = '标题不能超过100个字符';
        isValid = false;
    }

    // 验证内容
    if (!form.value.content.trim()) {
        errors.value.content = '内容不能为空';
        isValid = false;
    }

    // 若验证失败，不发请求
    if (!isValid) return;

    // 第二步：提交数据到后端
    try {
        loading.value = true;  // 按钮置为加载状态，防止重复提交

        // 调用后端 POST /api/blogs 接口，传递表单数据
        await request.post('/api/blogs', {
            title: form.value.title,
            author: form.value.author,  // 为空时后端会用默认值
            content: form.value.content
        });

        // 第三步：提交成功，跳转回博客列表页，并提示
        alert('博客发布成功！');
        router.push('/');  // 跳回列表页
    } catch (err) {
        // 第四步：提交失败，显示错误提示
        alert('发布失败：' + err);  // err 是后端返回的错误信息
    } finally {
        // 第五步：无论成功/失败，恢复按钮状态
        loading.value = false;
    }
};
</script>

<style scoped>
/* 容器样式 */
.create-blog-container {
    width: 800px;
    margin: 50px auto;
    padding: 0 20px;
}

/* 表单样式 */
.blog-form {
    margin-top: 30px;
}

/* 表单组样式 */
.form-group {
    margin-bottom: 25px;
}

/* 标签样式 */
.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #2d3748;
    font-size: 16px;
}

/* 必填项红色标记 */
.required {
    color: #e53935;
}

/* 输入框/文本域样式 */
.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

/* 输入框聚焦样式 */
.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #4299e1;
    /* 蓝色边框 */
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* 错误提示样式 */
.error-tip {
    margin: 8px 0 0;
    color: #e53935;
    font-size: 14px;
}

/* 按钮组样式 */
.form-btn {
    display: flex;
    gap: 15px;
    /* 按钮之间的间距 */
    margin-top: 40px;
}

/* 提交按钮样式 */
.submit-btn {
    padding: 12px 30px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

/* 提交按钮加载状态 */
.submit-btn:disabled {
    background-color: #90caf9;
    cursor: not-allowed;
}

/* 取消按钮样式 */
.cancel-btn {
    padding: 12px 30px;
    background-color: #f7fafc;
    color: #2d3748;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

/* 取消按钮 hover 样式 */
.cancel-btn:hover {
    background-color: #edf2f7;
}
</style>