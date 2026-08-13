"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encryptWithPublicKey } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { APP_API_ENDPOINTS } from "@/utils/constants"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { getSetPasswordInfo, setPassword } from "@/services/users.service"

function SetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [invite, setInvite] = useState(null)
  const [isValidating, setIsValidating] = useState(true)
  const [validateError, setValidateError] = useState("")

  const [password, setPasswordValue] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [publicKey, setPublicKey] = useState(null)
  const [isKeyLoading, setIsKeyLoading] = useState(true)
  const [keyError, setKeyError] = useState("")

  useAuthGuard("guest", "/dashboard")

  useEffect(() => {
    if (!token) {
      setValidateError("This set-password link is missing a token.")
      setIsValidating(false)
      return
    }

    const controller = new AbortController()

    async function validateToken() {
      setIsValidating(true)
      setValidateError("")
      try {
        const data = await getSetPasswordInfo(token, controller.signal)
        if (controller.signal.aborted) return
        setInvite(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setValidateError(
          err?.message || "This set-password link is invalid or has expired."
        )
      } finally {
        if (!controller.signal.aborted) setIsValidating(false)
      }
    }

    validateToken()
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    if (!invite) return

    let isMounted = true

    async function fetchPublicKey() {
      setIsKeyLoading(true)
      setKeyError("")
      try {
        const res = await fetch(APP_API_ENDPOINTS.AUTH_PUBLIC_KEY)
        const body = await res.json()
        if (!res.ok || !body.success) throw new Error(body?.message)
        if (isMounted) setPublicKey(body.data.publicKey)
      } catch {
        if (isMounted)
          setKeyError(
            "Unable to reach the server. Please refresh the page to try again."
          )
      } finally {
        if (isMounted) setIsKeyLoading(false)
      }
    }

    fetchPublicKey()
    return () => {
      isMounted = false
    }
  }, [invite])

  const isFormDisabled =
    !invite || isKeyLoading || Boolean(keyError) || !publicKey

  async function handleSubmit(event) {
    event.preventDefault()
    if (isFormDisabled || isSubmitting) return

    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const encryptedPassword = await encryptWithPublicKey(publicKey, password)
      await setPassword({ token, password: encryptedPassword })
      router.push("/dashboard")
    } catch (err) {
      setError(err?.message || "Unable to set password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidating) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Validating your invite link…</p>
      </div>
    )
  }

  if (validateError || !invite) {
    return (
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-medium text-foreground">
            Link unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            {validateError ||
              "This set-password link is invalid or has expired."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask your administrator to send a new invite, or{" "}
          <a
            href="/login"
            className="font-semibold text-foreground hover:underline"
          >
            sign in
          </a>{" "}
          if you already have a password.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium text-foreground">
          Set your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome{invite.name ? `, ${invite.name}` : ""}. Choose a password for{" "}
          <span className="font-medium text-foreground">{invite.email}</span>.
        </p>
      </div>

      {keyError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {keyError}
        </p>
      )}

      {!keyError && error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold tracking-wide text-foreground uppercase"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            required
            minLength={8}
            disabled={isFormDisabled}
            className="h-11 rounded-lg px-3.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirm-password"
            className="text-xs font-semibold tracking-wide text-foreground uppercase"
          >
            Confirm password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={isFormDisabled}
            className="h-11 rounded-lg px-3.5 text-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isFormDisabled || isSubmitting}
        className={cn(
          "h-11 w-full rounded-lg bg-[#1e2a4a] text-sm font-semibold text-white hover:bg-[#1e2a4a]/90"
        )}
      >
        {isSubmitting
          ? "Saving…"
          : isKeyLoading
            ? "Loading…"
            : "Set password & continue"}
      </Button>
    </form>
  )
}

export { SetPasswordForm }
export default SetPasswordForm
