import api from './api'
import type { Document } from '@/types'

export const documentService = {
  async list(): Promise<Document[]> {
    const { data } = await api.get<Document[]>('/api/documents')
    return data
  },

  async upload(
    file: File,
    onProgress: (percent: number) => void
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<Document>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
    })
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/documents/${id}`)
  },

  async getStatus(id: string): Promise<Pick<Document, 'id' | 'status' | 'progress'>> {
    const { data } = await api.get(`/api/documents/${id}/status`)
    return data
  },

  // Poll a document's status until it becomes ready or errors
  async pollUntilReady(
    id: string,
    onUpdate: (status: Document['status'], progress?: number) => void,
    intervalMs = 2000,
    maxAttempts = 60
  ): Promise<void> {
    let attempts = 0
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        attempts++
        try {
          const { status, progress } = await documentService.getStatus(id)
          onUpdate(status, progress)
          if (status === 'ready' || status === 'error') {
            clearInterval(timer)
            status === 'ready' ? resolve() : reject(new Error('Processing failed'))
          }
          if (attempts >= maxAttempts) {
            clearInterval(timer)
            reject(new Error('Polling timed out'))
          }
        } catch (err) {
          clearInterval(timer)
          reject(err)
        }
      }, intervalMs)
    })
  }
}