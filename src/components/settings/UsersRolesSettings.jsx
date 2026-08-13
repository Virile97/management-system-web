"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pencil, Plus, Search, Shield, ShieldCheck, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { AddUserDialog } from "@/components/settings/AddUserDialog"
import { EditUserDialog } from "@/components/settings/EditUserDialog"
import { cn } from "@/lib/utils"
import { listUsers, deleteUser } from "@/services/users.service"

const ROLES = {
  ADMIN: {
    label: "Administrator",
    icon: ShieldCheck,
    pill: "border-slate-300 bg-slate-100 text-slate-700",
    pillActive: "border-slate-700 bg-slate-700 text-white",
    badge: "bg-slate-100 text-slate-700",
  },
  FINANCE_ADMIN: {
    label: "Finance Admin",
    icon: Shield,
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pillActive: "border-emerald-700 bg-emerald-700 text-white",
    badge: "bg-emerald-50 text-emerald-700",
  },
  USER: {
    label: "User",
    icon: Shield,
    pill: "border-teal-200 bg-teal-50 text-teal-700",
    pillActive: "border-teal-700 bg-teal-700 text-white",
    badge: "bg-teal-50 text-teal-700",
  },
}

function roleMeta(role) {
  return (
    ROLES[role] || {
      label: role,
      icon: Shield,
      pill: "border-border bg-muted text-muted-foreground",
      pillActive: "border-foreground bg-foreground text-white",
      badge: "bg-muted text-foreground/80",
    }
  )
}

function UsersRolesSettings() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Same ?isEdit=true&userId=… convention as members edit.
  const isEditParam = searchParams.get("isEdit") === "true"
  const editUserIdParam = searchParams.get("userId") || ""

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [activeRole, setActiveRole] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key)
      else params.set(key, String(value))
    }

    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  function openEditUser(user) {
    updateParams({ isEdit: "true", userId: user.id })
  }

  function closeEditUser() {
    updateParams({ isEdit: "", userId: "" })
  }

  const editingUser =
    isEditParam && editUserIdParam
      ? users.find((user) => String(user.id) === String(editUserIdParam)) ||
        null
      : null

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setIsLoading(true)
      setError("")
      try {
        const data = await listUsers(controller.signal)
        if (controller.signal.aborted) return
        setUsers(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load users")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [])

  const roleCounts = useMemo(() => {
    const counts = {}
    for (const user of users) {
      counts[user.role] = (counts[user.role] || 0) + 1
    }
    return counts
  }, [users])

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((user) => {
      if (activeRole && user.role !== activeRole) return false
      if (!query) return true
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    })
  }, [users, search, activeRole])

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(pendingDelete.id)
      setUsers((prev) => prev.filter((user) => user.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err?.message || "Unable to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-normal text-foreground/80">
            Users & Roles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} user{users.length === 1 ? "" : "s"} · manage access
            and permissions
          </p>
        </div>

        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-6">
          <ListCardSkeleton rows={4} />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {Object.keys(ROLES).map((role) => {
              const meta = roleMeta(role)
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    setActiveRole((current) => (current === role ? null : role))
                  }
                  aria-pressed={activeRole === role}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    activeRole === role ? meta.pillActive : meta.pill
                  )}
                >
                  <meta.icon className="h-3.5 w-3.5" />
                  {meta.label}{" "}
                  <span className="text-xs font-normal">
                    ({roleCounts[role] || 0})
                  </span>
                </button>
              )
            })}

            {activeRole && (
              <button
                type="button"
                onClick={() => setActiveRole(null)}
                className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="relative mt-4 max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="h-10 rounded-lg bg-white pl-9"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {visibleUsers.length === 0 ? (
              <EmptyState
                title="No users found"
                description="Try adjusting your search or role filter."
              />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleUsers.map((user) => {
                    const meta = roleMeta(user.role)
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 font-medium text-foreground/80">
                          {user.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.contact || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                              meta.badge
                            )}
                          >
                            <meta.icon className="h-3 w-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditUser(user)}
                              aria-label={`Edit ${user.name || user.email}`}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(user)}
                              aria-label={`Delete ${user.name || user.email}`}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              {pendingDelete?.name || pendingDelete?.email}? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onCreated={(created) => {
          if (!created) return
          setUsers((prev) => {
            const exists = prev.some((user) => user.id === created.id)
            return exists
              ? prev.map((user) => (user.id === created.id ? created : user))
              : [created, ...prev]
          })
        }}
      />
      <EditUserDialog
        open={isEditParam && Boolean(editUserIdParam)}
        onOpenChange={(open) => !open && closeEditUser()}
        user={editingUser}
        onUpdated={(updated) => {
          if (!updated) return
          setUsers((prev) =>
            prev.map((user) =>
              user.id === updated.id ? { ...user, ...updated } : user
            )
          )
          closeEditUser()
        }}
      />
    </div>
  )
}

export { UsersRolesSettings }
export default UsersRolesSettings
