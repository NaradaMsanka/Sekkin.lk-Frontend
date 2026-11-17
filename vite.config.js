import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  ...(mode === 'demo' ? {
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:8080') },
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
  } : {}),
}))
