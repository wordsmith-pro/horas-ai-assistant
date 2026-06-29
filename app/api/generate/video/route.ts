import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const VIDEO_MODEL = "alibaba/wan-2.6"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt, duration = 5 } = await req.json()
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 })

  try {
    const response = await fetch(`${OPENROUTER_BASE}/video/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://horas.ai",
        "X-Title": "AMUN Egyptian AI Assistant",
      },
      body: JSON.stringify({
        model: VIDEO_MODEL,
        prompt,
        duration,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Video generation failed: ${response.status} — ${err}`)
    }

    const data = await response.json()
    const videoUrl = data.data?.[0]?.url ?? data.url

    if (!videoUrl) throw new Error("No video URL in response")

    return NextResponse.json({ url: videoUrl, model: VIDEO_MODEL })
  } catch (error) {
    console.error("[AMUN video]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video generation failed" },
      { status: 500 }
    )
  }
}
