import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      '.ngrok-free.app',  // ngrok 도메인 전체 허용
      '.ngrok.io',        // ngrok 구 도메인도 허용
    ]
  }
})
