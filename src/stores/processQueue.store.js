import { createProcessQueue } from "@/lib/process-queue"
import { createTransaction } from "@/services/finance.service"
import { createMember } from "@/services/member.service"
import { createSoulWinningRecord } from "@/services/soulWinning.service"

/** Shared app-wide background process queue. */
const PROCESS_TYPES = {
  FINANCE_CREATE_TRANSACTION: "finance.createTransaction",
  MEMBERS_CREATE_MEMBER: "members.createMember",
  SOUL_WINNING_CREATE_RECORD: "soulWinning.createRecord",
}

const useProcessQueueStore = createProcessQueue({
  name: "process-queue",
  concurrency: 1,
  successTtlMs: 3500,
  handlers: {
    [PROCESS_TYPES.FINANCE_CREATE_TRANSACTION]: (payload) =>
      createTransaction(payload),
    [PROCESS_TYPES.MEMBERS_CREATE_MEMBER]: (payload) => createMember(payload),
    [PROCESS_TYPES.SOUL_WINNING_CREATE_RECORD]: (payload) =>
      createSoulWinningRecord(payload),
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

export {
  useProcessQueueStore,
  PROCESS_TYPES,
  enqueueCreateTransaction,
  enqueueCreateMember,
  enqueueCreateSoulWinningRecord,
}
export default useProcessQueueStore
