"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Plus, Image, Video, Music, MessageSquare } from "lucide-react"

interface ModeMenuProps {
  currentMode: "text" | "image" | "video" | "audio"
  onModeChange: (mode: "text" | "image" | "video" | "audio") => void
}

export default function ModeMenu({ currentMode, onModeChange }: ModeMenuProps) {
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const modes = [
    { value: "text" as const, icon: MessageSquare, label: "mode.chat" },
    { value: "image" as const, icon: Image, label: "mode.image" },
    { value: "video" as const, icon: Video, label: "mode.video" },
    { value: "audio" as const, icon: Music, label: "mode.music" },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-horas-gold hover:bg-horas-gold/90 text-[#0D1117] flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.5)] hover:scale-110 active:scale-95"
      >
        <Plus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 w-48 bg-[#1C2128] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl p-2 z-50">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.value}
                onClick={() => {
                  onModeChange(mode.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                  currentMode === mode.value
                    ? "bg-horas-gold/20 text-horas-gold border border-horas-gold/40"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(mode.label)}</span>
              </button>
            )
          })}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
