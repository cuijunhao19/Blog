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
                <button type="submit" class="auth-btn" :disabled="loading">
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
        const { token, username } = response.data;

        // 存储 Token 和用户名到 localStorage（持久化，刷新页面不丢失）
        localStorage.setItem('blog_token', token);
        localStorage.setItem('blog_username', username);

        alert('登录成功，即将跳转到首页');
        router.push('/');  // 登录成功后跳首页
    } catch (err) {
        loginError.value = err;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* 复用注册页面的样式，和 Register.vue 一致 */
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
}

.auth-card {
    width: 400px;
    padding: 30px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 其余样式和 Register.vue 相同，省略重复代码 */
</style>