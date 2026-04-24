<template>
  <div class="px-5 pb-4 pt-3 border-t border-zinc-200 dark:border-[#1a1a22]">
    <!-- File preview -->
    <Transition name="slide-up">
      <div v-if="pendingFile" class="flex items-center gap-2.5 bg-blue-50 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] rounded-xl px-3.5 py-2.5 mb-2.5">
        <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-[#1c3a5e] flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-blue-500 dark:text-[#6ea8fe]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[12.5px] text-zinc-900 dark:text-zinc-300 truncate">{{ pendingFile.name }}</p>
          <p class="text-[10px] text-zinc-500 dark:text-zinc-700">{{ formatSize(pendingFile.size) }}</p>
        </div>
        <button
          class="text-zinc-700 hover:text-zinc-400 p-1 rounded transition-colors"
          @click="emit('clearFile')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Input box -->
    <div
      class="flex items-end gap-2 bg-white dark:bg-[#18181e] border rounded-xl px-3 py-2.5 transition-colors shadow-sm dark:shadow-none"
      :class="isFocused ? 'border-blue-300 dark:border-[#2a4a7a]' : 'border-zinc-200 dark:border-[#28282e]'"
    >
      <!-- Attach button -->
      <button
        class="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all"
        :class="isStreaming
          ? 'border-zinc-200 dark:border-[#222228] text-zinc-400 dark:text-zinc-800 cursor-not-allowed'
          : 'border-zinc-200 dark:border-[#28282e] text-zinc-500 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-[#1e1e28] hover:text-zinc-800 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-[#3a3a46]'"
        title="Attach file"
        :disabled="isStreaming"
        @click="fileInputRef?.click()"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        class="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 resize-none font-sans leading-relaxed"
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
        class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
        :class="canSend
          ? 'bg-blue-50 dark:bg-[#1c3a6e] border border-blue-200 dark:border-[#2a5090] text-blue-600 dark:text-[#6ea8fe] hover:bg-blue-100 dark:hover:bg-[#1f4480]'
          : isStreaming
            ? 'bg-red-50 dark:bg-[#1a0e0e] border border-red-200 dark:border-[#3a1a1a] text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-[#200e0e]'
            : 'bg-zinc-100 dark:bg-[#1a1a24] border border-zinc-200 dark:border-[#28282e] text-zinc-400 dark:text-zinc-700 cursor-not-allowed'"
        :title="isStreaming ? 'Stop' : 'Send'"
        @click="isStreaming ? emit('stop') : handleSend()"
      >
        <!-- Send icon -->
        <svg v-if="!isStreaming" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <!-- Stop icon -->
        <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      </button>
    </div>

    <!-- Hints -->
    <p class="text-[11px] text-zinc-500 dark:text-zinc-800 text-center mt-2">
      Enter to send · Shift+Enter for new line · PDF, DOCX, TXT, MD supported
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
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
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
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(6px); }
</style>