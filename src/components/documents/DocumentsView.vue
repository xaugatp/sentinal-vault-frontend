<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-[#0f0f11] overflow-hidden">
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

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <div class="flex items-center gap-3 px-5 h-11 border-b border-zinc-200 dark:border-[#1a1a22] flex-shrink-0">
        <svg class="w-4 h-4 text-blue-500 dark:text-[#6ea8fe]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <h1 class="text-[14px] font-semibold text-zinc-900 dark:text-zinc-300">Documents</h1>
        <div class="ml-auto flex items-center gap-4 text-[12px] text-zinc-500 dark:text-zinc-700">
          <span>{{ docStore.documents.length }} files · {{ docStore.formatSize(docStore.totalSize) }}</span>
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
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4 docs-scroll">
        <!-- Drop zone -->
        <div
          class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer"
          :class="isDragging
            ? 'border-blue-400 bg-blue-50 dark:border-[#3a5a8a] dark:bg-[#0a1520]'
            : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-[#28282e] dark:hover:border-[#3a3a4a] dark:hover:bg-[#141418]'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#0e1d38] border border-blue-200 dark:border-[#1a2d52] flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-blue-500 dark:text-[#6ea8fe]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
          </div>
          <p class="text-[14px] text-zinc-600 dark:text-zinc-400 font-medium">Drop files here or <span class="text-blue-500 dark:text-[#6ea8fe]">click to upload</span></p>
          <p class="text-[12px] text-zinc-500 dark:text-zinc-700 mt-1">PDF, DOCX, TXT, MD — up to 50 MB each</p>
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
          <div v-for="i in 3" :key="i" class="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-[#1e1e28] rounded-xl p-3.5 flex items-center gap-3 animate-pulse shadow-sm dark:shadow-none">
            <div class="w-10 h-10 bg-zinc-200 dark:bg-[#1e1e28] rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-zinc-200 dark:bg-[#1e1e28] rounded w-2/3" />
              <div class="h-2.5 bg-zinc-100 dark:bg-[#1a1a22] rounded w-1/3" />
            </div>
          </div>
        </template>

        <!-- Document list -->
        <TransitionGroup v-else name="doc-list" tag="div" class="flex flex-col gap-2">
          <div
            v-for="doc in docStore.documents"
            :key="doc.id"
            class="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-[#1e1e28] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-300 dark:hover:border-[#28282e] transition-colors shadow-sm dark:shadow-none"
          >
            <!-- File icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="iconClass(doc.name)"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-[13px] text-zinc-900 dark:text-zinc-300 truncate font-medium">{{ doc.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <p class="text-[11px] text-zinc-500 dark:text-zinc-700">{{ docStore.formatSize(doc.size) }}</p>
                <span class="text-zinc-400 dark:text-zinc-800">·</span>
                <p class="text-[11px] text-zinc-500 dark:text-zinc-700">{{ formatDate(doc.uploadedAt) }}</p>
              </div>
              <!-- Progress bar for uploading/processing -->
              <div v-if="doc.status === 'uploading' || doc.status === 'processing'" class="mt-1.5">
                <div class="h-1 bg-zinc-200 dark:bg-[#1a2a40] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="doc.status === 'uploading' ? 'bg-blue-500 dark:bg-[#4a8be5]' : 'bg-green-500 dark:bg-[#4ade80]'"
                    :style="{ width: `${doc.progress ?? 0}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- Status badge -->
            <div
              class="text-[11px] px-2.5 py-1 rounded-full border flex-shrink-0 flex items-center gap-1.5"
              :class="statusClass(doc.status)"
            >
              <svg v-if="doc.status === 'uploading' || doc.status === 'processing'" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>
              </svg>
              <svg v-else-if="doc.status === 'ready'" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ statusLabel(doc.status) }}
            </div>

            <!-- Delete -->
            <button
              class="w-8 h-8 rounded-lg border border-transparent text-zinc-500 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center flex-shrink-0 transition-all"
              :disabled="doc.status === 'uploading'"
              @click="confirmDeleteDoc(doc.id, doc.name)"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </TransitionGroup>

        <!-- Empty state -->
        <div v-if="!docStore.isLoading && !docStore.documents.length" class="text-center py-12">
          <p class="text-sm text-zinc-600">No documents yet</p>
          <p class="text-xs text-zinc-800 mt-1">Upload a PDF or document to get started</p>
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
  return { uploading: 'Uploading…', processing: 'Indexing…', ready: 'Ready', error: 'Error' }[s]
}

function statusClass(s: DocumentStatus): string {
  return {
    uploading:  'bg-blue-50 dark:bg-[#0e1d38] border-blue-200 dark:border-[#1a2d52] text-blue-700 dark:text-[#6ea8fe]',
    processing: 'bg-green-50 dark:bg-[#0e2a1a] border-green-200 dark:border-[#1a3a28] text-green-700 dark:text-[#86c060]',
    ready:      'bg-green-50 dark:bg-[#0e2a1a] border-green-200 dark:border-[#1a3a28] text-green-700 dark:text-[#4ade80]',
    error:      'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
  }[s]
}

function iconClass(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'bg-blue-50 dark:bg-[#1c3a5e] border border-blue-200 dark:border-[#2a5090] text-blue-600 dark:text-[#6ea8fe]'
  if (ext === 'md')  return 'bg-green-50 dark:bg-[#0e2010] border border-green-200 dark:border-[#1a3020] text-green-700 dark:text-[#86c060]'
  if (ext === 'docx' || ext === 'doc') return 'bg-yellow-50 dark:bg-[#1c1a08] border border-yellow-200 dark:border-[#2c2410] text-yellow-700 dark:text-[#c8a050]'
  return 'bg-zinc-100 dark:bg-[#141420] border border-zinc-200 dark:border-[#22222e] text-zinc-600'
}
</script>

<style scoped>
.docs-scroll::-webkit-scrollbar { width: 5px; }
.docs-scroll::-webkit-scrollbar-track { background: transparent; }
.docs-scroll::-webkit-scrollbar-thumb { background: #222228; border-radius: 4px; }

.doc-list-enter-active { transition: all 0.2s ease; }
.doc-list-leave-active { transition: all 0.15s ease; }
.doc-list-enter-from  { opacity: 0; transform: translateY(-8px); }
.doc-list-leave-to    { opacity: 0; transform: translateX(8px); }
.doc-list-move        { transition: transform 0.2s ease; }
</style>