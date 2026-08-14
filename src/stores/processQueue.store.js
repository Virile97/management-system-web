import { createProcessQueue } from "@/lib/process-queue"
import { createTransaction } from "@/services/finance.service"
import { createMember } from "@/services/member.service"

/** Shared app-wide background process queue. */
const PROCESS_TYPES = {
  FINANCE_CREATE_TRANSACTION: "finance.createTransaction",
  MEMBERS_CREATE_MEMBER: "members.createMember",
}

const useProcessQueueStore = createProcessQueue({
  name: "process-queue",
  concurrency: 1,
  successTtlMs: 3500,
  handlers: {
    [PROCESS_TYPES.FINANCE_CREATE_TRANSACTION]: (payload) =>
      createTransaction(payload),
    [PROCESS_TYPES.MEMBERS_CREATE_MEMBER]: (payload) => createMember(payload),
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

export {
  useProcessQueueStore,
  PROCESS_TYPES,
  enqueueCreateTransaction,
  enqueueCreateMember,
}
export default useProcessQueueStore
