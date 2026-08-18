import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const initialState = {
  stats: null,
  offeringTypeData: [],
  trendData: [],
  isSummaryLoading: true,
  summaryError: "",
  // { period, from, to } the persisted summary charts were fetched for
  summaryQuery: null,

  transactions: [],
  meta: { total: 0, totalPages: 1 },
  // { page, type, search, from, to } the persisted table was fetched for
  tableQuery: null,
  search: "",
  dateFrom: "",
  dateTo: "",
  isTableLoading: true,
  tableError: "",

  // Type/category/offering-type options for the Record Transaction form.
  // Fetched once and cached here — `config` stays null until the first
  // successful load, so callers know whether to fetch or reuse it.
  config: null,
  isConfigLoading: false,
  configError: "",
}

/**
 * Persisted to sessionStorage so the finance table (and summary) survive a
 * remount without an extra fetch, matching members/attendance. Cleared on
 * logout via reset().
 */
const useFinanceStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) => set({ stats }),
      setOfferingTypeData: (offeringTypeData) => set({ offeringTypeData }),
      setTrendData: (trendData) => set({ trendData }),
      setSummaryLoading: (isSummaryLoading) => set({ isSummaryLoading }),
      setSummaryError: (summaryError) => set({ summaryError }),
      setSummary: (stats, offeringTypeData, trendData, summaryQuery) =>
        set({
          stats,
          offeringTypeData,
          trendData,
          summaryQuery,
          isSummaryLoading: false,
          summaryError: "",
        }),

      setTransactions: (transactions, meta, tableQuery) =>
        set({
          transactions,
          meta,
          tableQuery: tableQuery ?? null,
          isTableLoading: false,
          tableError: "",
        }),
      removeCachedTransactions: (ids) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => !ids.includes(t.id)),
        })),
      setSearch: (search) => set({ search }),
      setDateFrom: (dateFrom) => set({ dateFrom }),
      setDateTo: (dateTo) => set({ dateTo }),
      clearDateRange: () => set({ dateFrom: "", dateTo: "" }),
      setTableLoading: (isTableLoading) => set({ isTableLoading }),
      setTableError: (tableError) => set({ tableError }),

      setConfig: (config) => set({ config }),
      setConfigLoading: (isConfigLoading) => set({ isConfigLoading }),
      setConfigError: (configError) => set({ configError }),

      reset: () => set(initialState),
    }),
    {
      name: "finance-list",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        stats: state.stats,
        offeringTypeData: state.offeringTypeData,
        trendData: state.trendData,
        summaryQuery: state.summaryQuery,
        transactions: state.transactions,
        meta: state.meta,
        tableQuery: state.tableQuery,
        search: state.search,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        config: state.config,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.transactions?.length) state.isTableLoading = false
        if (state.stats) state.isSummaryLoading = false
      },
    }
  )
)

export { useFinanceStore }
export default useFinanceStore
