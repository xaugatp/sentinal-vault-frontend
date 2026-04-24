import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document } from '@/types'
import { documentService } from '@/services/documentService'
import { useToast } from '@/composables/useToast'

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const isLoading = ref(false)

  const toast = useToast()

  const readyDocuments = computed(() => documents.value.filter(d => d.status === 'ready'))
  const totalSize = computed(() => documents.value.reduce((acc, d) => acc + d.size, 0))

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    try {
      documents.value = await documentService.list()
    } catch {
      toast.error('Failed to load documents')
    } finally {
      isLoading.value = false
    }
  }

  async function upload(file: File): Promise<void> {
    // Optimistic local entry
    const localId = crypto.randomUUID()
    const localDoc: Document = {
      id: localId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date()
    }
    documents.value.unshift(localDoc)

    try {
      const uploaded = await documentService.upload(file, percent => {
        const doc = documents.value.find(d => d.id === localId)
        if (doc) doc.progress = percent
      })

      // Replace local entry with server response
      const idx = documents.value.findIndex(d => d.id === localId)
      if (idx !== -1) documents.value[idx] = { ...uploaded, status: 'processing', progress: 0 }

      toast.info('Indexing document…', file.name)

      // Poll until ready
      await documentService.pollUntilReady(
        uploaded.id,
        (status, progress) => {
          const doc = documents.value.find(d => d.id === uploaded.id)
          if (doc) { doc.status = status; doc.progress = progress }
        }
      )

      const doc = documents.value.find(d => d.id === uploaded.id)
      if (doc) { doc.status = 'ready'; doc.progress = undefined }
      toast.success('Document ready', file.name)
    } catch (err) {
      const doc = documents.value.find(d => d.id === localId)
      if (doc) {
        doc.status = 'error'
        doc.errorMessage = err instanceof Error ? err.message : 'Upload failed'
      }
      toast.error('Upload failed', file.name)
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await documentService.delete(id)
      documents.value = documents.value.filter(d => d.id !== id)
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  }

  return { documents, isLoading, readyDocuments, totalSize, fetchAll, upload, remove, formatSize }
})