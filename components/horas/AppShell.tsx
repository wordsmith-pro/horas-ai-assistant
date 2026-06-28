"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import ChatInterface from "@/components/horas/ChatInterface"
import HorasLoader from "@/components/horas/HorasLoader"
import type { Conversation } from "@/lib/db/schema"

export default function AppShell() {
  const { data: session, isPending } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convLoading, setConvLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Check if we just signed in (within the last 5 seconds)
    // In the iframe, the session cookie fetch can race, so we wait a bit
    const authPending = typeof window !== "undefined" && localStorage.getItem("horas-auth-pending")
    
    // Still waiting for session hydration or auth pending flag
    if (isPending || (authPending && retryCount === 0)) return

    // Clear the auth pending flag after first check
    if (authPending && retryCount > 0) {
      localStorage.removeItem("horas-auth-pending")
    }

    if (!session?.user) {
      // If auth is still pending, retry in 500ms
      if (authPending && retryCount < 5) {
        const timer = setTimeout(() => setRetryCount(retryCount + 1), 500)
        return () => clearTimeout(timer)
      }
      
      // Hard navigate — avoids "Router action before initialization" by
      // never touching the Next.js router before it is ready
      window.location.href = "/sign-in"
      return
    }

    setConvLoading(true)
    fetch("/api/conversations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Conversation[]) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setConvLoading(false))
  }, [isPending, session, retryCount])

  // Show loader while session is pending, unauthenticated (about to redirect),
  // or conversations are still loading
  if (isPending || !session?.user || convLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <HorasLoader />
      </div>
    )
  }

  return (
    <ChatInterface
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
      initialConversations={conversations}
    />
  )
}
