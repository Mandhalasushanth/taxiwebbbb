import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { authService } from '../auth/authService'
import { apiEndpoints } from './apiEndpoints'
import { axiosInstance } from './axiosInstance'

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

let refreshInFlight: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = authService.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await axiosInstance.post<RefreshResponse>(
    apiEndpoints.auth.refresh,
    { refreshToken },
    { headers: { 'X-Skip-Auth-Refresh': 'true' } },
  )

  const user = authService.getUser()
  if (user) {
    authService.startSession({ user, tokens: data })
  }
  return data.accessToken
}

export const registerInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    const token = authService.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined
      const status = error.response?.status
      const skipRefresh = config?.headers?.['X-Skip-Auth-Refresh'] === 'true'

      if (status !== 401 || !config || config._retried || skipRefresh) {
        return Promise.reject(error)
      }

      config._retried = true
      try {
        refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null
        })
        const accessToken = await refreshInFlight
        config.headers.Authorization = `Bearer ${accessToken}`
        return instance.request(config)
      } catch (refreshError) {
        authService.endSession('expired')
        return Promise.reject(refreshError)
      }
    },
  )
}
