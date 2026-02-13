import api from './api'
import type { AuthUser } from '@/types'

/**
 * Login — backend sets the JWT in an HTTP-only cookie.
 * We never touch the token; the browser handles it.
 */
export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<{ message: string; user: AuthUser }>('/auth/login', {
    email,
    password,
  })
  return data.user
}

/**
 * Logout — backend invalidates the JWT and clears the cookie via Set-Cookie.
 */
export async function logout(): Promise<void> {
  await api.post('/admin/auth/logout')
}

/**
 * Fetch the currently authenticated user.
 * If the cookie is missing/expired, this throws a 401 → interceptor redirects.
 */
export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/admin/auth/me')
  return data
}

/**
 * Request a new JWT (token rotation).
 * Backend sets a new HTTP-only cookie with refreshed expiry.
 */
export async function refreshToken(): Promise<void> {
  await api.post('/admin/auth/refresh')
}
