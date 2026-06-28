"use client"

import { createAuthClient } from "better-auth/react"

// Resolve baseURL at runtime so it always matches the current origin,
// which is critical inside the v0/Vercel preview iframe where
// NEXT_PUBLIC_APP_URL may not be set or may differ from window.location.
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  // SSR fallback — not used for client-side auth calls
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient
