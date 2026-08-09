import { create } from "zustand"

const initialState = {
  stats: null,
  memberBreakdown: null,
  financeSummary: [],
  recentActivity: [],
}

const useDashboardStore = create((set) => ({
  ...initialState,

  setStats: (stats) => set({ stats }),
  setMemberBreakdown: (memberBreakdown) => set({ memberBreakdown }),
  setFinanceSummary: (financeSummary) => set({ financeSummary }),
  setRecentActivity: (recentActivity) => set({ recentActivity }),
  reset: () => set(initialState),
}))

export { useDashboardStore }
export default useDashboardStore
