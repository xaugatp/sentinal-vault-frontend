<template>
  <div class="px-6 pb-6 pt-2 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent dark:from-premium-dark dark:via-premium-dark dark:to-transparent z-10 relative">
    <!-- File preview -->
    <Transition name="slide-up">
      <div v-if="pendingFile" class="flex items-center gap-3 bg-white dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-xl px-4 py-3 mb-3 shadow-sm max-w-sm">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-medium text-zinc-900 dark:text-zinc-200 truncate">{{ pendingFile.name }}</p>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-500">{{ formatSize(pendingFile.size) }}</p>
        </div>
        <button
          class="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          @click="emit('clearFile')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Input box -->
    <div
      class="flex items-end gap-3 bg-white dark:bg-premium-card border rounded-2xl px-4 py-3 transition-all shadow-md dark:shadow-none"
      :class="isFocused ? 'border-blue-500 ring-4 ring-blue-500/10 dark:border-blue-500/50 dark:ring-blue-500/10' : 'border-zinc-200 dark:border-premium-border hover:border-zinc-300 dark:hover:border-zinc-700'"
    >
      <!-- Attach button -->
      <button
        class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mb-0.5"
        :class="isStreaming
          ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-premium-darker hover:text-blue-600 dark:hover:text-blue-400'"
        title="Attach file"
        :disabled="isStreaming"
        @click="fileInputRef?.click()"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".pdf,.docx,.txt,.md,.csv,.json"
        @change="handleFileSelect"
      />

      <!-- Textarea -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="flex-1 bg-transparent border-none outline-none text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 resize-none font-sans leading-relaxed py-2 max-h-[200px]"
        :class="isStreaming ? 'cursor-not-allowed opacity-60' : ''"
        placeholder="Ask anything about your documents…"
        rows="1"
        :disabled="isStreaming"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.shift.enter="() => {}"
        @input="autoResize"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Send / Stop button -->
      <button
        class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mb-0.5 shadow-sm"
        :class="canSend
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20'
          : isStreaming
            ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 animate-pulse'
            : 'bg-zinc-100 dark:bg-premium-darker text-zinc-400 dark:text-zinc-600 cursor-not-allowed'"
        :title="isStreaming ? 'Stop' : 'Send'"
        @click="isStreaming ? emit('stop') : handleSend()"
      >
        <!-- Send icon -->
        <svg v-if="!isStreaming" class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <!-- Stop icon -->
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      </button>
    </div>

    <!-- Hints -->
    <p class="text-[12px] text-zinc-500 dark:text-zinc-500 text-center mt-3 font-medium tracking-wide">
      Enter to send <span class="mx-1.5 opacity-50">·</span> Shift+Enter for new line <span class="mx-1.5 opacity-50">·</span> PDF, DOCX, TXT, MD supported
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface PendingFile { name: string; size: number }

const props = defineProps<{
  isStreaming: boolean
  pendingFile: PendingFile | null
}>()

const emit = defineEmits<{
  send: [text: string]
  fileSelected: [file: File]
  clearFile: []
  stop: []
}>()

const inputText = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const canSend = computed(() => (inputText.value.trim() || props.pendingFile) && !props.isStreaming)

function handleSend() {
  const text = inputText.value.trim()
  if (!text && !props.pendingFile) return
  if (props.isStreaming) return
  emit('send', text || '[file attached]')
  inputText.value = ''
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('fileSelected', file)
  ;(e.target as HTMLInputElement).value = ''
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>