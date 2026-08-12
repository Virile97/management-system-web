"use client"

import { useEffect, useState } from "react"
import { UserPen, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUser } from "@/services/users.service"

const ROLE_OPTIONS = [
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Full access to all settings and data",
  },
  {
    value: "FINANCE_ADMIN",
    label: "Finance Admin",
    description: "Manage finances and view reports",
  },
  {
    value: "USER",
    label: "Viewer — Read-only access",
    description: "Read-only access",
  },
]

function EditUserDialog({ open, onOpenChange, user, onUpdated }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [role, setRole] = useState("USER")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !user) return

    setName(user.name || "")
    setEmail(user.email || "")
    setContact(user.contact || "")
    setRole(user.role || "USER")
    setError("")
    setIsSubmitting(false)
  }, [open, user])

  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!user?.id || isSubmitting) return

    setError("")
    setIsSubmitting(true)

    try {
      const updated = await updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        contact: contact.trim(),
        role,
      })
      toast.success("User updated")
      onUpdated?.(updated)
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to update user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="relative flex items-center gap-2.5 rounded-t-xl bg-[#1e2a4a] px-4 py-4">
          <UserPen className="h-4 w-4 text-white" />
          <span className="font-heading text-base font-medium text-white">
            Edit User
          </span>
          <DialogClose className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="edit-user-name">Full Name *</Label>
            <Input
              id="edit-user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Kwame Asante"
              required
              disabled={isSubmitting || !user}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-email">Email Address *</Label>
            <Input
              id="edit-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@church.org"
              required
              disabled={isSubmitting || !user}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-contact">Contact Number *</Label>
            <Input
              id="edit-user-contact"
              type="tel"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="+233 24 000 0000"
              required
              disabled={isSubmitting || !user}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-role">Role *</Label>
            <Select
              value={role}
              onValueChange={setRole}
              disabled={isSubmitting || !user}
            >
              <SelectTrigger id="edit-user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-muted-foreground">
                {selectedRole.description}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="mx-0 mb-0 px-0 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !user}
              className="bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { EditUserDialog }
export default EditUserDialog
