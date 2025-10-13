<!-- src/views/EditBlog.vue -->
<template>
    <div class="create-blog-container">
        <!-- 页面标题改为“编辑博客” -->
        <h1>编辑博客</h1>

        <!-- 加载中状态（获取原博客数据时显示） -->
        <div class="loading" v-if="loadingData">
            加载中...
        </div>

        <!-- 加载失败状态 -->
        <div class="error" v-else-if="loadError">
            ❌ {{ loadError }}
            <button class="back-btn" @click="$router.push('/')">返回列表页</button>
        </div>

        <!-- 表单（复用创建页的结构，预填原数据） -->
        <form class="blog-form" @submit.prevent="handleSubmit" v-else>
            <!-- 标题输入框（v-model 绑定原数据） -->
            <div class="form-group">
                <label for="title">博客标题 <span class="required">*</span></label>
                <input type="text" id="title" v-model.trim="form.title" placeholder="请输入博客标题（不超过100字）" maxlength="100"
                    required>
                <p class="error-tip" v-if="errors.title">{{ errors.title }}</p>
            </div>

            <!-- 作者输入框
            <div class="form-group">
                <label for="author">作者</label>
                <input type="text" id="author" v-model.trim="form.author" placeholder="请输入作者名（默认：匿名作者）" maxlength="20">
            </div> -->

            <!-- 内容输入框 -->
            <div class="form-group">
                <label for="content">博客内容 <span class="required">*</span></label>
                <textarea id="content" v-model="form.content" placeholder="请输入博客内容（不能为空）" rows="8" required></textarea>
                <p class="error-tip" v-if="errors.content">{{ errors.content }}</p>
            </div>

            <!-- 提交按钮组 -->
            <div class="form-btn">
                <button type="submit" class="submit-btn" :disabled="submitting">
                    <span v-if="submitting">更新中...</span>
                    <span v-else>更新博客</span>
                </button>
                <button type="button" class="cancel-btn" @click="$router.push(`/blog/${blogId}`)">
                    取消（返回详情页）
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
// 1. 导入工具
import request from '../utils/request';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 2. 获取路由参数和路由实例
const route = useRoute();
const router = useRouter();
const blogId = route.params.id;  // 从 URL 中获取要编辑的博客 ID

// 3. 响应式数据
const form = ref({ title: '', author: '', content: '' });  // 表单数据（预填原博客数据）
const loadingData = ref(true);  // 加载原博客数据的状态
const loadError = ref('');      // 加载原数据的错误信息
const submitting = ref(false);  // 提交更新的状态
const errors = ref({ title: '', content: '' });  // 表单验证错误

// 4. 页面加载时，获取原博客数据并填充到表单
const getBlogData = async () => {
    try {
        loadingData.value = true;
        loadError.value = '';

        // 调用详情接口，获取原博客数据
        const response = await request.get(`/api/blogs/${blogId}`);
        const blog = response.data;

        // 填充表单（预填原数据）
        form.value = {
            title: blog.title,
            author: blog.author,
            content: blog.content
        };
    } catch (err) {
        loadError.value = err;  // 加载失败（如博客不存在）
    } finally {
        loadingData.value = false;
    }
};

// 5. 表单提交（更新博客）
const handleSubmit = async () => {
    // 前端表单验证（和创建页逻辑一致）
    let isValid = true;
    errors.value = { title: '', content: '' };

    if (!form.value.title.trim()) {
        errors.value.title = '标题不能为空';
        isValid = false;
    } else if (form.value.title.length > 100) {
        errors.value.title = '标题不能超过100个字符';
        isValid = false;
    }

    if (!form.value.content.trim()) {
        errors.value.content = '内容不能为空';
        isValid = false;
    }

    if (!isValid) return;

    // 提交更新请求
    try {
        submitting.value = true;

        // 调用 PUT /api/blogs/:id 接口，传递更新后的数据
        await request.put(`/api/blogs/${blogId}`, {
            title: form.value.title,
            author: form.value.author,
            content: form.value.content
        });

        // 更新成功，跳转回详情页并提示
        alert('博客更新成功！');
        router.push(`/blog/${blogId}`);  // 跳回当前博客的详情页
    } catch (err) {
        alert('更新失败：' + err);
    } finally {
        submitting.value = false;
    }
};

// 6. 页面加载时获取原博客数据
onMounted(() => {
    getBlogData();
});
</script>

<style scoped>
.create-blog-container {
    width: 100%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 30px 20px;
}

.create-blog-container h1 {
    color: var(--text-dark);
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 30px;
}

.blog-form {
    background: var(--bg-white);
    border-radius: var(--border-radius);
    padding: 30px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-dark);
    font-weight: 500;
}

.required {
    color: var(--danger-color);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: var(--transition);
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error-tip {
    margin-top: 8px;
    color: var(--danger-color);
    font-size: 14px;
}

.form-btn {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.submit-btn {
    flex: 1;
    padding: 12px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.submit-btn:hover:not(:disabled) {
    background-color: var(--primary-hover);
}

.submit-btn:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
}

.cancel-btn {
    padding: 12px 20px;
    background-color: var(--bg-white);
    color: var(--text-normal);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 16px;
    cursor: pointer;
    transition: var(--transition);
}

.cancel-btn:hover {
    background-color: var(--bg-light);
}
</style>