import { create } from "zustand"

const initialState = {
  stats: null,
  categoryData: [],
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
}

const useFinanceStore = create((set) => ({
  ...initialState,

  setStats: (stats) => set({ stats }),
  setCategoryData: (categoryData) => set({ categoryData }),
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

  reset: () => set(initialState),
}))

export { useFinanceStore }
export default useFinanceStore
