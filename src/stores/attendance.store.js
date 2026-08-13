import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const initialState = {
  items: [],
  summary: null,
  levels: [],
  meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
  // { from, to, level, search, page } the persisted list was fetched for
  query: null,
  // id -> attendance row for the active range; powers the search fast-path
  cache: {},
  cacheKey: null,
}

/**
 * Persisted to sessionStorage so the attendance list (and the search
 * fast-path cache) survives a remount without an extra fetch, but clears
 * with the browser session — reset() is also called on logout.
 */
const useAttendanceStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setAttendance: (items, meta, query, { summary, levels } = {}) =>
        set((state) => ({
          items,
          meta,
          query,
          summary: summary ?? state.summary,
          levels: levels ?? state.levels,
        })),

      setSummary: (summary) => set({ summary }),
      setLevels: (levels) => set({ levels }),

      /**
       * Accumulates rows for one from/to window. Switching range wipes the
       * prior cache so search never mixes times from another filter.
       */
      cacheItems: (items, cacheKey) =>
        set((state) => {
          const cache = state.cacheKey === cacheKey ? { ...state.cache } : {}
          for (const item of items) {
            if (item?.id != null) cache[item.id] = item
          }
          return { cache, cacheKey }
        }),

      getCachedItems: (cacheKey) => {
        const state = get()
        if (!cacheKey || state.cacheKey !== cacheKey) return []
        return Object.values(state.cache)
      },

      patchItem: (memberId, patch) =>
        set((state) => {
          const apply = (item) => {
            if (!item || item.id !== memberId) return item
            const nextPatch = typeof patch === "function" ? patch(item) : patch
            return { ...item, ...nextPatch }
          }

          const nextItems = state.items.map(apply)
          const cache = { ...state.cache }
          if (cache[memberId]) cache[memberId] = apply(cache[memberId])
          return { items: nextItems, cache }
        }),

      reset: () => set(initialState),
    }),
    {
      name: "attendance-list",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export { useAttendanceStore }
export default useAttendanceStore
