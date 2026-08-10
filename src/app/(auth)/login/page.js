import { SignInForm } from "@/components/auth/SignInForm"

export const metadata = {
  title: "Sign In | Management System",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1e2a4a] px-16 py-12 lg:flex">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Lighthouse BBC"
            className="size-[5em] shrink-0 rounded-xl object-cover"
          />
          <div>
            <p className="font-heading text-xl font-medium text-white">Lighthouse BBC Goa</p>
            <p className="text-sm text-white/60">Data Management System</p>
          </div>
        </div>

        <blockquote className="max-w-md space-y-4">
          <p className="font-heading text-3xl leading-snug text-white">
            &ldquo;Let all things be done decently and in order.&rdquo;
          </p>
          <cite className="block text-sm font-semibold tracking-wide text-white/60 not-italic uppercase">
          ⸺ 1 Corinthians 14:40
          </cite>
        </blockquote>

        <p className="text-sm text-white/50">© 2026 Lighthouse BBC. All rights reserved.</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <SignInForm />
      </div>
    </div>
  )
}
