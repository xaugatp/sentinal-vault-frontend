import { ref } from 'vue'
import type { Toast, ToastType } from '@/types'

const toasts = ref<Toast[]>([])

export function useToast() {
  function add(type: ToastType, title: string, message?: string, duration = 4000): string {
    const id = crypto.randomUUID()
    toasts.value.push({ id, type, title, message, duration })
    if (duration > 0) setTimeout(() => remove(id), duration)
    return id
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    remove,
    success: (title: string, message?: string) => add('success', title, message),
    error: (title: string, message?: string) => add('error', title, message, 6000),
    info: (title: string, message?: string) => add('info', title, message),
    warning: (title: string, message?: string) => add('warning', title, message)
  }
}