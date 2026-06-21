import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, RegisterCredentials } from '@/types'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)
    const expiresAt = ref<number | null>(null)

    const isAuthenticated = computed(() => !!token.value && !isExpired.value)
    const isExpired = computed(() => {
      if (!expiresAt.value) return true
      return Date.now() >= expiresAt.value * 1000 - 60_000
    })

    async function register(credentials: RegisterCredentials): Promise<void> {
      const response = await authService.register(credentials)
      token.value = response.token
      expiresAt.value = response.expiresAt
      user.value = response.user
      localStorage.setItem('jwt', response.token)
    }

    async function login(email: string, password: string): Promise<void> {
      const response = await authService.login({ email, password })
      token.value = response.token
      expiresAt.value = response.expiresAt
      user.value = response.user

      localStorage.setItem('jwt', response.token)
    }

    async function init(): Promise<void> {
      if (isAuthenticated.value) {
        const claimsUser = await authService.getClaims()
        if (claimsUser) {
          user.value = claimsUser
        } else {
          logout()
        }
      }
    }

    async function logout(): Promise<void> {
      await authService.logout().catch(() => {})
      $reset()
    }

    function $reset() {
      user.value = null
      token.value = null
      expiresAt.value = null
      localStorage.removeItem('jwt')
    }

    return { user, token, expiresAt, isAuthenticated, isExpired, register, login, logout, init, $reset }
  },
  {
    persist: {
      key: 'auth',
      storage: localStorage,
      pick: ['user', 'token', 'expiresAt']
    }
  }
)
