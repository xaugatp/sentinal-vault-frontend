// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatarInitials: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: number
  user: AuthUser
}

// ─── Documents ───────────────────────────────────────────────────────────────
export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error'

export interface Document {
  id: string
  name: string
  size: number
  type: string
  status: DocumentStatus
  progress?: number
  uploadedAt: Date
  errorMessage?: string
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export interface Source {
  title: string
  page?: number
  url?: string
  score?: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
  isStreaming?: boolean
  attachedFile?: { name: string; size: number }
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// ─── WebSocket ───────────────────────────────────────────────────────────────
export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WsMessage {
  type: 'chunk' | 'sources' | 'done' | 'error' | 'ping'
  content?: string
  data?: Source[]
  message?: string
}

export interface WsQueryPayload {
  type: 'query'
  text: string
  sessionId: string
  fileId?: string
}

// ─── Toast ───────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}