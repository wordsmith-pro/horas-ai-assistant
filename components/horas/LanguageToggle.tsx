"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1.5">
      <button
        onClick={() => setLanguage("ar")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
          language === "ar"
            ? "bg-horas-gold/20 text-horas-gold border border-horas-gold/40"
            : "text-foreground/60 hover:text-foreground/80"
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
          language === "en"
            ? "bg-horas-gold/20 text-horas-gold border border-horas-gold/40"
            : "text-foreground/60 hover:text-foreground/80"
        }`}
      >
        English
      </button>
    </div>
  )
}
