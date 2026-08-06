import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const initialState = {
  config: null,
}

// Persisted to sessionStorage so the Add Member dropdown config (statuses,
// levels, lighthouse groups, groups) survives a page reload without an extra
// fetch, but clears with the browser session — reset() is also called
// explicitly on logout so it never leaks into the next signed-in user.
const useMemberFormStore = create(
  persist(
    (set) => ({
      ...initialState,

      setConfig: (config) => set({ config }),
      reset: () => set(initialState),
    }),
    {
      name: "member-form-config",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export { useMemberFormStore }
export default useMemberFormStore
