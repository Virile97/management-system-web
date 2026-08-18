import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const MAX_ADDRESSES = 500

const initialState = {
  addresses: [],
}

/**
 * Persisted to localStorage (unlike the other stores' sessionStorage) since
 * this is long-lived reference data meant to keep accumulating across
 * sessions, not a per-session cache to discard on logout.
 */
const useAddressBookStore = create(
  persist(
    (set) => ({
      ...initialState,

      addAddress: (address) => {
        const trimmed = address?.trim()
        if (!trimmed) return

        set((state) => {
          const withoutDuplicate = state.addresses.filter(
            (existing) => existing.toLowerCase() !== trimmed.toLowerCase()
          )
          return {
            addresses: [trimmed, ...withoutDuplicate].slice(0, MAX_ADDRESSES),
          }
        })
      },
    }),
    {
      name: "address-book",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export { useAddressBookStore }
export default useAddressBookStore
