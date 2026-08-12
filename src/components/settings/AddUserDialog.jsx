"use client"

import { useState } from "react"
import { User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

function AddUserDialog({ open, onOpenChange }) {
  const [role, setRole] = useState("USER")
  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="relative flex items-center gap-2.5 rounded-t-xl bg-[#1e2a4a] px-4 py-4">
          <User className="h-4 w-4 text-white" />
          <span className="font-heading text-base font-medium text-white">
            Add New User
          </span>
          <DialogClose className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <form className="space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-user-name">Full Name *</Label>
            <Input id="add-user-name" placeholder="e.g. Kwame Asante" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-user-email">Email Address *</Label>
            <Input
              id="add-user-email"
              type="email"
              placeholder="user@church.org"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-user-contact">Contact Number *</Label>
            <Input
              id="add-user-contact"
              type="tel"
              placeholder="+233 24 000 0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-user-role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="add-user-role" className="w-full">
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

          <DialogDescription className="rounded-lg bg-muted px-3 py-2 text-xs">
            Adding users isn't available yet. This form is a preview of what's
            coming.
          </DialogDescription>
        </form>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled
            title="Adding users isn't available yet"
            className="bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90"
          >
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddUserDialog }
export default AddUserDialog
