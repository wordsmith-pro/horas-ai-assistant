"use client"

import HorasLogo from "./HorasLogo"

interface WelcomeScreenProps {
  theme: "dark" | "light"
  userName: string
  onSuggestion: (text: string) => void
}

const SUGGESTIONS = [
  { text: "اكتب لي قصيدة عن مصر", label: "Poetry", icon: "✍" },
  { text: "Generate an image of the Great Pyramid at sunset with futuristic holograms", label: "Image", icon: "🖼" },
  { text: "اعمل أغنية عن تأهل مصر لكاس العالم بالعربي المصري", label: "Music", icon: "🎵" },
  { text: "اشرح لي الذكاء الاصطناعي بطريقة بسيطة", label: "Explain", icon: "💡" },
  { text: "Create a video of a falcon soaring over the Nile", label: "Video", icon: "🎬" },
  { text: "ما آخر أخبار الذكاء الاصطناعي؟", label: "News", icon: "📰" },
]

export default function WelcomeScreen({ theme, userName, onSuggestion }: WelcomeScreenProps) {
  const firstName = userName.split(" ")[0]

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Logo */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-horas-gold/10 blur-2xl scale-150" />
        <HorasLogo theme={theme} size={80} className="relative drop-shadow-2xl" />
      </div>

      {/* Greeting */}
      <h1 className="text-3xl font-bold text-foreground font-sans mb-1 tracking-tight">
        Hello, <span className="text-horas-gold">{firstName}</span>
      </h1>
      <p className="text-lg text-foreground/50 font-sans mb-1">
        مرحباً، أنا <span className="text-horas-gold font-semibold">آمون</span>
      </p>
      <p className="text-sm text-foreground/40 font-sans max-w-md mb-10 leading-relaxed">
        Your Egyptian AI Assistant — capable of text, image, video, and music generation.
        <br />
        مساعدك الذكي المصري لتوليد النصوص والصور والفيديوهات والموسيقى.
      </p>

      {/* Capability badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[
          { label: "Chat", labelAr: "محادثة", color: "bg-horas-blue/10 text-horas-blue border-horas-blue/20" },
          { label: "Images", labelAr: "صور", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
          { label: "Video", labelAr: "فيديو", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
          { label: "Music", labelAr: "موسيقى", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
          { label: "Web Search", labelAr: "بحث", color: "bg-horas-gold/10 text-horas-gold border-horas-gold/20" },
        ].map((b) => (
          <span
            key={b.label}
            className={`px-3 py-1 rounded-full text-xs font-medium font-sans border ${b.color}`}
          >
            {b.label} / {b.labelAr}
          </span>
        ))}
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className="group text-left px-4 py-3.5 rounded-xl bg-horas-sidebar border border-horas-sidebar-border hover:border-horas-gold/40 hover:bg-horas-sidebar-hover transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <p className="text-xs font-medium text-foreground font-sans leading-snug line-clamp-2 dir-auto" dir="auto">
              {s.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
