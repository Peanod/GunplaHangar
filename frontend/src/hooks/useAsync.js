import { useCallback, useEffect, useRef, useState } from 'react'

// Dasar semua hook data: mengembalikan { data, loading, error, refetch, setData }
export function useAsync(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: null })
  const fnRef = useRef(fn)
  fnRef.current = fn

  const run = useCallback(() => {
    let alive = true
    set((s) => ({ ...s, loading: true, error: null }))
    fnRef
      .current()
      .then((data) => alive && set({ data, loading: false, error: null }))
      .catch((e) => alive && set({ data: null, loading: false, error: e.message }))
    return () => { alive = false }
  }, [])

  useEffect(() => run(), [run, ...deps])

  const setData = (d) => set((s) => ({ ...s, data: typeof d === 'function' ? d(s.data) : d }))
  return { ...state, setData, refetch: run }
}
