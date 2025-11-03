<template>
    <div class="create-blog-container">
        <h1>编辑博客</h1>

        <div class="loading" v-if="loadingData">
            加载中...
        </div>

        <div class="error" v-else-if="loadError">
            ❌ {{ loadError }}
            <button class="back-btn" @click="$router.push('/')">返回列表页</button>
        </div>

        <form class="blog-form" @submit.prevent="handleSubmit" v-else>
            <div class="form-group">
                <label for="title">博客标题 <span class="required">*</span></label>
                <input type="text" id="title" v-model.trim="form.title" placeholder="请输入博客标题（不超过100字）" maxlength="100"
                    required>
                <p class="error-tip" v-if="errors.title">{{ errors.title }}</p>
            </div>

            <!-- 富文本编辑器 -->
            <div class="form-group">
                <label>博客内容 <span style="color: var(--danger);">*</span></label>
                <!-- 添加 ref 和 key，确保内容更新时重新渲染 -->
                <RichTextEditor ref="richTextEditorRef" v-model="form.content" :disabled="loading"
                    editorId="edit-blog-editor" :key="editorKey" />
            </div>

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
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RichTextEditor from '../components/RichTextEditor.vue';

// 2. 获取路由参数和路由实例
const route = useRoute();
const router = useRouter();
const blogId = route.params.id;

// 3. 响应式数据
const form = ref({ title: '', content: '' });
const loadingData = ref(true);
const loadError = ref('');
const submitting = ref(false);
const errors = ref({ title: '', content: '' });
const richTextEditorRef = ref(null);  // 新增：富文本编辑器引用
const editorKey = ref(0);  // 新增：用于强制重新渲染编辑器的 key

// 4. 页面加载时，获取原博客数据并填充到表单
const getBlogData = async () => {
    try {
        loadingData.value = true;
        loadError.value = '';

        // 调用详情接口，获取原博客数据
        const response = await request.get(`/api/blogs/${blogId}`);
        const blog = response.data;

        console.log('获取到的博客数据:', blog);  // 调试日志

        // 填充表单（预填原数据）
        form.value = {
            title: blog.title,
            content: blog.content || ''  // 确保 content 不为 undefined
        };

        // 关键修复：等待下一个 tick 确保 DOM 更新完成
        await nextTick();

        // 强制重新渲染编辑器
        editorKey.value++;

        // 再次等待确保编辑器重新渲染完成
        await nextTick();

        // 如果有编辑器引用，手动设置内容
        if (richTextEditorRef.value) {
            await nextTick();
            richTextEditorRef.value.setEditorContent(form.value.content);
        }

    } catch (err) {
        loadError.value = err;
        console.error('加载博客数据失败:', err);
    } finally {
        loadingData.value = false;
    }
};

// 5. 表单提交（更新博客）
const handleSubmit = async () => {
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

    try {
        submitting.value = true;

        // 调用 PUT /api/blogs/:id 接口
        await request.put(`/api/blogs/${blogId}`, {
            title: form.value.title,
            content: form.value.content
        });

        alert('博客更新成功！');
        router.push(`/blog/${blogId}`);
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

<!-- 样式保持不变 -->
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