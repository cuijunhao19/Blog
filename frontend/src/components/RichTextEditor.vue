<template>
    <div :id="editorId" style="width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
</template>

<script setup>
import { defineProps, defineEmits, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    editorId: { type: String, default: 'tinymce-editor' },
    disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

const initEditor = () => {
    if (window.tinymce) {
        // 先移除已存在的编辑器
        if (window.tinymce.get(props.editorId)) {
            window.tinymce.remove(window.tinymce.get(props.editorId));
        }

        window.tinymce.init({
            selector: `#${props.editorId}`,

            // 1. 核心文件已通过 script 标签加载，无需再配置

            // 2. 皮肤路径（根据实际文件位置修改）
            skin_url: '/tinymce/skins/ui/oxide',  // 对应 D:\...\public\tinymce\skins\ui\oxide

            // 3. 内容区样式路径
            content_css: '/tinymce/skins/content/default/content.min.css',

            // 4. 主题路径（关键修复：使用你提供的 theme.min.js）
            theme_url: '/tinymce/themes/silver/theme.min.js',  // 对应你提供的实际路径

            // 5. 中文语言包路径
            language: 'zh_CN',
            language_url: '/tinymce/langs/zh_CN.js',  // 确保该文件存在

            // 6. 插件（只保留你 public/tinymce/plugins 目录下有的插件）
            plugins: 'advlist autolink lists link image code',

            // 7. 工具栏（与插件对应）
            toolbar: 'undo redo | bold italic underline | bullist numlist | link image | code',

            // 其他配置
            readonly: props.disabled,
            branding: false,
            menubar: false,
            height: 400,
            images_upload_handler: (blobInfo, success) => {
                const reader = new FileReader();
                reader.onload = () => success(reader.result);
                reader.readAsDataURL(blobInfo.blob());
            },
            setup: (editor) => {
                editor.setContent(props.modelValue);
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

onMounted(() => {
    // 加载核心文件（tinymce.min.js），使用你的实际路径
    const scriptSrc = '/tinymce/tinymce.min.js';  // 对应 D:\...\public\tinymce\tinymce.min.js
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
        initEditor();
    } else {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.onload = initEditor;
        script.onerror = () => {
            // 错误提示显示实际请求的路径，方便排查
            alert(`核心文件加载失败：\n请求路径：${window.location.origin}${scriptSrc}\n请检查该路径是否存在对应的文件`);
        };
        document.body.appendChild(script);
    }
});

// 监听父组件内容变化
watch(
    () => props.modelValue,
    (newVal) => {
        if (window.tinymce && window.tinymce.get(props.editorId)) {
            window.tinymce.get(props.editorId).setContent(newVal);
        }
    }
);

// 卸载时清理
onUnmounted(() => {
    if (window.tinymce && window.tinymce.get(props.editorId)) {
        window.tinymce.remove(window.tinymce.get(props.editorId));
    }
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