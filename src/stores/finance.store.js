import { create } from "zustand"

const initialState = {
  stats: null,
  offeringTypeData: [],
  trendData: [],
  isSummaryLoading: true,
  summaryError: "",

  transactions: [],
  meta: { total: 0, totalPages: 1 },
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

const useFinanceStore = create((set) => ({
  ...initialState,

  setStats: (stats) => set({ stats }),
  setOfferingTypeData: (offeringTypeData) => set({ offeringTypeData }),
  setTrendData: (trendData) => set({ trendData }),
  setSummaryLoading: (isSummaryLoading) => set({ isSummaryLoading }),
  setSummaryError: (summaryError) => set({ summaryError }),

  setTransactions: (transactions, meta) => set({ transactions, meta }),
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
}))

export { useFinanceStore }
export default useFinanceStore
