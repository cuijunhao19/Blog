<template>
    <div :id="editorId" style="width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
</template>

<script setup>
import { defineProps, defineEmits, watch, onMounted, onUnmounted, nextTick } from 'vue';
import request from '../utils/request';

const props = defineProps({
    modelValue: { type: String, default: '' },
    editorId: { type: String, default: 'tinymce-editor' },
    disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

let editorInstance = null;

const initEditor = () => {
    if (window.tinymce) {
        // 先移除已存在的编辑器
        if (window.tinymce.get(props.editorId)) {
            window.tinymce.remove(window.tinymce.get(props.editorId));
        }

        window.tinymce.init({
            selector: `#${props.editorId}`,
            skin_url: '/tinymce/skins/ui/oxide',
            content_css: '/tinymce/skins/content/default/content.min.css',
            theme_url: '/tinymce/themes/silver/theme.min.js',
            language: 'zh_CN',
            language_url: '/tinymce/langs/zh_CN.js',
            plugins: 'advlist autolink lists link image code',
            toolbar: 'undo redo | bold italic underline | bullist numlist | link image | code',
            readonly: props.disabled,
            branding: false,
            menubar: false,
            height: 400,
            images_upload_handler: async (blobInfo, success, failure) => {
                try {
                    const formData = new FormData();
                    formData.append('image', blobInfo.blob(), blobInfo.filename());
                    const res = await request.post('/api/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (res.success) {
                        success(res.url);
                    } else {
                        failure('图片上传失败：' + res.msg);
                    }
                } catch (err) {
                    console.log('后端完整响应：', err.response?.data);
                    failure('图片上传失败：' + (err.response?.data?.msg || err.message || '后端返回格式异常'));
                }
            },
            setup: (editor) => {
                editorInstance = editor;

                // 关键修复：确保在编辑器完全初始化后设置内容
                editor.on('init', () => {
                    console.log('编辑器初始化完成，设置内容:', props.modelValue);
                    editor.setContent(props.modelValue || '');
                });

                editor.on('Change', () => {
                    emit('update:modelValue', editor.getContent());
                });
            }
        });
    } else {
        let checkCount = 0;
        const timer = setInterval(() => {
            checkCount++;
            if (window.tinymce) {
                clearInterval(timer);
                initEditor();
            } else if (checkCount >= 10) {
                clearInterval(timer);
                alert('编辑器核心文件加载失败，请检查：\n1. public/tinymce/tinymce.min.js 是否存在\n2. 路径是否正确');
            }
        }, 100);
    }
};

// 新增：手动设置内容的方法
const setEditorContent = (content) => {
    if (editorInstance && !editorInstance.isHidden()) {
        editorInstance.setContent(content || '');
    }
};

onMounted(() => {
    const scriptSrc = '/tinymce/tinymce.min.js';
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
        // 如果脚本已存在，等待下一个tick再初始化
        nextTick(() => {
            initEditor();
        });
    } else {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.onload = () => {
            nextTick(() => {
                initEditor();
            });
        };
        script.onerror = () => {
            alert(`核心文件加载失败：\n请求路径：${window.location.origin}${scriptSrc}\n请检查该路径是否存在对应的文件`);
        };
        document.body.appendChild(script);
    }
});

// 监听父组件内容变化 - 关键修复
watch(
    () => props.modelValue,
    (newVal, oldVal) => {
        console.log('内容变化:', { newVal, oldVal });
        if (newVal !== oldVal) {
            // 使用nextTick确保DOM更新完成
            nextTick(() => {
                setEditorContent(newVal);
            });
        }
    },
    { immediate: true }
);

// 卸载时清理
onUnmounted(() => {
    if (window.tinymce && window.tinymce.get(props.editorId)) {
        window.tinymce.remove(window.tinymce.get(props.editorId));
    }
    editorInstance = null;
});

// 暴露方法给父组件
defineExpose({
    setEditorContent
});
</script>

<style scoped>
/* 调整编辑器容器样式，避免边框异常 */
#tinymce-editor {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}
</style>