import { createProcessQueue, PROCESS_STATUS } from "@/lib/process-queue"
import {
  createTransaction,
  deleteTransaction,
  formatDeleteError,
} from "@/services/finance.service"
import {
  bulkDeleteMembers,
  createMember,
  updateMember,
} from "@/services/member.service"
import {
  createSoulWinningRecord,
  updateSoulWinningRecord,
} from "@/services/soulWinning.service"

/** Shared app-wide background process queue. */
const PROCESS_TYPES = {
  FINANCE_CREATE_TRANSACTION: "finance.createTransaction",
  FINANCE_DELETE_TRANSACTION: "finance.deleteTransaction",
  MEMBERS_CREATE_MEMBER: "members.createMember",
  MEMBERS_UPDATE_MEMBER: "members.updateMember",
  MEMBERS_DELETE_MEMBER: "members.deleteMember",
  SOUL_WINNING_CREATE_RECORD: "soulWinning.createRecord",
  SOUL_WINNING_UPDATE_RECORD: "soulWinning.updateRecord",
}

const useProcessQueueStore = createProcessQueue({
  name: "process-queue",
  concurrency: 1,
  successTtlMs: 3500,
  handlers: {
    [PROCESS_TYPES.FINANCE_CREATE_TRANSACTION]: (payload) =>
      createTransaction(payload),
    [PROCESS_TYPES.FINANCE_DELETE_TRANSACTION]: async ({ id }) => {
      try {
        await deleteTransaction(id)
      } catch (err) {
        // Already gone — treat as success so the queue moves on.
        if (err?.status !== 404 && err?.code !== "NOT_FOUND") {
          throw new Error(formatDeleteError(err))
        }
      }
    },
    [PROCESS_TYPES.MEMBERS_CREATE_MEMBER]: (payload) => createMember(payload),
    [PROCESS_TYPES.MEMBERS_UPDATE_MEMBER]: ({ id, form }) =>
      updateMember(id, form),
    [PROCESS_TYPES.MEMBERS_DELETE_MEMBER]: async ({ id }) => {
      const result = await bulkDeleteMembers([id])
      const blocked = result?.blocked || []

      if (blocked.length > 0) {
        const name = blocked[0]?.name || "Member"
        throw new Error(
          `Could not delete ${name} — member has dependent records`
        )
      }

      return result
    },
    [PROCESS_TYPES.SOUL_WINNING_CREATE_RECORD]: (payload) =>
      createSoulWinningRecord(payload),
    [PROCESS_TYPES.SOUL_WINNING_UPDATE_RECORD]: ({ id, payload }) =>
      updateSoulWinningRecord(id, payload),
  },
})

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

/**
 * High-level helper for recording transactions without blocking the form.
 * UI modules should call this instead of talking to the queue internals.
 */
function enqueueCreateTransaction({
  payload,
  type = "income",
  label,
  amount = 0,
  date = "",
}) {
  return useProcessQueueStore.getState().enqueue({
    type: PROCESS_TYPES.FINANCE_CREATE_TRANSACTION,
    payload,
    display: {
      title: label || (type === "expense" ? "Expense" : "Income"),
      subtitle: [type === "expense" ? "Expense" : "Income", date]
        .filter(Boolean)
        .join(" · "),
      value: `${type === "expense" ? "−" : "+"}${currencyFormatter.format(amount)}`,
      tone: type === "expense" ? "negative" : "positive",
    },
  })
}

/**
 * High-level helper for adding members without blocking the form.
 */
function enqueueCreateMember({ form, label }) {
  const name =
    label ||
    [form?.firstName, form?.middleName, form?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    form?.email ||
    "New member"

  return useProcessQueueStore.getState().enqueue({
    type: PROCESS_TYPES.MEMBERS_CREATE_MEMBER,
    payload: form,
    display: {
      title: name,
      subtitle: form?.email || "New member",
      tone: "positive",
    },
  })
}

/**
 * High-level helper for editing members without blocking the modal — the
 * modal closes immediately on save and the update drains through the queue,
 * same flow as enqueueCreateMember.
 */
function enqueueUpdateMember({ id, form, label }) {
  const name =
    label ||
    [form?.firstName, form?.middleName, form?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    form?.email ||
    "Member"

  return useProcessQueueStore.getState().enqueue({
    type: PROCESS_TYPES.MEMBERS_UPDATE_MEMBER,
    payload: { id, form },
    display: {
      title: name,
      subtitle: "Update member",
      tone: "positive",
    },
  })
}

/**
 * High-level helper for deleting transactions without blocking the table.
 * One queue job per transaction so large selections drain sequentially,
 * failures can be retried individually, and the UI stays responsive.
 */
function enqueueDeleteTransactions({ transactions }) {
  return (transactions || []).map((transaction) => {
    const amount = Math.abs(Number(transaction.amount) || 0)
    const sign = Number(transaction.amount) > 0 ? "+" : "−"

    return useProcessQueueStore.getState().enqueue({
      type: PROCESS_TYPES.FINANCE_DELETE_TRANSACTION,
      payload: { id: transaction.id },
      display: {
        title: transaction.description || "Transaction",
        subtitle:
          [transaction.type, transaction.category].filter(Boolean).join(" · ") ||
          "Delete transaction",
        value: `${sign}${currencyFormatter.format(amount)}`,
        tone: "negative",
      },
    })
  })
}

/**
 * High-level helper for deleting members without blocking the table.
 * One queue job per member so large selections drain sequentially,
 * failures can be retried individually, and the UI stays responsive.
 */
function enqueueDeleteMembers({ members }) {
  return (members || []).map((member) => {
    const name =
      member?.name ||
      [member?.firstName, member?.middleName, member?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Member"

    return useProcessQueueStore.getState().enqueue({
      type: PROCESS_TYPES.MEMBERS_DELETE_MEMBER,
      payload: { id: member.id },
      display: {
        title: name,
        subtitle: "Delete member",
        tone: "negative",
      },
    })
  })
}

/**
 * High-level helper for recording a soul won without blocking the form.
 */
function enqueueCreateSoulWinningRecord({ payload, label, winnersLabel }) {
  const name =
    label ||
    [payload?.firstName, payload?.middleName, payload?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "New convert"

  return useProcessQueueStore.getState().enqueue({
    type: PROCESS_TYPES.SOUL_WINNING_CREATE_RECORD,
    payload,
    display: {
      title: name,
      subtitle: winnersLabel
        ? `Soul won · ${winnersLabel}`
        : payload?.wonAt
          ? `Soul won · ${payload.wonAt}`
          : "Soul won",
      tone: "positive",
    },
  })
}

/**
 * High-level helper for editing a soul winning record without blocking the
 * modal — same flow as enqueueUpdateMember: the modal closes immediately on
 * save and the update drains through the queue.
 */
function enqueueUpdateSoulWinningRecord({ id, payload, label }) {
  return useProcessQueueStore.getState().enqueue({
    type: PROCESS_TYPES.SOUL_WINNING_UPDATE_RECORD,
    payload: { id, payload },
    display: {
      title: label || "Soul winning record",
      subtitle: "Update record",
      tone: "positive",
    },
  })
}

function createPendingDeleteIdSelector(processType) {
  return (state) => {
    const ids = []

    for (const item of state.items) {
      if (
        item.type !== processType ||
        (item.status !== PROCESS_STATUS.queued &&
          item.status !== PROCESS_STATUS.running)
      ) {
        continue
      }

      if (item.payload?.id) ids.push(item.payload.id)
    }

    ids.sort()
    return ids
  }
}

const selectPendingMemberDeleteIds = createPendingDeleteIdSelector(
  PROCESS_TYPES.MEMBERS_DELETE_MEMBER
)
const selectPendingMemberUpdateIds = createPendingDeleteIdSelector(
  PROCESS_TYPES.MEMBERS_UPDATE_MEMBER
)
const selectPendingTransactionDeleteIds = createPendingDeleteIdSelector(
  PROCESS_TYPES.FINANCE_DELETE_TRANSACTION
)
const selectPendingSoulWinningUpdateIds = createPendingDeleteIdSelector(
  PROCESS_TYPES.SOUL_WINNING_UPDATE_RECORD
)

export {
  useProcessQueueStore,
  PROCESS_TYPES,
  selectPendingMemberDeleteIds,
  selectPendingMemberUpdateIds,
  selectPendingTransactionDeleteIds,
  selectPendingSoulWinningUpdateIds,
  enqueueCreateTransaction,
  enqueueDeleteTransactions,
  enqueueCreateMember,
  enqueueUpdateMember,
  enqueueDeleteMembers,
  enqueueCreateSoulWinningRecord,
  enqueueUpdateSoulWinningRecord,
}
export default useProcessQueueStore
