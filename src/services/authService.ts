import api from './api'
import type { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse, BackendAuthData, AuthUser } from '@/types'

function mapUser(d: BackendAuthData): AuthUser {
  const name = [d.firstName, d.lastName].filter(Boolean).join(' ') || d.email
  const initials = (
    (d.firstName?.[0] ?? '') + (d.lastName?.[0] ?? '')
  ).toUpperCase() || d.email.substring(0, 2).toUpperCase()
  
  return {
    id: d.userId,
    email: d.email,
    name,
    role: 'user',
    avatarInitials: initials
  }
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<BackendAuthData>>('/api/v1/Auth/register', credentials)
    const d = data.data
    const expiresAt = Math.floor(new Date(d.tokenExpiry).getTime() / 1000)

    return {
      token: d.token,
      expiresAt,
      user: mapUser(d)
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<BackendAuthData>>('/api/v1/Auth/login', {
      email: credentials.email,
      password: credentials.password
    })

    const d = data.data
    const expiresAt = Math.floor(new Date(d.tokenExpiry).getTime() / 1000)

    return {
      token: d.token,
      expiresAt,
      user: mapUser(d)
    }
  },

  async getClaims(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get<ApiResponse<any>>('/api/v1/Auth/claims')
      // Note: Endpoint returns ObjectApiResponse. 
      // If the API returns the user info, we can map it here.
      // If it just returns standard claims, we can return null or map accordingly.
      // Assuming it returns the user object in data:
      if (data.data) {
        // Adapt depending on actual response. If it's the token user ID:
        const claimsUser = { ...data.data, userId: data.data.id || data.data.userId }
        return mapUser(claimsUser)
      }
      return null
    } catch {
      return null
    }
  },

  async logout(): Promise<void> {
    // No logout endpoint on this backend
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('jwt-expires')
    if (!expiresAt) return true
    return Date.now() >= parseInt(expiresAt, 10) * 1000 - 60_000
  }
}
