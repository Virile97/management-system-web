import { create } from "zustand"

const initialState = {
  stats: null,
  categoryData: [],
  trendData: [],
  isSummaryLoading: true,
  summaryError: "",

  transactions: [],
  meta: { total: 0, totalPages: 1 },
  page: 1,
  activeFilter: "All",
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
  setPage: (page) => set({ page }),
  setActiveFilter: (activeFilter) => set({ activeFilter, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
  setDateTo: (dateTo) => set({ dateTo, page: 1 }),
  clearDateRange: () => set({ dateFrom: "", dateTo: "", page: 1 }),
  setTableLoading: (isTableLoading) => set({ isTableLoading }),
  setTableError: (tableError) => set({ tableError }),

  reset: () => set(initialState),
}))

export { useFinanceStore }
export default useFinanceStore
