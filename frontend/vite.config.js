import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true, // 요청 헤더를 Flask 서버에 맞춤
        secure: false, // HTTP 백엔드 연결 허용
      },
    },
  },
});
