"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import HorasLogo from "./HorasLogo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  mediaType?: string | null
  mediaUrl?: string | null
  mediaMeta?: Record<string, unknown> | null
  theme: "dark" | "light"
  userName: string
  isLoading?: boolean
}

function ImageMedia({ url, alt }: { url: string; alt?: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-3">
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer border border-border/40 max-w-sm group"
        onClick={() => setExpanded(!expanded)}
      >
        <img
          src={url}
          alt={alt ?? "Generated image"}
          className={`w-full object-cover transition-all duration-300 ${expanded ? "max-h-none" : "max-h-72"}`}
          crossOrigin="anonymous"
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-md font-sans">
          {expanded ? "Collapse" : "Expand"}
        </div>
      </div>
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 text-xs text-horas-blue hover:text-horas-gold transition-colors font-sans"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Image
      </a>
    </div>
  )
}

function VideoMedia({ url }: { url: string }) {
  return (
    <div className="mt-3">
      <video
        src={url}
        controls
        className="rounded-xl max-w-sm w-full border border-border/40"
        style={{ maxHeight: 320 }}
      />
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 text-xs text-horas-blue hover:text-horas-gold transition-colors font-sans"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Video
      </a>
    </div>
  )
}

function AudioMedia({ url }: { url: string }) {
  return (
    <div className="mt-3">
      <div className="bg-horas-sidebar rounded-xl p-3 border border-border/40 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-horas-gold/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-horas-gold">
              <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-foreground/70 font-sans">Generated Audio</span>
        </div>
        <audio src={url} controls className="w-full h-8" />
      </div>
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 text-xs text-horas-blue hover:text-horas-gold transition-colors font-sans"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Audio
      </a>
    </div>
  )
}

export default function MessageBubble({
  role,
  content,
  mediaType,
  mediaUrl,
  mediaMeta,
  theme,
  userName,
  isLoading = false,
}: MessageBubbleProps) {
  const isUser = role === "user"
  const isRTL = /[\u0600-\u06FF]/.test(content.slice(0, 50))

  return (
    <div className={`flex gap-3 px-4 py-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-horas-blue/20 text-horas-blue text-xs font-bold font-sans">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-horas-gold/30 shadow-[0_0_12px_rgba(201,168,76,0.2)] flex-shrink-0">
            <HorasLogo theme={theme} size={32} />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-horas-blue text-white rounded-tr-sm"
              : "bg-horas-message-ai text-foreground rounded-tl-sm border border-border/40"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="text-sm leading-relaxed font-sans prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:bg-black/20 prose-pre:rounded-lg prose-code:text-horas-gold prose-a:text-horas-blue">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Media output */}
        {!isLoading && mediaUrl && mediaType === "image" && (
          <ImageMedia url={mediaUrl} alt={typeof mediaMeta?.prompt === "string" ? mediaMeta.prompt : undefined} />
        )}
        {!isLoading && mediaUrl && mediaType === "video" && (
          <VideoMedia url={mediaUrl} />
        )}
        {!isLoading && mediaUrl && mediaType === "audio" && (
          <AudioMedia url={mediaUrl} />
        )}

        {/* Copy button */}
        {!isUser && !isLoading && (
          <button
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-foreground/30 hover:text-foreground/60 flex items-center gap-1 font-sans"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy
          </button>
        )}
      </div>
    </div>
  )
}
