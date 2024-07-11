import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
// 在开发期间 Vite 是一个服务器，而 index.html 是该 Vite 项目的入口文件
export default defineConfig({
  plugins: [
    vue(),
  ],
})