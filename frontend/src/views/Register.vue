<!-- src/views/Register.vue -->
<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>用户注册</h2>
            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" v-model.trim="form.username" placeholder="请输入用户名（1-20字符）" required>
                    <p class="error-tip" v-if="errors.username">{{ errors.username }}</p>
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" v-model="form.password" placeholder="请输入密码（不少于6字符）" required>
                    <p class="error-tip" v-if="errors.password">{{ errors.password }}</p>
                </div>
                <!-- 更新认证按钮 -->
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading">注册中...</span>
                    <span v-else>注册</span>
                </button>
                <p class="auth-link">
                    已有账号？<router-link to="/login">去登录</router-link>
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
const errors = ref({ username: '', password: '' });

const handleRegister = async () => {
    errors.value = { username: '', password: '' };
    let isValid = true;

    // 前端验证
    if (!form.value.username.trim()) {
        errors.value.username = '用户名不能为空';
        isValid = false;
    } else if (form.value.username.length > 20) {
        errors.value.username = '用户名不能超过20字符';
        isValid = false;
    }

    if (form.value.password.length < 3) {
        errors.value.password = '密码不能少于3字符';
        isValid = false;
    }

    if (!isValid) return;

    try {
        loading.value = true;
        // 调用注册接口
        await request.post('/api/auth/register', form.value);
        alert('注册成功，即将跳转到登录页');
        router.push('/login');  // 注册成功后跳登录
    } catch (err) {
        alert('注册失败：' + err);
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