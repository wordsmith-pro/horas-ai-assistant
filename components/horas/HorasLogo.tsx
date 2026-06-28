"use client"

interface HorasLogoProps {
  theme?: "dark" | "light"
  size?: number
  className?: string
}

export default function HorasLogo({ theme = "dark", size = 40, className = "" }: HorasLogoProps) {
  const src =
    theme === "light"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2028%2C%202026%2C%2001_14_40%20PM-zI2C0lb1N3H1CNRoccxXCTr7RHtCyB.png"
      : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%2028%2C%202026%2C%2001_09_56%20PM-FjHK7G6sQcQvUzXwsGt9pPPoSdyCoG.png"

  return (
    <img
      src={src}
      alt="HORAS AI"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
