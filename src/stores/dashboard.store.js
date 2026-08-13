import { create } from "zustand"

const initialState = {
  stats: null,
  memberBreakdown: null,
  financeSummary: [],
  attendanceSummary: [],
  recentActivity: [],
}

const useDashboardStore = create((set) => ({
  ...initialState,

  setOverview: (overview) =>
    set({
      stats: overview?.stats ?? null,
      memberBreakdown: overview?.memberBreakdown ?? null,
      financeSummary: overview?.financeSummary ?? [],
      attendanceSummary: overview?.attendanceSummary ?? [],
      recentActivity: overview?.recentActivity ?? [],
    }),

  reset: () => set(initialState),
}))

export { useDashboardStore }
export default useDashboardStore
