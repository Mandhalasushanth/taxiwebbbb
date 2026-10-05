import { env } from '@core/config'
import { userRepository } from '@core/storage'
import type { AuthUser } from '@core/auth'

import { profileApi } from '../api/profileApi'
import type { ProfileFilters, ProfileItem } from '../types/profile.types'

export const profileService = {
  async list(filters?: ProfileFilters): Promise<ProfileItem[]> {
    if (env.enableMocks) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return []
    }
    const response = await profileApi.list(filters)
    return response.data
  },

  async getProfile(mobile?: string): Promise<AuthUser | null> {
    if (mobile) {
      return (userRepository.getProfile(mobile) as AuthUser | null) || null
    }
    const session = userRepository.getSession() as { user: AuthUser } | null
    return session?.user || null
  },

  async saveProfile(profile: Partial<AuthUser> & { mobile: string }): Promise<void> {
    userRepository.saveProfile(profile.mobile, profile)
  },
}
