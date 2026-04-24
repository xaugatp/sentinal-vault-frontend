<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] flex items-center justify-center p-4">
    <!-- Background grid pattern -->
    <div class="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(30,30,40,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,40,0.4)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

    <div class="relative w-full max-w-sm">
      <!-- Card -->
      <div class="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-[#222228] rounded-2xl p-8 shadow-xl dark:shadow-2xl">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#1c3a5e] border border-blue-200 dark:border-[#2a5090] flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-[#6ea8fe]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Welcome back</h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Sign in to RAG Assistant</p>
        </div>

        <!-- Error banner -->
        <Transition name="fade">
          <div v-if="error" class="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 mb-5">
            <svg class="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="text-[13px] text-red-600 dark:text-red-300">{{ error }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label class="block text-xs text-zinc-600 dark:text-zinc-500 font-medium mb-1.5">Email address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              class="w-full bg-zinc-50 dark:bg-[#1a1a20] border rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-colors"
              :class="emailError ? 'border-red-500 focus:border-red-600 dark:border-red-800' : 'border-zinc-300 dark:border-[#28282e] focus:border-blue-500 dark:focus:border-[#2a4a7a]'"
              @blur="validateEmail"
            />
            <p v-if="emailError" class="text-xs text-red-400 mt-1">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs text-zinc-600 dark:text-zinc-500 font-medium mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                class="w-full bg-zinc-50 dark:bg-[#1a1a20] border border-zinc-300 dark:border-[#28282e] rounded-xl px-4 py-2.5 pr-11 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-blue-500 dark:focus:border-[#2a4a7a] transition-colors"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-2 w-full py-2.5 rounded-xl bg-blue-600 dark:bg-[#1c3a6e] border border-blue-700 dark:border-[#2a5090] text-white dark:text-[#6ea8fe] text-sm font-medium transition-all hover:bg-blue-700 dark:hover:bg-[#1f4480] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/></svg>
            {{ isLoading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-xs text-zinc-500 dark:text-zinc-700 mt-6">
          JWT authentication · Token auto-refreshes before expiry
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const error = ref('')
const emailError = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

function validateEmail() {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = re.test(form.email) ? '' : 'Enter a valid email address'
}

async function handleLogin() {
  error.value = ''
  validateEmail()
  if (emailError.value) return

  isLoading.value = true
  try {
    await auth.login(form.email, form.password)
    const redirect = (route.query.redirect as string) || '/chat'
    router.push(redirect)
  } catch (err: any) {
    const status = err.response?.status
    if (status === 401) error.value = 'Invalid email or password'
    else if (status === 429) error.value = 'Too many attempts. Try again later.'
    else error.value = 'Connection failed. Check your network.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>