import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const AUDIO_MODEL = "google/lyria-3-clip-preview"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt, lyrics } = await req.json()
  if (!prompt && !lyrics) return NextResponse.json({ error: "Prompt or lyrics required" }, { status: 400 })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 })

  // Combine prompt with lyrics if available
  const finalPrompt = lyrics
    ? `${prompt ?? "Create a song with these lyrics:"}\n\nLyrics:\n${lyrics}`
    : prompt

  try {
    const response = await fetch(`${OPENROUTER_BASE}/audio/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://horas.ai",
        "X-Title": "AMUN Egyptian AI Assistant",
      },
      body: JSON.stringify({
        model: AUDIO_MODEL,
        prompt: finalPrompt,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Audio generation failed: ${response.status} — ${err}`)
    }

    const data = await response.json()
    const audioUrl = data.data?.[0]?.url ?? data.url

    if (!audioUrl) throw new Error("No audio URL in response")

    return NextResponse.json({ url: audioUrl, model: AUDIO_MODEL })
  } catch (error) {
    console.error("[AMUN audio]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audio generation failed" },
      { status: 500 }
    )
  }
}
