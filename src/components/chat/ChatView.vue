<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-[#0f0f11] overflow-hidden">
    <Sidebar
      :grouped-chats="chatStore.groupedChats"
      :active-chat-id="chatStore.activeChatId"
      :user="auth.user"
      :doc-count="docStore.readyDocuments.length"
      @new-chat="handleNewChat"
      @select-chat="chatStore.setActiveChat"
      @delete-chat="handleDeleteChat"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <div class="flex items-center justify-between px-5 h-11 border-b border-zinc-200 dark:border-[#1a1a22] flex-shrink-0">
        <div class="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-600">
          <!-- WS status dot -->
          <div class="w-2 h-2 rounded-full transition-colors" :class="wsStatusClass" />
          <span class="truncate max-w-xs">{{ chatStore.activeChat?.title ?? 'New chat' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- WS status badge -->
          <div
            class="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border"
            :class="wsStatusBadgeClass"
          >
            <div class="w-1.5 h-1.5 rounded-full" :class="wsStatusDotClass" />
            {{ wsStatusLabel }}
          </div>
          <!-- Theme Toggle -->
          <button
            class="w-7 h-7 rounded-lg border border-zinc-200 dark:border-[#1e1e28] text-zinc-600 dark:text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1e1e28] flex items-center justify-center transition-all"
            title="Toggle theme"
            @click="themeStore.toggleTheme()"
          >
            <!-- Sun icon for light mode -->
            <svg v-if="!themeStore.isDark" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <!-- Moon icon for dark mode -->
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <!-- Clear -->
          <button
            class="w-7 h-7 rounded-lg border border-zinc-200 dark:border-[#1e1e28] text-zinc-600 dark:text-zinc-700 hover:text-red-500 dark:hover:text-zinc-400 hover:bg-red-50 dark:hover:bg-[#1e1e28] flex items-center justify-center transition-all"
            title="Clear chat"
            @click="chatStore.clearActiveChat()"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesRef"
        class="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5 messages-scroll"
      >
        <!-- Empty state -->
        <div v-if="!chatStore.messages.length" class="flex flex-col items-center justify-center h-full gap-4 text-center">
          <div class="w-14 h-14 rounded-2xl bg-white dark:bg-[#141420] border border-zinc-200 dark:border-[#22222e] flex items-center justify-center text-[#3a7bd5]">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">What can I help with?</h2>
            <p class="text-sm text-zinc-500 dark:text-zinc-600 mt-1.5 max-w-sm">Ask questions using your knowledge base, or attach a document for context.</p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
            <button
              v-for="s in suggestions"
              :key="s"
              class="text-[12.5px] px-3.5 py-2 rounded-full border border-zinc-200 dark:border-[#28282e] text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-[#3a3a4a] hover:bg-zinc-100 dark:hover:bg-[#1a1a24] transition-all"
              @click="sendMessage(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Message list -->
        <MessageBubble
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :message="msg"
          :user-initials="auth.user?.avatarInitials ?? 'U'"
        />
      </div>

      <!-- Input -->
      <ChatInput
        :is-streaming="chatStore.isStreaming"
        :pending-file="pendingFileMeta"
        @send="sendMessage"
        @file-selected="handleFileSelected"
        @clear-file="clearFile"
        @stop="stopStreaming"
      />
    </div>

    <!-- Delete chat confirm -->
    <ConfirmModal
      v-model="confirmDelete"
      title="Delete chat?"
      message="This will permanently remove this conversation and all its messages."
      confirm-label="Delete"
      @confirm="() => chatToDelete && chatStore.deleteChat(chatToDelete)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useWebSocket } from '@/composables/useWebSockets'
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/themeStore'
import { chatService } from '@/services/chatService'
import type { WsStatus } from '@/types'

const router = useRouter()
const chatStore = useChatStore()
const auth = useAuthStore()
const docStore = useDocumentStore()
const toast = useToast()
const themeStore = useThemeStore()
const ws = useWebSocket()

const messagesRef = ref<HTMLElement | null>(null)
const pendingFile = ref<File | null>(null)
const pendingFileId = ref<string | null>(null)
const confirmDelete = ref(false)
const chatToDelete = ref<string | null>(null)
const streamAborted = ref(false)

const pendingFileMeta = computed(() =>
  pendingFile.value ? { name: pendingFile.value.name, size: pendingFile.value.size } : null
)

const suggestions = [
  'How does the cache hit flow work?',
  'Explain the RAG retrieval pipeline',
  'What does the Hybrid Retriever do?',
  'How are documents ingested?'
]

// ── WS status display ─────────────────────────────────────────────────────────
const wsStatusClass = computed(() => ({
  'connected':     'bg-[#4ade80]',
  'connecting':    'bg-amber-400 animate-pulse',
  'disconnected':  'bg-zinc-700',
  'error':         'bg-red-500'
}[ws.status.value]))

const wsStatusBadgeClass = computed(() => ({
  'connected':    'border-green-200 text-green-700 bg-green-50 dark:border-[#1a3a28] dark:text-[#4ade80] dark:bg-[#0e2a1a]',
  'connecting':   'border-amber-200 text-amber-700 bg-amber-50 dark:border-[#2c2410] dark:text-amber-400 dark:bg-[#1c1408]',
  'disconnected': 'border-zinc-200 text-zinc-500 dark:border-[#222228] dark:text-zinc-600 bg-transparent',
  'error':        'border-red-200 text-red-600 bg-red-50 dark:border-red-900 dark:text-red-400 dark:bg-red-950/40'
}[ws.status.value]))

const wsStatusDotClass = computed(() => ({
  'connected':    'bg-[#4ade80]',
  'connecting':   'bg-amber-400 animate-pulse',
  'disconnected': 'bg-zinc-700',
  'error':        'bg-red-500'
}[ws.status.value]))

const wsStatusLabel = computed<string>(() => ({
  connected: 'WebSocket connected',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
  error: 'Connection error'
}[ws.status.value as WsStatus]))

// ── WebSocket setup ───────────────────────────────────────────────────────────
onMounted(() => {
  chatStore.init()
  docStore.fetchAll()
  ws.connect()

  ws.onMessage(msg => {
    if (streamAborted.value) return
    if (msg.type === 'chunk' && msg.content) chatStore.appendChunk(msg.content)
    if (msg.type === 'sources' && msg.data) {/* sources come with 'done' */}
    if (msg.type === 'done') chatStore.finishStreaming(msg.data)
    if (msg.type === 'error') {
      chatStore.finishStreaming(undefined, `Error: ${msg.message}`)
      toast.error('Stream error', msg.message)
    }
  })
})

// ── Send message ──────────────────────────────────────────────────────────────
async function sendMessage(text: string) {
  if (!chatStore.activeChatId) chatStore.createChat()

  const fileAttach = pendingFile.value ? { name: pendingFile.value.name, size: pendingFile.value.size } : undefined
  chatStore.addUserMessage(text, fileAttach)
  chatStore.startAssistantMessage()
  streamAborted.value = false

  const payload = {
    type: 'query' as const,
    text,
    sessionId: chatStore.activeChatId!,
    fileId: pendingFileId.value ?? undefined
  }

  const sent = ws.sendQuery(payload)
  clearFile()

  if (!sent) {
    // WebSocket unavailable → fall back to SSE
    toast.info('Using HTTP stream (WebSocket unavailable)')
    await chatService.streamFallback(
      { query: text, sessionId: payload.sessionId, fileId: payload.fileId },
      chunk => { if (!streamAborted.value) chatStore.appendChunk(chunk) },
      sources => {},
      () => chatStore.finishStreaming(),
      err => {
        chatStore.finishStreaming(undefined, `Failed: ${err}`)
        toast.error('Stream failed', err)
      }
    )
  }
}

function stopStreaming() {
  streamAborted.value = true
  chatStore.finishStreaming()
}

// ── File handling ─────────────────────────────────────────────────────────────
function handleFileSelected(file: File) {
  pendingFile.value = file
  pendingFileId.value = null // set after upload if needed
}

function clearFile() {
  pendingFile.value = null
  pendingFileId.value = null
}

// ── Chat actions ──────────────────────────────────────────────────────────────
function handleNewChat() {
  chatStore.createChat()
}

function handleDeleteChat(id: string) {
  chatToDelete.value = id
  confirmDelete.value = true
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

// ── Auto-scroll ───────────────────────────────────────────────────────────────
watch([() => chatStore.messages.length, () => chatStore.messages.at(-1)?.content], () => {
  nextTick(() => {
    const el = messagesRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
})
</script>

<style scoped>
.messages-scroll::-webkit-scrollbar { width: 5px; }
.messages-scroll::-webkit-scrollbar-track { background: transparent; }
.messages-scroll::-webkit-scrollbar-thumb { background: #222228; border-radius: 4px; }
.messages-scroll::-webkit-scrollbar-thumb:hover { background: #2a2a32; }
</style>