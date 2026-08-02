import { useAuthStore } from '@/store/authStore'
import type { ApiErrorBody, ApiListResult } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? window.__DEIMOS_API_BASE__ ?? '/api'

export class ApiClientError extends Error {
  code: string
  details?: Record<string, unknown>
  status?: number
  isNetwork?: boolean

  constructor(message: string, opts: { code: string; details?: Record<string, unknown>; status?: number; isNetwork?: boolean }) {
    super(message)
    this.name = 'ApiClientError'
    this.code = opts.code
    this.details = opts.details
    this.status = opts.status
    this.isNetwork = opts.isNetwork
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = `${API_BASE}${path}`
  if (!params) return url
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (clean.length === 0) return url
  const search = new URLSearchParams(clean.map(([k, v]) => [k, String(v)]))
  return `${url}?${search.toString()}`
}

async function requestRaw(path: string, options: RequestOptions = {}): Promise<unknown> {
  const { body, params, headers, ...rest } = options
  const token = useAuthStore.getState().token

  const finalHeaders = new Headers(headers)
  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData) {
    finalHeaders.set('Content-Type', 'application/json')
  }
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    })
  } catch {
    throw new ApiClientError('Cannot reach the API server. Check your connection and try again.', {
      code: 'NETWORK_ERROR',
      isNetwork: true,
    })
  }

  if (response.status === 204) {
    return null
  }

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    const errBody = (payload as { error?: ApiErrorBody } | null)?.error
    throw new ApiClientError(errBody?.message ?? 'Something went wrong.', {
      code: errBody?.code ?? 'UNKNOWN',
      details: errBody?.details,
      status: response.status,
    })
  }

  return payload
}

/** Unwraps `{ data }` — for single-resource endpoints. */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const payload = await requestRaw(path, options)
  return (payload as { data: T } | null)?.data ?? (payload as T)
}

/** Keeps `{ data, meta }` intact — for paginated list endpoints. */
async function requestList<T>(path: string, options: RequestOptions = {}): Promise<ApiListResult<T>> {
  const payload = await requestRaw(path, options)
  return payload as ApiListResult<T>
}

export const api = {
  get: <T>(path: string, params?: RequestOptions['params']) => request<T>(path, { method: 'GET', params }),
  getList: <T>(path: string, params?: RequestOptions['params']) => requestList<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  buildUrl,
  base: API_BASE,
}
