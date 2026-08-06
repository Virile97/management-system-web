import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const initialState = {
  members: [],
  meta: { total: 0, totalPages: 1 },
  cache: {}, // id -> member, accumulates every member ever fetched for the search fast-path
  query: null, // { page, status, search } the persisted `members` list was fetched for
}

// Persisted to sessionStorage so the members list (and the search-fast-path
// cache) survives a page reload without an extra fetch, but clears with the
// browser session — reset() is also called explicitly on logout so it never
// leaks into the next signed-in user.
const useMembersStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setMembers: (members, meta, query) => set({ members, meta, query }),
      cacheMembers: (members) =>
        set((state) => {
          const cache = { ...state.cache }
          for (const member of members) cache[member.id] = member
          return { cache }
        }),
      getCachedMembers: () => Object.values(get().cache),
      reset: () => set(initialState),
    }),
    {
      name: "members-list",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export { useMembersStore }
export default useMembersStore
