import axios from 'axios'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sentinelvault.onrender.com'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt')
    const isAuthRoute = config.url?.includes('/Auth/login') || config.url?.includes('/Auth/register')
    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      clearAuthAndRedirect()
    }
    return Promise.reject(error)
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem('jwt')
  localStorage.removeItem('auth')
  router.push('/login')
}

export default api
