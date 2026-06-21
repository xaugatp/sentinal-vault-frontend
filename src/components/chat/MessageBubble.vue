<template>
  <div class="flex gap-4 max-w-full group animate-fade-in" :class="message.role === 'user' ? 'flex-row-reverse self-end' : ''">
    <!-- Avatar -->
    <div
      class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold mt-1 shadow-sm"
      :class="message.role === 'assistant'
        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'"
    >
      {{ message.role === 'assistant' ? 'AI' : userInitials }}
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-2" :class="message.role === 'user' ? 'items-end' : 'items-start'" style="max-width: min(600px, calc(100% - 50px))">
      <!-- File badge -->
      <div v-if="message.attachedFile" class="flex items-center gap-2 text-[12px] text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-1.5 backdrop-blur-sm">
        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <span class="truncate max-w-[200px] font-medium">{{ message.attachedFile.name }}</span>
        <span class="text-zinc-500 dark:text-zinc-400 ml-1">{{ formatSize(message.attachedFile.size) }}</span>
      </div>

      <!-- Bubble -->
      <div
        class="rounded-2xl px-4.5 py-3 text-[14.5px] leading-relaxed shadow-sm transition-all"
        :class="message.role === 'assistant'
          ? 'bg-white dark:bg-premium-card border border-zinc-100 dark:border-premium-border rounded-tl-sm text-zinc-800 dark:text-zinc-200'
          : 'bg-blue-600 dark:bg-blue-600 text-white rounded-tr-sm'"
      >
        <span class="markdown-body font-sans" :class="message.role === 'user' ? 'text-white' : ''" v-html="rendered" />
        <span v-if="message.isStreaming && message.content" class="streaming-cursor ml-1" />
        <!-- Thinking dots when empty streaming -->
        <span v-if="message.isStreaming && !message.content" class="thinking">
          <span class="bg-indigo-500" /><span class="bg-indigo-500" /><span class="bg-indigo-500" />
        </span>
      </div>

      <!-- Sources -->
      <div v-if="message.sources?.length" class="flex flex-wrap gap-2 mt-1">
        <span class="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 self-center mr-1">Sources:</span>
        <a
          v-for="(src, i) in message.sources"
          :key="i"
          class="flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-zinc-100 dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-premium-border transition-all cursor-pointer"
          :href="src.url ?? '#'"
          target="_blank"
          rel="noopener"
        >
          <svg class="w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          {{ src.title }}{{ src.page ? ` p.${src.page}` : '' }}
        </a>
      </div>

      <!-- Timestamp -->
      <span class="text-[11px] text-zinc-400 dark:text-zinc-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity">{{ formatTime(message.timestamp) }}</span>
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
    .replace(/`([^`]+)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: currentColor;
  animation: blink 0.9s step-end infinite;
  vertical-align: middle;
  border-radius: 1px;
}
@keyframes blink { 50% { opacity: 0; } }

.thinking { display: inline-flex; gap: 4px; align-items: center; height: 16px; margin-left: 4px; }
.thinking span {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: dot 1.2s ease-in-out infinite;
}
.thinking span:nth-child(2) { animation-delay: 0.2s; }
.thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-4px); opacity: 1; }
}
.markdown-body {
  word-break: break-word;
}
</style>