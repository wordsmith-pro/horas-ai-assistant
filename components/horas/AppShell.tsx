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

  useEffect(() => {
    // Still waiting for session hydration
    if (isPending) return

    if (!session?.user) {
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
  }, [isPending, session])

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
