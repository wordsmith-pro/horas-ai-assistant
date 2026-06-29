"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import HorasLogo from "./HorasLogo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"
import type { Conversation } from "@/lib/db/schema"

interface SidebarProps {
  conversations: Conversation[]
  currentConvId?: string
  onNewChat: () => void
  onSelectConv: (id: string) => void
  onDeleteConv: (id: string) => void
  theme: "dark" | "light"
  userName: string
  userEmail: string
  collapsed: boolean
  onToggleCollapse: () => void
}

function formatDate(date: Date | string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function Sidebar({
  conversations,
  currentConvId,
  onNewChat,
  onSelectConv,
  onDeleteConv,
  theme,
  userName,
  userEmail,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(id)
    await onDeleteConv(id)
    setDeletingId(null)
  }

  const handleSignOut = async () => {
    // Clear cached session from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("amun-user-session")
    }
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center py-4 gap-4 w-14 bg-horas-sidebar border-r border-horas-sidebar-border h-screen flex-shrink-0 transition-all duration-300">
        <button onClick={onToggleCollapse} className="p-2 rounded-lg hover:bg-horas-gold/10 transition-colors" title="Expand sidebar">
          <HorasLogo theme={theme} size={28} />
        </button>
        <Separator className="w-8 bg-horas-sidebar-border" />
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg hover:bg-horas-gold/10 transition-colors text-horas-gold"
          title="New Chat"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col w-64 bg-horas-sidebar border-r border-horas-sidebar-border h-screen flex-shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <HorasLogo theme={theme} size={32} />
          <div>
            <p className="font-bold text-sm text-foreground font-sans tracking-wide">AMUN</p>
            <p className="text-[10px] text-horas-gold/70 font-sans tracking-widest uppercase">Egyptian AI</p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-horas-gold/10 text-foreground/40 hover:text-foreground transition-colors"
          title="Collapse sidebar"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-horas-gold/10 hover:bg-horas-gold/20 border border-horas-gold/20 text-horas-gold text-sm font-medium font-sans transition-all duration-200 group"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <Separator className="bg-horas-sidebar-border mx-3 w-auto" />

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2 py-2">
        {conversations.length === 0 ? (
          <p className="text-center text-xs text-foreground/30 py-8 font-sans">No conversations yet</p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConv(conv.id)}
                className={`w-full group flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  currentConvId === conv.id
                    ? "bg-horas-gold/15 text-foreground"
                    : "text-foreground/60 hover:bg-horas-sidebar-hover hover:text-foreground"
                }`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0 opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate font-sans">{conv.title}</p>
                  <p className="text-[10px] text-foreground/30 mt-0.5 font-sans">{formatDate(conv.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-foreground/30 hover:text-red-400 transition-all"
                  title="Delete"
                >
                  {deletingId === conv.id ? (
                    <div className="w-3 h-3 rounded-full border border-current animate-spin border-t-transparent" />
                  ) : (
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator className="bg-horas-sidebar-border mx-3 w-auto" />

      {/* User profile */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-horas-sidebar-hover transition-colors">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-horas-gold/20 text-horas-gold text-xs font-bold font-sans">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-foreground truncate font-sans">{userName}</p>
                <p className="text-[10px] text-foreground/40 truncate font-sans">{userEmail}</p>
              </div>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-foreground/30 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
