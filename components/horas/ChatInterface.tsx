"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Sidebar from "./Sidebar"
import MessageBubble from "./MessageBubble"
import InputBar from "./InputBar"
import HorasLoader from "./HorasLoader"
import WelcomeScreen from "./WelcomeScreen"
import ThemeToggle from "./ThemeToggle"
import HorasLogo from "./HorasLogo"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation, Message } from "@/lib/db/schema"
import type { MediaIntent } from "@/lib/prompt-engineer"

interface ChatUser {
  id: string
  name: string
  email: string
}

interface ChatInterfaceProps {
  user: ChatUser
  initialConversations: Conversation[]
}

interface LocalMessage {
  id: string
  role: "user" | "assistant"
  content: string
  mediaType?: string | null
  mediaUrl?: string | null
  mediaMeta?: Record<string, unknown> | null
  isLoading?: boolean
}

export default function ChatInterface({ user, initialConversations }: ChatInterfaceProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-amun-theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const createNewConversation = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      })
      if (!res.ok) return null
      const conv: Conversation = await res.json()
      setConversations((prev) => [conv, ...prev])
      setCurrentConvId(conv.id)
      return conv.id
    } catch {
      return null
    }
  }, [])

  const handleNewChat = useCallback(() => {
    setCurrentConvId(null)
    setMessages([])
  }, [])

  const handleSelectConv = useCallback(async (id: string) => {
    setCurrentConvId(id)
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok) return
      const data = await res.json()
      const loaded: LocalMessage[] = data.messages.map((m: Message) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        mediaMeta: m.mediaMeta as Record<string, unknown> | null,
      }))
      setMessages(loaded)
    } catch {
      setMessages([])
    }
  }, [])

  const handleDeleteConv = useCallback(async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (currentConvId === id) {
        setCurrentConvId(null)
        setMessages([])
      }
    } catch {
      // silent fail
    }
  }, [currentConvId])

  const saveMessage = async (
    convId: string,
    role: string,
    content: string,
    mediaType?: string | null,
    mediaUrl?: string | null,
    mediaMeta?: Record<string, unknown> | null
  ) => {
    try {
      await fetch(`/api/conversations/${convId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content, mediaType, mediaUrl, mediaMeta }),
      })
    } catch {
      // silent fail
    }
  }

  const refreshConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) {
        const convs: Conversation[] = await res.json()
        setConversations(convs)
      }
    } catch {
      // silent fail
    }
  }

  const handleSend = useCallback(async (text: string, mode: MediaIntent, searchWeb: boolean) => {
    if (isLoading) return

    // Ensure we have a conversation
    let convId = currentConvId
    if (!convId) {
      convId = await createNewConversation()
      if (!convId) return
    }

    const userMsgId = `user-${Date.now()}`
    const loaderMsgId = `loader-${Date.now()}`

    // Add user message
    const userMsg: LocalMessage = { id: userMsgId, role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    await saveMessage(convId, "user", text)

    // Add loading indicator
    setMessages((prev) => [...prev, { id: loaderMsgId, role: "assistant", content: "", isLoading: true }])
    setIsLoading(true)

    try {
      // Step 1: Chat route — intent detection + prompt engineering
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages
            .filter((m) => !m.isLoading)
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
          searchWeb: searchWeb && mode === "text",
        }),
      })

      if (!chatRes.ok) {
        const err = await chatRes.json()
        throw new Error(err.error ?? "Chat failed")
      }

      const chatData = await chatRes.json()

      // ── Pure text response ────────────────────────────────────────────────
      if (!chatData.requiresMedia) {
        const assistantMsg: LocalMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: chatData.reply,
        }
        setMessages((prev) => prev.filter((m) => m.id !== loaderMsgId).concat(assistantMsg))
        await saveMessage(convId, "assistant", chatData.reply)
        await refreshConversations()
        return
      }

      // ── Media generation needed ────────────────────────────────────────────
      const mediaIntent: MediaIntent = chatData.mediaIntent

      // Show intermediate text (e.g. lyrics)
      const intermediateMsg: LocalMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: chatData.reply,
      }
      setMessages((prev) => prev.filter((m) => m.id !== loaderMsgId).concat(intermediateMsg))
      await saveMessage(convId, "assistant", chatData.reply)

      // New loader for media generation
      const mediaLoaderId = `loader-media-${Date.now()}`
      const loaderText =
        mediaIntent === "image" ? "Generating image..." :
        mediaIntent === "video" ? "Generating video..." :
        "Composing music..."

      setMessages((prev) => [
        ...prev,
        { id: mediaLoaderId, role: "assistant", content: "", isLoading: true },
      ])

      // Step 2: Generate media
      let mediaUrl: string | null = null
      let genError: string | null = null

      try {
        const endpoint =
          mediaIntent === "image" ? "/api/generate/image" :
          mediaIntent === "video" ? "/api/generate/video" :
          "/api/generate/audio"

        const body: Record<string, unknown> = {
          prompt: chatData.enhancedPrompt ?? chatData.lyricsForGeneration ?? text,
        }
        if (mediaIntent === "audio" && chatData.lyricsForGeneration) {
          body.lyrics = chatData.lyricsForGeneration
          body.prompt = chatData.originalMessage ?? text
        }

        const mediaRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json()
          mediaUrl = mediaData.url
        } else {
          const errData = await mediaRes.json()
          genError = errData.error ?? "Generation failed"
        }
      } catch (err) {
        genError = err instanceof Error ? err.message : "Unknown error"
      }

      // Replace loader with media message
      const mediaContent = mediaUrl
        ? `${mediaIntent === "image" ? "Here is your generated image:" : mediaIntent === "video" ? "Here is your generated video:" : "Here is your generated music:"}`
        : `Sorry, ${loaderText.toLowerCase()} failed: ${genError}`

      const mediaMsg: LocalMessage = {
        id: `media-${Date.now()}`,
        role: "assistant",
        content: mediaContent,
        mediaType: mediaUrl ? mediaIntent : null,
        mediaUrl,
        mediaMeta: { prompt: chatData.enhancedPrompt ?? text },
      }

      setMessages((prev) => prev.filter((m) => m.id !== mediaLoaderId).concat(mediaMsg))
      await saveMessage(convId, "assistant", mediaContent, mediaUrl ? mediaIntent : null, mediaUrl, { prompt: chatData.enhancedPrompt ?? text })
      await refreshConversations()
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Something went wrong"
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loaderMsgId)
          .concat({ id: `err-${Date.now()}`, role: "assistant", content: `Sorry, an error occurred: ${errMsg}` })
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, currentConvId, messages, createNewConversation])

  const handleSuggestion = useCallback((text: string) => {
    handleSend(text, "text", false)
  }, [handleSend])

  const showWelcome = messages.length === 0 && !isLoading

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: theme === "dark" ? "#0D1117" : "#F8F9FC" }}
    >
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConvId={currentConvId ?? undefined}
        onNewChat={handleNewChat}
        onSelectConv={handleSelectConv}
        onDeleteConv={handleDeleteConv}
        theme={theme}
        userName={user.name}
        userEmail={user.email}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main area */}
      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            {sidebarCollapsed && (
              <>
                <HorasLogo theme={theme} size={28} className="logo-shimmer" />
                <span className="font-bold text-sm font-sans tracking-wide" style={{ color: "#D4AF37" }}>AMUN</span>
              </>
            )}
            {!sidebarCollapsed && (
              <span
                className="text-sm font-medium font-sans truncate max-w-xs"
                style={{ color: theme === "dark" ? "rgba(232,234,240,0.5)" : "rgba(13,17,23,0.4)" }}
              >
                {currentConvId
                  ? (conversations.find((c) => c.id === currentConvId)?.title ?? "Conversation")
                  : "AMUN Egyptian AI Assistant"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => t === "dark" ? "light" : "dark")} />
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          {showWelcome ? (
            <WelcomeScreen theme={theme} userName={user.name} onSuggestion={handleSuggestion} />
          ) : (
            <div className="max-w-3xl mx-auto py-4 space-y-1">
              {messages.map((msg) => (
                msg.isLoading ? (
                  <HorasLoader key={msg.id} />
                ) : (
                  <div key={msg.id} className="animate-fadeInUp">
                    <MessageBubble
                      role={msg.role}
                      content={msg.content}
                      mediaType={msg.mediaType}
                      mediaUrl={msg.mediaUrl}
                      mediaMeta={msg.mediaMeta}
                      theme={theme}
                      userName={user.name}
                    />
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0">
          <InputBar onSend={handleSend} disabled={isLoading} />
        </div>
      </main>
    </div>
  )
}
