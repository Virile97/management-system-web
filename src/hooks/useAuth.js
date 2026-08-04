"use client"

import { useCallback, useEffect, useState } from "react"

const AUTH_STORAGE_KEY = "auth_session"

function readSession() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function useAuth() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSession(readSession())
    setIsLoading(false)
  }, [])

  const login = useCallback((user, { keepSignedIn = false } = {}) => {
    const storage = keepSignedIn ? window.localStorage : window.sessionStorage
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    setSession(user)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }, [])

  return {
    user: session,
    isAuthenticated: Boolean(session),
    isLoading,
    login,
    logout,
  }
}

export { useAuth }
export default useAuth
