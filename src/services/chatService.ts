import api from './api'
import type { Chat, Source } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const chatService = {
  async getHistory(): Promise<Chat[]> {
    const { data } = await api.get<Chat[]>('/api/chat/history')
    return data
  },

  async getChat(id: string): Promise<Chat> {
    const { data } = await api.get<Chat>(`/api/chat/${id}`)
    return data
  },

  async deleteChat(id: string): Promise<void> {
    await api.delete(`/api/chat/${id}`)
  },

  // SSE fallback: used when WebSocket is unavailable
  async streamFallback(
    payload: { query: string; sessionId: string; fileId?: string },
    onChunk: (chunk: string) => void,
    onSources: (sources: Source[]) => void,
    onDone: () => void,
    onError: (err: string) => void
  ): Promise<void> {
    const token = localStorage.getItem('jwt') ?? ''
    const response = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      onError(`HTTP ${response.status}`)
      return
    }
    if (!response.body) {
      onError('No response body')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) { onDone(); break }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') { onDone(); return }
        try {
          const msg = JSON.parse(raw)
          if (msg.type === 'chunk' && msg.content) onChunk(msg.content)
          if (msg.type === 'sources' && msg.data) onSources(msg.data)
          if (msg.type === 'done') { onDone(); return }
          if (msg.type === 'error') { onError(msg.message ?? 'Unknown error'); return }
        } catch {
          if (raw) onChunk(raw)
        }
      }
    }
  }
}