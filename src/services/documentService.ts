import api from './api'
import type { Document, DocumentStatus, ApiResponse, BackendDocumentData, BackendUploadData } from '@/types'

function mapStatus(raw: string | null | undefined): DocumentStatus {
  const s = (raw ?? '').toLowerCase()
  if (s === 'completed' || s === 'ready') return 'ready'
  if (s === 'processing' || s === 'indexing') return 'processing'
  if (s === 'failed' || s === 'error') return 'error'
  return 'processing'
}

function mapDocument(d: BackendDocumentData): Document {
  return {
    id: d.id,
    name: d.fileName ?? '',
    size: 0,
    type: '',
    status: mapStatus(d.status),
    uploadedAt: new Date(d.uploadedAt)
  }
}

export const documentService = {
  async list(): Promise<Document[]> {
    const { data } = await api.get<ApiResponse<BackendDocumentData[]>>('/api/v1/Documents')
    return (data.data ?? []).map(mapDocument)
  },

  async upload(
    file: File,
    onProgress: (percent: number) => void
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<ApiResponse<BackendUploadData>>(
      '/api/v1/Documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => {
          if (event.total) onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
    )

    const d = data.data
    return {
      id: d.documentId,
      name: d.fileName ?? file.name,
      size: d.fileSize ?? file.size,
      type: file.type,
      status: mapStatus(d.status),
      uploadedAt: new Date(d.uploadedAt)
    }
  },

  async getById(id: string): Promise<Document> {
    const { data } = await api.get<ApiResponse<BackendDocumentData>>(`/api/v1/Documents/${id}`)
    return mapDocument(data.data)
  },

  // No delete endpoint on the backend — removed from API calls
  async delete(_id: string): Promise<void> {
    // intentional no-op: backend has no delete endpoint
  },

  async getStatus(id: string): Promise<Pick<Document, 'id' | 'status' | 'progress'>> {
    const doc = await documentService.getById(id)
    return { id: doc.id, status: doc.status, progress: doc.progress }
  },

  async updateStatus(id: string, status: number): Promise<void> {
    await api.put(`/api/v1/Documents/${id}/status`, { status })
  },

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
            return
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
