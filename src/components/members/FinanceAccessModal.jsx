"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyFinanceAccess } from "@/services/memberFinance.service"
import { Lock, Eye, EyeOff } from "lucide-react"

function FinanceAccessModal({ open, onOpenChange, onUnlocked }) {
  const [code, setCode] = useState("")
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  function resetState() {
    setCode("")
    setIsRevealed(false)
    setError("")
  }

  function handleOpenChange(next) {
    if (!next) resetState()
    onOpenChange(next)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!code.trim() || isSubmitting) return

    setError("")
    setIsSubmitting(true)

    try {
      await verifyFinanceAccess(code.trim())
      resetState()
      // The caller closes the dialog on success; onOpenChange is left to mean
      // "the user dismissed it" so the two outcomes can be told apart.
      onUnlocked()
    } catch (err) {
      setError(
        err?.message || "Unable to verify the access code. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-6 sm:max-w-sm">
        <DialogHeader className="items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Lock className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle className="font-heading text-lg font-medium">
            Finance Access
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your admin code to view financial records for this member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div className="relative">
            <Input
              autoFocus
              type={isRevealed ? "text" : "password"}
              autoComplete="off"
              placeholder="Enter access code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-lg border-amber-300 pr-10 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
            />
            <button
              type="button"
              onClick={() => setIsRevealed((revealed) => !revealed)}
              aria-label={isRevealed ? "Hide access code" : "Show access code"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {isRevealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="h-11 w-full rounded-lg bg-[#1e2a4a] text-sm font-medium text-white hover:bg-[#1e2a4a]/90"
          >
            {isSubmitting ? "Verifying…" : "Access Finance Records"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { FinanceAccessModal }
export default FinanceAccessModal
