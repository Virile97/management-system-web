import { create } from "zustand"

const initialState = {
  stats: null,
  memberBreakdown: null,
  financeSummary: [],
  attendanceSummary: [],
  recentActivity: [],
  soulWinningMonthly: [],
  soulWinningYear: new Date().getFullYear(),
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

  setSoulWinningTrends: (trends) =>
    set({
      soulWinningMonthly: trends?.monthly ?? [],
      soulWinningYear: Number(trends?.year) || new Date().getFullYear(),
    }),

  reset: () => set(initialState),
}))

export { useDashboardStore }
export default useDashboardStore
