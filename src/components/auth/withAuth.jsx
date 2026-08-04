"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/useAuth"

function withAuth(Component) {
  function AuthenticatedComponent(props) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/login")
      }
    }, [isLoading, isAuthenticated, router])

    if (isLoading || !isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name || "Component"})`

  return AuthenticatedComponent
}

export { withAuth }
export default withAuth
