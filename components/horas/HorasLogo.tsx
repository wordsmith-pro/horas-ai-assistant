"use client"

interface HorasLogoProps {
  theme?: "dark" | "light"
  size?: number
  className?: string
}

export default function HorasLogo({ theme = "dark", size = 40, className = "" }: HorasLogoProps) {
  return (
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amun%20logo-9WfU8NV7xTbk9pT9D1ZqFAUAUrlxX1.png"
      alt="AMUN AI"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
