// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  // 明确指定 public 目录的路径（相对于项目根目录）
  publicDir: "public",
  server: {
    // 禁用缓存，避免旧路径缓存影响
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: ["!**/public/**"], // 监听 public 目录变化
    },
  },
});
