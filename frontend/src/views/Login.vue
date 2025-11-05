<!-- src/views/Login.vue -->
<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>用户登录</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" v-model.trim="form.username" placeholder="请输入用户名" required>
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" v-model="form.password" placeholder="请输入密码" required>
                    <p class="error-tip" v-if="loginError">{{ loginError }}</p>
                </div>
                <!-- 更新认证按钮 -->
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading">登录中...</span>
                    <span v-else>登录</span>
                </button>
                <p class="auth-link">
                    没有账号？<router-link to="/register">去注册</router-link>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request';

const router = useRouter();
const form = ref({ username: '', password: '' });
const loading = ref(false);
const loginError = ref('');

const handleLogin = async () => {
    loginError.value = '';

    try {
        loading.value = true;
        // 调用登录接口
        const response = await request.post('/api/auth/login', form.value);
        const { token, username, userId } = response.data;

        // 存储 Token 和用户名到 localStorage（持久化，刷新页面不丢失）
        localStorage.setItem('blog_token', token);
        localStorage.setItem('blog_username', username);
        localStorage.setItem('blog_userId', userId); // 新增：存储用户ID

        alert('登录成功，即将跳转到首页');
        router.push('/');  // 登录成功后跳首页
    } catch (err) {
        loginError.value = err;
    } finally {
        loading.value = false;
    }
};
</script>

<!-- 只展示修改后的style部分 -->
<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 70px);
    padding: 40px 20px;
}

.auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-white);
    border-radius: var(--border-radius);
    padding: 40px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
}

.auth-card h2 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--text-dark);
    font-size: 24px;
    font-weight: 700;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-dark);
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: var(--transition);
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error-tip {
    margin-top: 8px;
    color: var(--danger-color);
    font-size: 14px;
}

.auth-btn {
    width: 100%;
    padding: 12px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    margin-bottom: 20px;
}

.auth-btn:hover:not(:disabled) {
    background-color: var(--primary-hover);
}

.auth-btn:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
}

.auth-link {
    text-align: center;
    color: var(--text-light);
    font-size: 14px;
}

.auth-link a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}

.auth-link a:hover {
    text-decoration: underline;
}
</style>