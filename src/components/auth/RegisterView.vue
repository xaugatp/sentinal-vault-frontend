<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-premium-dark flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Premium background gradients -->
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

    <div class="relative w-full max-w-sm z-10 animate-fade-in">
      <!-- Card -->
      <div class="glass rounded-3xl p-8 shadow-2xl dark:shadow-blue-900/5">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8 animate-slide-up">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Create an account</h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Join SentinelVault today</p>
        </div>

        <!-- Error banner -->
        <Transition name="fade">
          <div v-if="error" class="flex items-center gap-3 bg-red-50/80 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/50 rounded-2xl px-4 py-3.5 mb-6 backdrop-blur-sm">
            <svg class="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="text-[13px] font-medium text-red-600 dark:text-red-300">{{ error }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form class="flex flex-col gap-4.5" @submit.prevent="handleRegister">
          <!-- Name Fields -->
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 ml-1">First name</label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="John"
                class="w-full bg-zinc-100/50 dark:bg-premium-darker/50 border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              />
            </div>
            <div class="flex-1">
              <label class="block text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 ml-1">Last name</label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Doe"
                class="w-full bg-zinc-100/50 dark:bg-premium-darker/50 border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="mt-1">
            <label class="block text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 ml-1">Email address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              class="w-full bg-zinc-100/50 dark:bg-premium-darker/50 border rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              :class="emailError ? 'border-red-400 focus:border-red-500 dark:border-red-800' : 'border-zinc-200 dark:border-premium-border focus:border-blue-500 dark:focus:border-blue-500/50'"
              @blur="validateEmail"
            />
            <p v-if="emailError" class="text-xs text-red-500 dark:text-red-400 mt-1.5 ml-1">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div class="mt-1">
            <label class="block text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 ml-1">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-zinc-100/50 dark:bg-premium-darker/50 border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="mt-1">
            <label class="block text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-1.5 ml-1">Confirm Password</label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-zinc-100/50 dark:bg-premium-darker/50 border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              />
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/></svg>
            {{ isLoading ? 'Creating account…' : 'Sign up' }}
          </button>
        </form>

        <p class="text-center text-[13px] text-zinc-500 dark:text-zinc-400 mt-8">
          Already have an account? 
          <RouterLink to="/login" class="text-blue-600 dark:text-premium-accent font-medium hover:underline underline-offset-4">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
const error = ref('')
const emailError = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

function validateEmail() {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = re.test(form.email) ? '' : 'Enter a valid email address'
}

async function handleRegister() {
  error.value = ''
  validateEmail()
  if (emailError.value) return
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  try {
    await auth.register({
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      firstName: form.firstName,
      lastName: form.lastName
    })
    router.push('/chat')
  } catch (err: any) {
    const data = err.response?.data
    if (data?.error?.description) {
      error.value = data.error.description
    } else if (data?.message) {
      error.value = data.message
    } else if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0]
      if (firstKey) {
        error.value = data.errors[firstKey]?.[0] || data.title || 'Validation error'
      } else {
        error.value = data.title || 'Validation error'
      }
    } else if (err.response?.status === 400) {
      error.value = 'Invalid registration details'
    } else {
      error.value = err.message || 'Connection failed. Check your network.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
</style>
