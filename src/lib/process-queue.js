import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

/**
 * Generic background process queue.
 *
 * Domain code only needs to:
 * 1. registerHandler(type, async (payload) => ...)
 * 2. enqueue({ type, payload, display })
 *
 * Status, retries, persistence, and draining stay here — not in feature UIs.
 */

const PROCESS_STATUS = {
  queued: "queued",
  running: "running",
  succeeded: "succeeded",
  failed: "failed",
}

const ACTIVE = new Set([PROCESS_STATUS.queued, PROCESS_STATUS.running])

const UNFINISHED = new Set([
  PROCESS_STATUS.queued,
  PROCESS_STATUS.running,
  PROCESS_STATUS.failed,
])

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @param {object} options
 * @param {string} options.name sessionStorage key
 * @param {number} [options.concurrency=1] max in-flight jobs
 * @param {number} [options.successTtlMs=3500] auto-dismiss after success
 * @param {Record<string, Function>} [options.handlers] type -> async (payload, job)
 */
function createProcessQueue({
  name,
  concurrency = 1,
  successTtlMs = 3500,
  handlers: initialHandlers = {},
} = {}) {
  if (!name) throw new Error("createProcessQueue requires a storage name")

  const handlers = new Map(Object.entries(initialHandlers))
  const removeTimers = new Map()
  let activeCount = 0
  let storeApi

  function clearRemoveTimer(id) {
    const timer = removeTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      removeTimers.delete(id)
    }
  }

  function scheduleRemove(id) {
    clearRemoveTimer(id)
    if (successTtlMs <= 0) return
    const timer = setTimeout(() => {
      storeApi.getState().remove(id)
      removeTimers.delete(id)
    }, successTtlMs)
    removeTimers.set(id, timer)
  }

  async function execute(job) {
    const handler = handlers.get(job.type)
    if (!handler) {
      activeCount = Math.max(0, activeCount - 1)
      storeApi
        .getState()
        .fail(job.id, `No handler registered for "${job.type}"`)
      drain()
      return
    }

    try {
      await handler(job.payload, job)
      storeApi.getState().succeed(job.id)
      scheduleRemove(job.id)
    } catch (err) {
      storeApi.getState().fail(job.id, err?.message || "Process failed")
    } finally {
      activeCount = Math.max(0, activeCount - 1)
      drain()
    }
  }

  function drain() {
    const available = concurrency - activeCount
    if (available <= 0) return

    const nextJobs = storeApi
      .getState()
      .items.filter((item) => item.status === PROCESS_STATUS.queued)
      .slice(0, available)

    for (const job of nextJobs) {
      // Claim before await so concurrent drain passes cannot pick the same job.
      storeApi.getState().start(job.id)
      activeCount += 1
      execute(job)
    }
  }

  const useStore = create(
    persist(
      (set, get) => ({
        items: [],
        isExpanded: true,
        completedTick: 0,
        lastCompleted: null,

        registerHandler(type, handler) {
          if (!type || typeof handler !== "function") return
          handlers.set(type, handler)
        },

        /**
         * @param {object} input
         * @param {string} input.type handler key, e.g. "finance.createTransaction"
         * @param {unknown} input.payload data passed to the handler
         * @param {object} [input.display] UI-only fields for the process panel
         */
        enqueue({ type, payload, display } = {}) {
          if (!type) throw new Error("enqueue requires a process type")

          const job = {
            id: createId("process"),
            type,
            payload,
            display: {
              title: display?.title || type,
              subtitle: display?.subtitle || "",
              value: display?.value || "",
              tone: display?.tone || "default",
            },
            status: PROCESS_STATUS.queued,
            error: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          set((state) => ({
            items: [job, ...state.items],
            isExpanded: true,
          }))

          drain()
          return job.id
        },

        retry(id) {
          clearRemoveTimer(id)
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: PROCESS_STATUS.queued,
                    error: "",
                    updatedAt: Date.now(),
                  }
                : item
            ),
            isExpanded: true,
          }))
          drain()
        },

        remove(id) {
          clearRemoveTimer(id)
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }))
        },

        start(id) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: PROCESS_STATUS.running,
                    error: "",
                    updatedAt: Date.now(),
                  }
                : item
            ),
          }))
        },

        succeed(id) {
          const job = get().items.find((item) => item.id === id)
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: PROCESS_STATUS.succeeded,
                    error: "",
                    updatedAt: Date.now(),
                  }
                : item
            ),
            completedTick: state.completedTick + 1,
            lastCompleted: job
              ? { id: job.id, type: job.type, at: Date.now() }
              : state.lastCompleted,
          }))
        },

        fail(id, error) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: PROCESS_STATUS.failed,
                    error: error || "Process failed",
                    updatedAt: Date.now(),
                  }
                : item
            ),
            isExpanded: true,
          }))
        },

        setExpanded(isExpanded) {
          set({ isExpanded })
        },

        /** Queued or currently running — block reload for these. */
        hasActive() {
          return get().items.some((item) => ACTIVE.has(item.status))
        },

        activeCount() {
          return get().items.filter((item) => ACTIVE.has(item.status)).length
        },

        /** Active + failed — used for logout warnings / badge counts. */
        hasUnfinished() {
          return get().items.some((item) => UNFINISHED.has(item.status))
        },

        unfinishedCount() {
          return get().items.filter((item) => UNFINISHED.has(item.status))
            .length
        },

        resume() {
          if (
            get().items.some((item) => item.status === PROCESS_STATUS.running)
          ) {
            set((state) => ({
              items: state.items.map((item) =>
                item.status === PROCESS_STATUS.running
                  ? {
                      ...item,
                      status: PROCESS_STATUS.queued,
                      updatedAt: Date.now(),
                    }
                  : item
              ),
            }))
          }

          activeCount = 0
          if (
            get().items.some((item) => item.status === PROCESS_STATUS.queued)
          ) {
            drain()
          }
        },

        reset() {
          for (const id of removeTimers.keys()) clearRemoveTimer(id)
          activeCount = 0
          set({
            items: [],
            isExpanded: true,
            completedTick: 0,
            lastCompleted: null,
          })
        },
      }),
      {
        name,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          items: state.items.filter(
            (item) => item.status !== PROCESS_STATUS.succeeded
          ),
          isExpanded: state.isExpanded,
        }),
        onRehydrateStorage: () => (state) => {
          state?.resume?.()
        },
      }
    )
  )

  storeApi = useStore
  return useStore
}

export { createProcessQueue, PROCESS_STATUS }
export default createProcessQueue
