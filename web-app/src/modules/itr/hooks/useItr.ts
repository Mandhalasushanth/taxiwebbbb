import { useAsync } from '@shared/hooks'
import { itrService } from '../services/itrService'
import type { ItrItem } from '../types/itr.types'

export const useItr = () => useAsync<ItrItem[]>(() => itrService.list(), [])
