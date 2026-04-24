<template>
  <div class="flex gap-3 max-w-full" :class="message.role === 'user' ? 'flex-row-reverse self-end' : ''">
    <!-- Avatar -->
    <div
      class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
      :class="message.role === 'assistant'
        ? 'bg-green-100 dark:bg-[#0e2a1a] border border-green-200 dark:border-[#1a3a28] text-green-700 dark:text-[#4ade80]'
        : 'bg-blue-100 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] text-blue-700 dark:text-[#6ea8fe]'"
    >
      {{ message.role === 'assistant' ? 'AI' : userInitials }}
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-1.5" :class="message.role === 'user' ? 'items-end' : 'items-start'" style="max-width: min(520px, calc(100% - 44px))">
      <!-- File badge -->
      <div v-if="message.attachedFile" class="flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-[#6ea8fe] bg-blue-50 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] rounded-lg px-2.5 py-1">
        <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <span class="truncate max-w-[180px]">{{ message.attachedFile.name }}</span>
        <span class="text-zinc-500 dark:text-zinc-700">{{ formatSize(message.attachedFile.size) }}</span>
      </div>

      <!-- Bubble -->
      <div
        class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm dark:shadow-none"
        :class="message.role === 'assistant'
          ? 'bg-white dark:bg-[#1a1a20] border border-zinc-200 dark:border-[#25252e] rounded-tl-md text-zinc-800 dark:text-zinc-300'
          : 'bg-blue-50 dark:bg-[#0f1e38] border border-blue-100 dark:border-[#182840] rounded-tr-md text-zinc-900 dark:text-zinc-200'"
      >
        <span v-html="rendered" />
        <span v-if="message.isStreaming && message.content" class="streaming-cursor" />
        <!-- Thinking dots when empty streaming -->
        <span v-if="message.isStreaming && !message.content" class="thinking">
          <span /><span /><span />
        </span>
      </div>

      <!-- Sources -->
      <div v-if="message.sources?.length" class="flex flex-wrap gap-1.5 mt-0.5">
        <span class="text-[11px] text-zinc-500 dark:text-zinc-700 self-center">Sources:</span>
        <a
          v-for="(src, i) in message.sources"
          :key="i"
          class="text-[11px] px-2.5 py-0.5 bg-blue-50 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] rounded-full text-blue-700 dark:text-[#6ea8fe] hover:bg-blue-100 dark:hover:bg-[#152844] transition-colors cursor-pointer"
          :href="src.url ?? '#'"
          target="_blank"
          rel="noopener"
        >
          {{ src.title }}{{ src.page ? ` p.${src.page}` : '' }}
        </a>
      </div>

      <!-- Timestamp -->
      <span class="text-[10px] text-zinc-400 dark:text-zinc-800 px-0.5">{{ formatTime(message.timestamp) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'

const props = defineProps<{ message: Message; userInitials?: string }>()

function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

// Minimal markdown renderer: bold, inline code, line breaks
const rendered = computed(() => {
  return props.message.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-[#0d0d14] px-1.5 py-0.5 rounded text-blue-600 dark:text-[#a5d6ff] text-[12px] font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 13px;
  background: #6ea8fe;
  animation: blink 0.9s step-end infinite;
  vertical-align: middle;
  margin-left: 2px;
  border-radius: 1px;
}
@keyframes blink { 50% { opacity: 0; } }

.thinking { display: inline-flex; gap: 4px; align-items: center; height: 16px; }
.thinking span {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #444;
  animation: dot 1.2s ease-in-out infinite;
}
.thinking span:nth-child(2) { animation-delay: 0.2s; }
.thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
</style>