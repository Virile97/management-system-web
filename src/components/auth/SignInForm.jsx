"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // TODO: replace with a real auth API call once the backend is ready
      login({ email }, { keepSignedIn })
      router.push("/dashboard")
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please check your credentials and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground uppercase">
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
            className="h-11 rounded-lg px-3.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Password
            </Label>
            <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
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
            className="h-11 rounded-lg px-3.5 text-sm"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={keepSignedIn}
          onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
        />
        Keep me signed in
      </label>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "h-11 w-full rounded-lg bg-[#1e2a4a] text-sm font-semibold text-white hover:bg-[#1e2a4a]/90"
        )}
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need access?{" "}
        <a href="/contact" className="font-semibold text-foreground hover:underline">
          Contact your administrator
        </a>
      </p>
    </form>
  )
}

export { SignInForm }
export default SignInForm
