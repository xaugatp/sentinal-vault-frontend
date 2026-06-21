import api from './api'
import type { ApiResponse } from '@/types'

export const chatService = {
  async query(text: string): Promise<string> {
    const { data } = await api.post<ApiResponse<unknown>>('/api/v1/Chat/query', { query: text })

    const result = data.data
    if (typeof result === 'string') return result
    if (result && typeof result === 'object') {
      const obj = result as Record<string, unknown>
      const answer = obj.answer ?? obj.response ?? obj.content ?? obj.message ?? obj.text
      if (answer != null) return String(answer)
      return JSON.stringify(result)
    }
    return data.message ?? 'No response received.'
  }
}
