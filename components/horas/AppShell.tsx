"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import ChatInterface from "@/components/horas/ChatInterface"
import HorasLoader from "@/components/horas/HorasLoader"
import type { Conversation } from "@/lib/db/schema"

export default function AppShell() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convLoading, setConvLoading] = useState(false)

  // Once session is known, either redirect or load conversations
  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.replace("/sign-in")
      return
    }

    // Load conversations for this user
    setConvLoading(true)
    fetch("/api/conversations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Conversation[]) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setConvLoading(false))
  }, [isPending, session, router])

  // Still checking session
  if (isPending || (!session?.user && !isPending)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <HorasLoader />
      </div>
    )
  }

  if (convLoading || !session?.user) {
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
