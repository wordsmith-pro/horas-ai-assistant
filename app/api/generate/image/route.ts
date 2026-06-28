import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const IMAGE_MODEL = "bytedance-seed/seedream-4.5"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt, width = 1024, height = 1024 } = await req.json()
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 })

  try {
    const response = await fetch(`${OPENROUTER_BASE}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://horas.ai",
        "X-Title": "HORAS AI Assistant",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        n: 1,
        size: `${width}x${height}`,
        response_format: "url",
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Image generation failed: ${response.status} — ${err}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url ?? data.data?.[0]?.b64_json
    if (!imageUrl) throw new Error("No image URL in response")

    return NextResponse.json({ url: imageUrl, model: IMAGE_MODEL })
  } catch (error) {
    console.error("[HORAS image]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    )
  }
}
