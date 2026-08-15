import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const initialState = {
  files: [],
  meta: { total: 0, totalPages: 1 },
  // { folderId, type, search, tag, sort, order, page } last fetched for
  listQuery: null,

  folders: [],

  currentFolderId: null,
  breadcrumb: [],

  activeTypeFilter: null,
  searchQuery: "",
  sortBy: "date",
  sortOrder: "desc",
  viewMode: "grid",

  stats: null,
  isStatsLoading: true,
  statsError: "",

  isLoading: true,
  error: "",
}

/**
 * Persisted to sessionStorage so the file browser survives a remount
 * without an extra fetch, matching finance/members. Cleared on logout via
 * reset().
 */
const useFileStorageStore = create(
  persist(
    (set) => ({
      ...initialState,

      setFiles: (files, meta, listQuery) =>
        set({
          files,
          meta,
          listQuery: listQuery ?? null,
          isLoading: false,
          error: "",
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      setFolders: (folders) => set({ folders }),

      setCurrentFolder: (currentFolderId, breadcrumb = []) =>
        set({ currentFolderId, breadcrumb }),
      setTypeFilter: (activeTypeFilter) => set({ activeTypeFilter }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      setViewMode: (viewMode) => set({ viewMode }),

      setStats: (stats) => set({ stats, isStatsLoading: false, statsError: "" }),
      setStatsLoading: (isStatsLoading) => set({ isStatsLoading }),
      setStatsError: (statsError) => set({ statsError }),

      reset: () => set(initialState),
    }),
    {
      name: "file-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        files: state.files,
        meta: state.meta,
        listQuery: state.listQuery,
        folders: state.folders,
        currentFolderId: state.currentFolderId,
        breadcrumb: state.breadcrumb,
        activeTypeFilter: state.activeTypeFilter,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
        stats: state.stats,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.files?.length) state.isLoading = false
        if (state.stats) state.isStatsLoading = false
      },
    }
  )
)

export { useFileStorageStore }
export default useFileStorageStore
