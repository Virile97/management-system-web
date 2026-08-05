import { create } from "zustand"

const useDashboardStore = create((set) => ({
  stats: null,
  memberBreakdown: null,
  financeSummary: [],
  recentActivity: [],
  isLoading: true,
  error: "",

  setStats: (stats) => set({ stats }),
  setMemberBreakdown: (memberBreakdown) => set({ memberBreakdown }),
  setFinanceSummary: (financeSummary) => set({ financeSummary }),
  setRecentActivity: (recentActivity) => set({ recentActivity }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

export { useDashboardStore }
export default useDashboardStore
