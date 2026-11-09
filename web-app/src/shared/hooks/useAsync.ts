import { useCallback, useEffect, useRef, useState } from 'react'

import { messageFor } from '@core/errors'
import type { AsyncState } from '../types/api.types'

export interface UseAsyncResult<T> extends AsyncState<T> {
  refetch: () => Promise<void>
  setData: (data: T | null) => void
}

/**
 * Small data-fetching primitive so every module hook behaves the same way.
 * Swap the internals for TanStack Query later without touching call sites.
 */
export const useAsync = <T,>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  options: { immediate?: boolean; initialData?: T } = {},
): UseAsyncResult<T> => {
  const { immediate = true, initialData } = options
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData ?? null,
    isLoading: initialData !== undefined ? false : immediate,
    error: null,
  })
  const mounted = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await fetcherRef.current()
      if (mounted.current) setState({ data, isLoading: false, error: null })
    } catch (error) {
      if (mounted.current) setState({ data: null, isLoading: false, error: messageFor(error) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (immediate) void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((data: T | null) => setState((prev) => ({ ...prev, data })), [])

  return { ...state, refetch: run, setData }
}
