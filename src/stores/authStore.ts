import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const expiresAt = ref<number | null>(null)

    const isAuthenticated = computed(() => !!token.value && !isExpired.value)
    const isExpired = computed(() => {
      if (!expiresAt.value) return true
      return Date.now() >= expiresAt.value * 1000 - 60_000
    })

    async function login(email: string, password: string): Promise<void> {
      const response = await authService.login({ email, password })
      token.value = response.token
      refreshToken.value = response.refreshToken
      expiresAt.value = response.expiresAt
      user.value = response.user

      // Also sync with localStorage for axios interceptors
      localStorage.setItem('jwt', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    async function logout(): Promise<void> {
      await authService.logout().catch(() => {})
      $reset()
    }

    function $reset() {
      user.value = null
      token.value = null
      refreshToken.value = null
      expiresAt.value = null
      localStorage.removeItem('jwt')
      localStorage.removeItem('refreshToken')
    }

    return { user, token, refreshToken, expiresAt, isAuthenticated, isExpired, login, logout, $reset }
  },
  {
    persist: {
      key: 'auth',
      storage: localStorage,
      pick: ['user', 'token', 'refreshToken', 'expiresAt']
    }
  }
)