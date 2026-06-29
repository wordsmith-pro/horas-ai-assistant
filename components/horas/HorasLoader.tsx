"use client"

export default function HorasLoader({ text = "AMUN is thinking..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Animated Eye of Horus rings */}
      <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-horas-gold/30 animate-ping" />
        <div className="absolute inset-1 rounded-full border-2 border-horas-blue/50 animate-spin" style={{ animationDuration: "2s" }} />
        <div className="w-2 h-2 rounded-full bg-horas-blue shadow-[0_0_8px_var(--color-horas-blue)]" />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-foreground/50 font-sans">{text}</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-horas-gold/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
