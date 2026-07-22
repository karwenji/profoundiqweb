const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function safeFetch(url: string, options: RequestInit = {}, timeout = 4000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    throw new Error('Network error: unable to reach API server')
  } finally {
    clearTimeout(timer)
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const url = `${API_URL}${path}`

  let res: Response
  try {
    res = await safeFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  } catch (networkErr) {
    throw networkErr instanceof Error ? networkErr : new Error('API request failed')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error.error || error.message || `API error ${res.status}`)
  }

  return res.json()
}

export const apiClient = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`
}
