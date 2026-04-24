import api from './api'
import type { LoginCredentials, AuthResponse } from '@/types'

// 🔁 Toggle this when backend is ready
const USE_MOCK_AUTH = true

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      // =========================
      // 🚀 MOCK LOGIN (ACTIVE)
      // =========================
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-jwt-token-12345',
            refreshToken: 'mock-refresh-token-12345',
            expiresAt: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: 'mock-user-1',
              email: credentials.email,
              name: 'Demo User',
              role: 'user',
              avatarInitials: credentials.email.substring(0, 2).toUpperCase()
            }
          })
        }, 800)
      })
    }

    // =========================
    // 🔌 REAL BACKEND (DISABLED FOR NOW)
    // =========================
    /*
    const { data } = await api.post<AuthResponse>(
      '/api/auth/login',
      credentials
    )
    return data
    */
  },

  async logout(): Promise<void> {
    if (USE_MOCK_AUTH) {
      // MOCK: just clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('jwt-expires')
      return
    }

    // REAL BACKEND
    /*
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.post('/api/auth/logout', { refreshToken }).catch(() => {})
    }
    */
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      // MOCK: simulate refresh
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-new-token-67890',
            refreshToken: 'mock-refresh-token-12345',
            expiresAt: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: 'mock-user-1',
              email: 'demo@example.com',
              name: 'Demo User',
              role: 'user',
              avatarInitials: 'DE'
            }
          })
        }, 500)
      })
    }

    // REAL BACKEND
    /*
    const { data } = await api.post<AuthResponse>(
      '/api/auth/refresh',
      { refreshToken }
    )
    return data
    */
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('jwt-expires')
    if (!expiresAt) return true
    return Date.now() >= parseInt(expiresAt, 10) * 1000 - 60_000
  }
}