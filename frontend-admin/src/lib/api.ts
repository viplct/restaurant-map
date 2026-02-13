import axios from 'axios'

/**
 * Axios instance configured for JWT + HTTP-only cookie auth.
 *
 * Key points:
 * - `withCredentials: true`  → browser sends the HTTP-only cookie automatically
 * - No Authorization header set manually — cookie is handled by the browser
 * - No token stored in localStorage / sessionStorage (XSS-safe)
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // sends cookies cross-origin
})

// Auto-redirect on 401 (expired / missing cookie)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
