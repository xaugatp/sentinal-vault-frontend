<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-premium-dark overflow-hidden font-sans">
    <Sidebar
      :grouped-chats="chatStore.groupedChats"
      :active-chat-id="chatStore.activeChatId"
      :user="auth.user"
      :doc-count="docStore.readyDocuments.length"
      @new-chat="chatStore.createChat(); router.push('/chat')"
      @select-chat="id => { chatStore.setActiveChat(id); router.push('/chat') }"
      @delete-chat="id => { chatStore.deleteChat(id) }"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- Background elements -->
      <div class="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>

      <!-- Topbar -->
      <div class="flex items-center gap-3 px-6 h-14 bg-white/50 dark:bg-premium-darker/50 backdrop-blur-md border-b border-zinc-200/50 dark:border-premium-border flex-shrink-0 z-10 relative">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h1 class="text-[15px] font-bold text-zinc-900 dark:text-white tracking-tight">Knowledge Base</h1>
        <div class="ml-auto flex items-center gap-4 text-[12px] text-zinc-500 dark:text-zinc-500 font-medium">
          <span>{{ docStore.documents.length }} files <span class="opacity-50 mx-1">·</span> {{ docStore.formatSize(docStore.totalSize) }}</span>
          <div class="h-4 w-px bg-zinc-200 dark:bg-premium-border mx-1"></div>
          <!-- Theme Toggle -->
          <button
            class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-premium-border text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm dark:shadow-none"
            title="Toggle theme"
            @click="themeStore.toggleTheme()"
          >
            <!-- Sun icon for light mode -->
            <svg v-if="!themeStore.isDark" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <!-- Moon icon for dark mode -->
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 docs-scroll relative z-10 max-w-5xl mx-auto w-full">
        <!-- Drop zone -->
        <div
          class="border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group"
          :class="isDragging
            ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-900/10 scale-[1.02]'
            : 'border-zinc-300 bg-white/50 hover:border-zinc-400 hover:bg-white dark:border-premium-border dark:bg-premium-darker/50 dark:hover:border-zinc-600 dark:hover:bg-premium-card'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <!-- Hover gradient effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center mx-auto mb-4 relative z-10 transition-transform group-hover:scale-110">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
          </div>
          <p class="text-[15px] text-zinc-700 dark:text-zinc-200 font-bold tracking-tight relative z-10">
            Drag & drop your files here or <span class="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">browse</span>
          </p>
          <p class="text-[13px] text-zinc-500 dark:text-zinc-500 mt-2 relative z-10">Supports PDF, DOCX, TXT, CSV, MD — up to 50 MB each</p>
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            multiple
            accept=".pdf,.docx,.txt,.md,.csv,.json"
            @change="handleFileInput"
          />
        </div>

        <!-- Loading skeleton -->
        <template v-if="docStore.isLoading">
          <div v-for="i in 3" :key="i" class="bg-white/80 dark:bg-premium-card border border-zinc-200 dark:border-premium-border rounded-2xl p-4 flex items-center gap-4 animate-pulse shadow-sm">
            <div class="w-12 h-12 bg-zinc-200 dark:bg-premium-darker rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-3">
              <div class="h-3.5 bg-zinc-200 dark:bg-premium-darker rounded w-1/3" />
              <div class="h-2 bg-zinc-100 dark:bg-premium-border rounded w-1/4" />
            </div>
          </div>
        </template>

        <!-- Document list -->
        <TransitionGroup v-else name="doc-list" tag="div" class="flex flex-col gap-3">
          <div
            v-for="doc in docStore.documents"
            :key="doc.id"
            class="group glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5"
          >
            <!-- File icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
              :class="iconClass(doc.name)"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-[14px] text-zinc-900 dark:text-white truncate font-bold tracking-tight">{{ doc.name }}</p>
              <div class="flex items-center gap-2.5 mt-1">
                <p class="text-[12px] font-medium text-zinc-500 dark:text-zinc-500">{{ docStore.formatSize(doc.size) }}</p>
                <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <p class="text-[12px] font-medium text-zinc-500 dark:text-zinc-500">{{ formatDate(doc.uploadedAt) }}</p>
              </div>
              <!-- Progress bar for uploading/processing -->
              <div v-if="doc.status === 'uploading' || doc.status === 'processing'" class="mt-2.5 max-w-sm">
                <div class="h-1.5 bg-zinc-100 dark:bg-premium-darker rounded-full overflow-hidden shadow-inner">
                  <div
                    class="h-full rounded-full transition-all duration-300 relative"
                    :class="doc.status === 'uploading' ? 'bg-blue-500 dark:bg-blue-500' : 'bg-green-500 dark:bg-green-500'"
                    :style="{ width: `${doc.progress ?? 0}%` }"
                  >
                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status badge -->
            <div
              class="text-[11px] font-bold px-3 py-1.5 rounded-full border flex-shrink-0 flex items-center gap-1.5 tracking-wide uppercase"
              :class="statusClass(doc.status)"
            >
              <svg v-if="doc.status === 'uploading' || doc.status === 'processing'" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>
              </svg>
              <svg v-else-if="doc.status === 'ready'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ statusLabel(doc.status) }}
            </div>

            <!-- Delete -->
            <button
              class="w-10 h-10 rounded-xl border border-transparent text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              :disabled="doc.status === 'uploading'"
              title="Delete document"
              @click="confirmDeleteDoc(doc.id, doc.name)"
            >
              <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </TransitionGroup>

        <!-- Empty state -->
        <div v-if="!docStore.isLoading && !docStore.documents.length" class="text-center py-16 animate-fade-in">
          <div class="w-20 h-20 mx-auto rounded-full bg-zinc-100 dark:bg-premium-card flex items-center justify-center mb-6">
            <svg class="w-10 h-10 text-zinc-400 dark:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 class="text-[16px] font-bold text-zinc-900 dark:text-white">Your knowledge base is empty</h3>
          <p class="text-[14px] text-zinc-500 dark:text-zinc-500 mt-2 max-w-sm mx-auto">Upload documents to start building your SentinelVault intelligent assistant.</p>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <ConfirmModal
      v-model="showConfirm"
      title="Delete document?"
      :message="`'${docToDelete?.name}' will be permanently removed from the knowledge base.`"
      confirm-label="Delete"
      @confirm="() => docToDelete && docStore.remove(docToDelete.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/chat/Sidebar.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useDocumentStore } from '@/stores/documentStore'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useThemeStore } from '@/stores/themeStore'
import type { DocumentStatus } from '@/types'

const router = useRouter()
const docStore = useDocumentStore()
const auth = useAuthStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const showConfirm = ref(false)
const docToDelete = ref<{ id: string; name: string } | null>(null)

onMounted(() => docStore.fetchAll())

function handleFileInput(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  files.forEach(f => docStore.upload(f))
  ;(e.target as HTMLInputElement).value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  files.forEach(f => docStore.upload(f))
}

function confirmDeleteDoc(id: string, name: string) {
  docToDelete.value = { id, name }
  showConfirm.value = true
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function formatDate(d: Date | string): string {
  const date = new Date(d)
  const now = new Date()
  const diffH = (now.getTime() - date.getTime()) / 3_600_000
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  if (diffH < 48) return 'Yesterday'
  return date.toLocaleDateString()
}

function statusLabel(s: DocumentStatus): string {
  return { uploading: 'Uploading', processing: 'Indexing', ready: 'Ready', error: 'Error' }[s]
}

function statusClass(s: DocumentStatus): string {
  return {
    uploading:  'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400',
    processing: 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400',
    ready:      'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400',
    error:      'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
  }[s]
}

function iconClass(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400'
  if (ext === 'md')  return 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
  if (ext === 'docx' || ext === 'doc') return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400'
  if (ext === 'csv') return 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400'
  if (ext === 'json') return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400'
  return 'bg-zinc-100 dark:bg-premium-darker border border-zinc-200 dark:border-premium-border text-zinc-600 dark:text-zinc-400'
}
</script>

<style scoped>
.docs-scroll::-webkit-scrollbar { width: 6px; }
.docs-scroll::-webkit-scrollbar-track { background: transparent; }
.docs-scroll::-webkit-scrollbar-thumb { @apply bg-zinc-300 dark:bg-zinc-700 rounded-full border-[1.5px] border-zinc-50 dark:border-premium-dark; }
.docs-scroll::-webkit-scrollbar-thumb:hover { @apply bg-zinc-400 dark:bg-zinc-600; }

.doc-list-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.doc-list-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: absolute; }
.doc-list-enter-from  { opacity: 0; transform: translateY(10px) scale(0.98); }
.doc-list-leave-to    { opacity: 0; transform: scale(0.95); }
.doc-list-move        { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
</style>