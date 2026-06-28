"use client"

import { useState, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { MediaIntent } from "@/lib/prompt-engineer"

interface InputBarProps {
  onSend: (message: string, mode: MediaIntent, searchWeb: boolean) => void
  disabled?: boolean
}

const MODES: { value: MediaIntent; label: string; labelAr: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "text",
    label: "Chat",
    labelAr: "محادثة",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: "text-horas-blue",
  },
  {
    value: "image",
    label: "Image",
    labelAr: "صورة",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    ),
    color: "text-emerald-500",
  },
  {
    value: "video",
    label: "Video",
    labelAr: "فيديو",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    color: "text-violet-500",
  },
  {
    value: "audio",
    label: "Music",
    labelAr: "موسيقى",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    ),
    color: "text-orange-500",
  },
]

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState<MediaIntent>("text")
  const [searchWeb, setSearchWeb] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px"
  }, [message])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || disabled) return
    onSend(message.trim(), mode, searchWeb)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const activeMode = MODES.find((m) => m.value === mode)!

  return (
    <div className="px-4 pb-4 pt-2 bg-background/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
        {/* Mode selector strip */}
        <div className="flex items-center gap-1 mb-2 px-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${
                mode === m.value
                  ? `bg-input-active border-horas-gold/40 text-foreground shadow-sm`
                  : "bg-transparent border-transparent text-foreground/40 hover:text-foreground/70 hover:border-border"
              }`}
            >
              <span className={mode === m.value ? m.color : ""}>{m.icon}</span>
              <span>{m.label}</span>
              <span className="opacity-60">/</span>
              <span dir="rtl">{m.labelAr}</span>
            </button>
          ))}

          <div className="ml-auto flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSearchWeb(!searchWeb)}
                  disabled={mode !== "text"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${
                    searchWeb && mode === "text"
                      ? "bg-horas-blue/10 border-horas-blue/40 text-horas-blue"
                      : "bg-transparent border-transparent text-foreground/30 hover:text-foreground/60 disabled:cursor-not-allowed"
                  }`}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                  </svg>
                  Web Search
                </button>
              </TooltipTrigger>
              <TooltipContent>Search the web for up-to-date information</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main input container */}
        <div className="relative flex items-end gap-2 bg-input-bg border border-input-border rounded-2xl px-4 py-3 shadow-lg focus-within:border-horas-gold/50 focus-within:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all duration-200">
          {/* Mode indicator dot */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mb-1.5 ${activeMode.color.replace("text-", "bg-")}`} />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              mode === "text"
                ? "Ask HORAS anything... / اسأل حورس أي شيء..."
                : mode === "image"
                ? "Describe the image you want... / صف الصورة التي تريدها..."
                : mode === "video"
                ? "Describe the video... / صف الفيديو..."
                : "Describe the music or song... / صف الأغنية أو الموسيقى..."
            }
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-foreground/30 font-sans leading-relaxed max-h-48 overflow-y-auto disabled:opacity-50"
            dir="auto"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-horas-gold hover:bg-horas-gold/90 disabled:bg-foreground/10 disabled:cursor-not-allowed text-[#0D1117] disabled:text-foreground/30 flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            {disabled ? (
              <div className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-transparent animate-spin" />
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-foreground/20 mt-2 font-sans">
          HORAS AI can make mistakes. Always verify important information.
        </p>
      </form>
    </div>
  )
}
