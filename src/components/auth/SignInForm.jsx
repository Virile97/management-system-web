"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encryptWithPublicKey } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { APP_API_ENDPOINTS } from "@/utils/constants"
import { useAuthGuard } from "@/hooks/use-auth-guard"

function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [publicKey, setPublicKey] = useState(null)
  const [isKeyLoading, setIsKeyLoading] = useState(true)
  const [keyError, setKeyError] = useState("")

  useAuthGuard("guest", "/dashboard")

  useEffect(() => {
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
  }, [])

  const isFormDisabled = isKeyLoading || Boolean(keyError) || !publicKey

  async function handleSubmit(e) {
    e.preventDefault()
    if (isFormDisabled) return

    setError("")
    setIsSubmitting(true)

    try {
      const encryptedPassword = await encryptWithPublicKey(publicKey, password)
      const res = await fetch(APP_API_ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: encryptedPassword }),
      })
      const body = await res.json()
      if (!res.ok || !body.success) {
        throw new Error(
          body?.message ||
            "Unable to sign in. Please check your credentials and try again."
        )
      }

      router.push("/dashboard")
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please check your credentials and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your dashboard.
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
            htmlFor="email"
            className="text-xs font-semibold tracking-wide text-foreground uppercase"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@church.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isFormDisabled}
            className="h-11 rounded-lg px-3.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-semibold tracking-wide text-foreground uppercase"
            >
              Password
            </Label>
            <a
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
        {isSubmitting ? "Signing in…" : isKeyLoading ? "Loading…" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need access?{" "}
        <a
          href="/contact"
          className="font-semibold text-foreground hover:underline"
        >
          Contact your administrator
        </a>
      </p>
    </form>
  )
}

export { SignInForm }
export default SignInForm
