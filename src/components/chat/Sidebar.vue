<template>
  <aside class="w-56 flex-shrink-0 flex flex-col bg-zinc-50 dark:bg-[#141416] border-r border-zinc-200 dark:border-[#1e1e24] h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-3 border-b border-zinc-200 dark:border-[#1e1e24]">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1c3a5e] border border-blue-200 dark:border-[#2a5090] flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-blue-500 dark:text-[#6ea8fe]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-[13px] font-semibold text-zinc-900 dark:text-zinc-200">RAG Assistant</span>
      </div>
      <button
        class="w-6 h-6 rounded-md border border-zinc-200 dark:border-[#2a2a32] text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#1c1c24] flex items-center justify-center transition-all"
        title="New chat"
        @click="emit('newChat')"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <!-- Chat history -->
    <div class="flex-1 overflow-y-auto py-2 scrollbar-thin">
      <template v-for="(chats, label) in groupedChats" :key="label">
        <div class="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider px-3.5 pt-3 pb-1">{{ label }}</div>
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="group flex items-center gap-2 w-full px-3 py-1.5 rounded-md mx-1 text-left transition-all cursor-pointer"
          :class="chat.id === activeChatId
            ? 'bg-blue-50 dark:bg-[#1c2a3e] text-blue-700 dark:text-[#9bb8de]'
            : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#1c1c24]'"
          style="width: calc(100% - 8px)"
          @click="emit('selectChat', chat.id)"
        >
          <svg class="w-3 h-3 flex-shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span class="text-[12px] truncate flex-1">{{ chat.title }}</span>
          <button
            class="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0"
            title="Delete chat"
            @click.stop="emit('deleteChat', chat.id)"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="!Object.keys(groupedChats).length" class="px-4 py-6 text-center">
        <p class="text-[12px] text-zinc-700">No chats yet</p>
        <p class="text-[11px] text-zinc-800 mt-1">Start a new conversation</p>
      </div>
    </div>

    <!-- Navigation -->
    <div class="border-t border-zinc-200 dark:border-[#1e1e24] py-1.5">
      <RouterLink
        to="/documents"
        class="flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors"
        :class="$route.name === 'documents' ? 'text-blue-600 dark:text-[#6ea8fe]' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300'"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        Documents
        <span v-if="docCount" class="ml-auto text-[10px] bg-blue-50 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] text-blue-600 dark:text-[#6ea8fe] rounded-full px-1.5 py-0.5 leading-none">
          {{ docCount }}
        </span>
      </RouterLink>

      <button
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        @click="emit('logout')"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>

    <!-- User footer -->
    <div class="border-t border-zinc-200 dark:border-[#1e1e24] px-3 py-2.5 flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-full bg-blue-50 dark:bg-[#1c3a5e] border border-blue-200 dark:border-[#2a5090] flex items-center justify-center text-[11px] font-bold text-blue-600 dark:text-[#6ea8fe] flex-shrink-0">
        {{ user?.avatarInitials ?? '?' }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[12px] font-medium text-zinc-900 dark:text-zinc-300 truncate">{{ user?.name ?? 'User' }}</p>
        <p class="text-[10px] text-zinc-500 dark:text-zinc-700 truncate">{{ user?.email ?? '' }}</p>
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
.scrollbar-thin::-webkit-scrollbar-thumb { background: #222228; border-radius: 4px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #2a2a32; }
</style>