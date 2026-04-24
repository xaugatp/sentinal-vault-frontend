import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chat, Message, Source } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([])
  const activeChatId = ref<string | null>(null)
  const isStreaming = ref(false)
  const streamingMessageId = ref<string | null>(null)

  const activeChat = computed(() =>
    chats.value.find(c => c.id === activeChatId.value) ?? null
  )
  const messages = computed(() => activeChat.value?.messages ?? [])

  // ── Grouped chat history by date ──────────────────────────────────────────
  const groupedChats = computed(() => {
    const groups: Record<string, Chat[]> = { Today: [], Yesterday: [], 'Last 7 days': [], Older: [] }
    const now = new Date()
    for (const chat of [...chats.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )) {
      const d = new Date(chat.updatedAt)
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
      if (diffDays < 1) groups['Today'].push(chat)
      else if (diffDays < 2) groups['Yesterday'].push(chat)
      else if (diffDays < 7) groups['Last 7 days'].push(chat)
      else groups['Older'].push(chat)
    }
    return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length))
  })

  // ── Chat management ───────────────────────────────────────────────────────
  function createChat(): Chat {
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    chats.value.unshift(chat)
    activeChatId.value = chat.id
    return chat
  }

  function setActiveChat(id: string) {
    activeChatId.value = id
  }

  function deleteChat(id: string) {
    chats.value = chats.value.filter(c => c.id !== id)
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id ?? null
    }
  }

  function clearActiveChat() {
    if (activeChat.value) activeChat.value.messages = []
  }

  // ── Message management ────────────────────────────────────────────────────
  function addUserMessage(text: string, fileAttachment?: { name: string; size: number }): string {
    if (!activeChatId.value) createChat()
    const chat = activeChat.value!
    const msg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachedFile: fileAttachment
    }
    chat.messages.push(msg)
    if (chat.messages.filter(m => m.role === 'user').length === 1) {
      chat.title = text.slice(0, 50) + (text.length > 50 ? '…' : '')
    }
    chat.updatedAt = new Date()
    return msg.id
  }

  function startAssistantMessage(): string {
    const chat = activeChat.value!
    const msg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    chat.messages.push(msg)
    streamingMessageId.value = msg.id
    isStreaming.value = true
    return msg.id
  }

  function appendChunk(chunk: string) {
    const chat = activeChat.value
    if (!chat || !streamingMessageId.value) return
    const msg = chat.messages.find(m => m.id === streamingMessageId.value)
    if (msg) msg.content += chunk
  }

  function finishStreaming(sources?: Source[], errorText?: string) {
    const chat = activeChat.value
    if (!chat || !streamingMessageId.value) return
    const msg = chat.messages.find(m => m.id === streamingMessageId.value)
    if (msg) {
      msg.isStreaming = false
      if (sources?.length) msg.sources = sources
      if (errorText) msg.content = errorText
    }
    isStreaming.value = false
    streamingMessageId.value = null
    chat.updatedAt = new Date()
  }

  function init() {
    if (chats.value.length === 0) {
      const chat = createChat()
      chat.title = 'Welcome'
      chat.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant with access to your knowledge base. Ask me anything, or upload a document to add it as context.',
        timestamp: new Date()
      })
    }
  }

  return {
    chats,
    activeChatId,
    activeChat,
    messages,
    groupedChats,
    isStreaming,
    streamingMessageId,
    createChat,
    setActiveChat,
    deleteChat,
    clearActiveChat,
    addUserMessage,
    startAssistantMessage,
    appendChunk,
    finishStreaming,
    init
  }
})