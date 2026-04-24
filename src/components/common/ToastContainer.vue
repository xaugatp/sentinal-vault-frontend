<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2.5 items-end">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="min-w-[300px] max-w-md border rounded-xl shadow-lg dark:shadow-2xl px-4 py-3 flex gap-3 pointer-events-auto cursor-pointer"
        :class="toastClasses(toast.type)"
        @click="remove(toast.id)"
      >
        <!-- Icon -->
        <div class="mt-0.5 flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type === 'error'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else-if="toast.type === 'warning'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-tight">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-xs mt-0.5 opacity-75 truncate">{{ toast.message }}</p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import type { ToastType } from '@/types'

const { toasts, remove } = useToast()

function toastClasses(type: ToastType): string {
  const map: Record<ToastType, string> = {
    success: 'bg-green-50 dark:bg-[#0e2a1a] border-green-200 dark:border-[#1a3a28] text-green-700 dark:text-[#4ade80]',
    error:   'bg-red-50 dark:bg-[#200e0e] border-red-200 dark:border-[#3a1a1a] text-red-600 dark:text-[#f87171]',
    warning: 'bg-yellow-50 dark:bg-[#1c1408] border-yellow-200 dark:border-[#2c2410] text-yellow-700 dark:text-[#fbbf24]',
    info:    'bg-blue-50 dark:bg-[#0e1d38] border-blue-200 dark:border-[#1a2d52] text-blue-700 dark:text-[#6ea8fe]'
  }
  return map[type] || ''
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }
.toast-move       { transition: transform 0.2s ease; }
</style>