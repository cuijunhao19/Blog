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
            <!-- <div class="form-group">
                <label for="author">作者</label>
                <input type="text" id="author" v-model.trim="form.author" placeholder="请输入作者名（默认：匿名作者）" maxlength="20">
            </div> -->

            <!-- 替换：富文本编辑器（替换原 textarea） -->
            <div class="form-group">
                <label>博客内容 <span style="color: var(--danger);">*</span></label>
                <!-- 使用重构后的富文本组件，v-model双向绑定 -->
                <RichTextEditor v-model="form.content" :disabled="loading" editorId="create-blog-editor" />
            </div>

            <!-- 4. 提交按钮（加载状态切换） -->
            <div class="form-btn">
                <!-- 更新提交按钮 -->
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading">提交中...</span>
                    <span v-else>发布博客</span>
                </button>
                <!-- 取消按钮：跳转回列表页 -->
                <button type="button" class="btn btn-outline" @click="$router.push('/')">
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
// 导入富文本组件
import RichTextEditor from '../components/RichTextEditor.vue';

// 2. 初始化路由实例（跳转用）
const router = useRouter();

// 3. 定义响应式数据：表单数据、加载状态、错误提示
const form = ref({
    title: '',    // 博客标题
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