<!-- src/App.vue -->
<template>
  <!-- 路由出口：所有页面组件都会在这里渲染 -->
  <router-view></router-view>
</template>

<script setup>
// 暂时不需要额外逻辑
</script>

<style>
/* 全局样式（作用于所有组件） */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>