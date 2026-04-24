<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="emit('update:modelValue', false)"
      >
        <div class="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-[#222228] rounded-2xl p-6 w-80 shadow-xl dark:shadow-2xl">
          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>
          <h3 class="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{{ title }}</h3>
          <p class="text-[13px] text-zinc-600 dark:text-zinc-500 mb-6 leading-relaxed">{{ message }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-2 rounded-lg border border-zinc-300 dark:border-[#2a2a36] text-[13px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              @click="emit('update:modelValue', false)"
            >
              Cancel
            </button>
            <button
              class="flex-1 py-2 rounded-lg bg-red-600 dark:bg-red-900/60 border border-red-700 dark:border-red-800 text-[13px] text-white dark:text-red-300 hover:bg-red-700 dark:hover:bg-red-900 transition-colors"
              @click="confirm"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>