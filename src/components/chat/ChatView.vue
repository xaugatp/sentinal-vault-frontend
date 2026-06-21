<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-premium-dark overflow-hidden font-sans">
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

    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- Topbar -->
      <div class="flex items-center justify-between px-6 h-14 bg-white/50 dark:bg-premium-darker/50 backdrop-blur-md border-b border-zinc-200/50 dark:border-premium-border z-10">
        <div class="flex items-center gap-3 text-[14px] font-medium text-zinc-700 dark:text-zinc-200">
          <div class="relative flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <div class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>
          <span class="truncate max-w-sm">{{ chatStore.activeChat?.title ?? 'New conversation' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- API status badge -->
          <div class="flex items-center gap-2 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-green-200/50 text-green-700 bg-green-50/50 dark:border-green-900/30 dark:text-green-400 dark:bg-green-900/10">
            API Connected
          </div>
          <div class="h-4 w-px bg-zinc-200 dark:bg-premium-border mx-1"></div>
          <!-- Theme Toggle -->
          <button
            class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-premium-border text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm dark:shadow-none"
            title="Toggle theme"
            @click="themeStore.toggleTheme()"
          >
            <svg v-if="!themeStore.isDark" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <!-- Clear -->
          <button
            class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-premium-border text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm dark:shadow-none"
            title="Clear chat"
            @click="chatStore.clearActiveChat()"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesRef"
        class="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 messages-scroll relative"
      >
        <!-- Background elements for chat -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none" />

        <!-- Empty state -->
        <div v-if="!chatStore.messages.length" class="flex flex-col items-center justify-center h-full gap-6 text-center animate-fade-in relative z-10">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-xl shadow-blue-500/20 flex items-center justify-center text-white">
            <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">How can I assist you?</h2>
            <p class="text-[15px] text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">Interact with your document knowledge base. Upload files or ask a question directly.</p>
          </div>
          <div class="flex flex-wrap gap-3 justify-center mt-4 max-w-2xl">
            <button
              v-for="s in suggestions"
              :key="s"
              class="text-[13px] font-medium px-4 py-2.5 rounded-full border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5"
              @click="sendMessage(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Message list -->
        <div class="relative z-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <MessageBubble
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :message="msg"
            :user-initials="auth.user?.avatarInitials ?? 'U'"
          />
        </div>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/themeStore'
import { chatService } from '@/services/chatService'

const router = useRouter()
const chatStore = useChatStore()
const auth = useAuthStore()
const docStore = useDocumentStore()
const toast = useToast()
const themeStore = useThemeStore()

const messagesRef = ref<HTMLElement | null>(null)
const pendingFile = ref<File | null>(null)
const confirmDelete = ref(false)
const chatToDelete = ref<string | null>(null)
const aborted = ref(false)

const pendingFileMeta = computed(() =>
  pendingFile.value ? { name: pendingFile.value.name, size: pendingFile.value.size } : null
)

const suggestions = [
  'How does the cache hit flow work?',
  'Explain the RAG retrieval pipeline',
  'What does the Hybrid Retriever do?',
  'How are documents ingested?'
]

onMounted(() => {
  chatStore.init()
  docStore.fetchAll()
})

// ── Send message ──────────────────────────────────────────────────────────────
async function sendMessage(text: string) {
  if (!text.trim()) return
  if (!chatStore.activeChatId) chatStore.createChat()

  const fileAttach = pendingFile.value
    ? { name: pendingFile.value.name, size: pendingFile.value.size }
    : undefined

  chatStore.addUserMessage(text, fileAttach)
  chatStore.startAssistantMessage()
  aborted.value = false
  clearFile()

  try {
    const answer = await chatService.query(text)
    if (!aborted.value) {
      chatStore.appendChunk(answer)
      chatStore.finishStreaming()
    }
  } catch (err: unknown) {
    if (!aborted.value) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      chatStore.finishStreaming(undefined, `Error: ${msg}`)
      toast.error('Query failed', msg)
    }
  }
}

function stopStreaming() {
  aborted.value = true
  chatStore.finishStreaming()
}

// ── File handling ─────────────────────────────────────────────────────────────
function handleFileSelected(file: File) {
  pendingFile.value = file
}

function clearFile() {
  pendingFile.value = null
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
.messages-scroll::-webkit-scrollbar { width: 6px; }
.messages-scroll::-webkit-scrollbar-track { background: transparent; }
.messages-scroll::-webkit-scrollbar-thumb { @apply bg-zinc-300 dark:bg-zinc-700 rounded-full border-[1.5px] border-zinc-50 dark:border-premium-dark; }
.messages-scroll::-webkit-scrollbar-thumb:hover { @apply bg-zinc-400 dark:bg-zinc-600; }
</style>
