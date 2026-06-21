import { ref, onUnmounted } from 'vue'
import type { WsStatus, WsMessage, WsQueryPayload } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sentinelvault.onrender.com'
const WS_URL = BASE_URL.replace(/^http/, 'ws')

export function useWebSocket() {
  const status = ref<WsStatus>('disconnected')
  const ws = ref<WebSocket | null>(null)

  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT = 5
  const HEARTBEAT_INTERVAL = 25_000

  let onMessageCallback: ((msg: WsMessage) => void) | null = null
  let onConnectCallback: (() => void) | null = null

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const token = localStorage.getItem('jwt')
    if (!token) return

    status.value = 'connecting'

    try {
      ws.value = new WebSocket(`${WS_URL}/ws/chat?token=${token}`)
    } catch {
      status.value = 'error'
      scheduleReconnect()
      return
    }

    ws.value.onopen = () => {
      status.value = 'connected'
      reconnectAttempts = 0
      startHeartbeat()
      onConnectCallback?.()
    }

    ws.value.onmessage = event => {
      try {
        const msg: WsMessage = JSON.parse(event.data)
        if (msg.type !== 'ping') onMessageCallback?.(msg)
      } catch {
        // ignore malformed frames
      }
    }

    ws.value.onclose = event => {
      status.value = 'disconnected'
      stopHeartbeat()
      if (!event.wasClean) scheduleReconnect()
    }

    ws.value.onerror = () => {
      status.value = 'error'
      stopHeartbeat()
    }
  }

  function disconnect() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    stopHeartbeat()
    ws.value?.close(1000, 'User disconnected')
    ws.value = null
    status.value = 'disconnected'
  }

  function sendQuery(payload: WsQueryPayload): boolean {
    if (ws.value?.readyState !== WebSocket.OPEN) return false
    ws.value.send(JSON.stringify(payload))
    return true
  }

  function onMessage(callback: (msg: WsMessage) => void) {
    onMessageCallback = callback
  }

  function onConnect(callback: () => void) {
    onConnectCallback = callback
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT) return
    reconnectAttempts++
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30_000)
    reconnectTimer = setTimeout(connect, delay)
  }

  function startHeartbeat() {
    heartbeatTimer = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  function stopHeartbeat() {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
  }

  onUnmounted(() => disconnect())

  return { status, connect, disconnect, sendQuery, onMessage, onConnect }
}