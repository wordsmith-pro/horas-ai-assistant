"use client"

import { useEffect, useState } from "react"
import ChatInterface from "@/components/horas/ChatInterface"
import HorasLoader from "@/components/horas/HorasLoader"
import type { Conversation } from "@/lib/db/schema"

interface CachedSession {
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export default function AppShell() {
  const [user, setUser] = useState<CachedSession["user"] | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true)

      // First, try to read from localStorage (set after successful sign-in)
      let session: CachedSession | null = null
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("horas-user-session")
        if (cached) {
          try {
            session = JSON.parse(cached)
          } catch {
            // Invalid JSON, ignore
          }
        }
      }

      // If no cached session, try to fetch from API
      if (!session?.user) {
        try {
          const res = await fetch("/api/auth/session", { credentials: "include" })
          if (res.ok) {
            session = await res.json()
          }
        } catch {
          // API fetch failed
        }
      }

      if (!session?.user) {
        // No session found - redirect to sign-in
        window.location.href = "/sign-in"
        return
      }

      // Session found - set user and load conversations
      setUser(session.user)

      // Fetch conversations
      try {
        const res = await fetch("/api/conversations", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setConversations(Array.isArray(data) ? data : [])
        }
      } catch {
        setConversations([])
      }

      setLoading(false)
    }

    loadSession()
  }, [])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <HorasLoader />
      </div>
    )
  }

  return (
    <ChatInterface
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email,
      }}
      initialConversations={conversations}
    />
  )
}
