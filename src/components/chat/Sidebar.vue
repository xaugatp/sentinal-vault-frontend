<template>
  <aside class="w-64 flex-shrink-0 flex flex-col bg-zinc-50/50 dark:bg-premium-darker border-r border-zinc-200 dark:border-premium-border h-full relative z-20">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-premium-border">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">SentinelVault</span>
      </div>
      <button
        class="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="New chat"
        @click="emit('newChat')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <!-- Chat history -->
    <div class="flex-1 overflow-y-auto py-3 scrollbar-thin">
      <template v-for="(chats, label) in groupedChats" :key="label">
        <div class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-4 pt-3 pb-1.5">{{ label }}</div>
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="group flex items-center gap-2.5 w-full px-4 py-2 mx-1 rounded-xl text-left transition-all cursor-pointer"
          :class="chat.id === activeChatId
            ? 'bg-blue-50 dark:bg-premium-card text-blue-700 dark:text-blue-400 font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-premium-card/50'"
          style="width: calc(100% - 8px)"
          @click="emit('selectChat', chat.id)"
        >
          <svg class="w-3.5 h-3.5 flex-shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span class="text-[13px] truncate flex-1">{{ chat.title }}</span>
          <button
            class="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
            title="Delete chat"
            @click.stop="emit('deleteChat', chat.id)"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="!Object.keys(groupedChats).length" class="px-4 py-8 text-center animate-fade-in">
        <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-premium-card flex items-center justify-center mx-auto mb-3">
          <svg class="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <p class="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">No chats yet</p>
        <p class="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1">Start a new conversation</p>
      </div>
    </div>

    <!-- Navigation -->
    <div class="border-t border-zinc-200 dark:border-premium-border py-2 px-2">
      <RouterLink
        to="/documents"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
        :class="$route.name === 'documents' ? 'bg-blue-50 dark:bg-premium-card text-blue-700 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-premium-card/50'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        Documents
        <span v-if="docCount" class="ml-auto text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5 leading-none font-bold">
          {{ docCount }}
        </span>
      </RouterLink>

      <button
        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        @click="emit('logout')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>

    <!-- User footer -->
    <div class="border-t border-zinc-200 dark:border-premium-border px-4 py-3 flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-sm">
        {{ user?.avatarInitials ?? '?' }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{{ user?.name ?? 'User' }}</p>
        <p class="text-[11px] text-zinc-500 dark:text-zinc-500 truncate">{{ user?.email ?? '' }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Chat, AuthUser } from '@/types'

defineProps<{
  groupedChats: Record<string, Chat[]>
  activeChatId: string | null
  user: AuthUser | null
  docCount: number
}>()

const emit = defineEmits<{
  newChat: []
  selectChat: [id: string]
  deleteChat: [id: string]
  logout: []
}>()
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { @apply bg-zinc-300 dark:bg-zinc-700 rounded-full; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { @apply bg-zinc-400 dark:bg-zinc-600; }
</style>