import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: true,
        proxy: {
            '/auth': { target: 'http://localhost:8000', changeOrigin: true },
            '/exams': { target: 'http://localhost:8000', changeOrigin: true },
            '/behavior': { target: 'http://localhost:8000', changeOrigin: true },
            '/courses': { target: 'http://localhost:8000', changeOrigin: true },
            '/student/profile': { target: 'http://localhost:8000', changeOrigin: true },
            '/admin/api': { target: 'http://localhost:8000', changeOrigin: true }
        }
    },
})
