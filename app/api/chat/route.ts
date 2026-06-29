import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getSystemPromptForIntent, detectIntent, needsLyricsPipeline, LYRICS_SYSTEM_PROMPT } from "@/lib/prompt-engineer"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const TEXT_MODEL = "mistralai/mistral-7b-instruct:free"

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    // Fallback for development - simple response
    if (process.env.NODE_ENV === "development") {
      console.log("[AMUN] No API key, using development fallback")
      return `I received your message: "${userMessage}". I'm AMUN, your Egyptian AI assistant. I can help with text, images, videos, and music generation. Please configure OPENROUTER_API_KEY for full functionality.`
    }
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ]

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://amun.ai",
      "X-Title": "AMUN Egyptian AI Assistant",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ""
}

// ─── DuckDuckGo search ────────────────────────────────────────────────────────
async function webSearch(query: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(query)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { headers: { "User-Agent": "AMUN-AI/1.0" } }
    )
    if (!response.ok) return ""
    const data = await response.json()

    const results: string[] = []

    if (data.AbstractText) {
      results.push(`**Summary:** ${data.AbstractText}`)
      if (data.AbstractURL) results.push(`**Source:** ${data.AbstractURL}`)
    }

    if (data.RelatedTopics?.length) {
      const topics = data.RelatedTopics
        .slice(0, 5)
        .filter((t: { Text?: string }) => t.Text)
        .map((t: { Text: string; FirstURL?: string }) =>
          `- ${t.Text}${t.FirstURL ? ` ([link](${t.FirstURL}))` : ""}`
        )
      if (topics.length) results.push("**Related:**\n" + topics.join("\n"))
    }

    return results.join("\n\n")
  } catch {
    return ""
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    // Fallback for development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const { message, conversationHistory = [], searchWeb = false } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  try {
    const intent = detectIntent(message)

    // ── Text intent ──────────────────────────────────────────────────────────
    if (intent === "text") {
      let contextualMessage = message
      let webResults = ""

      if (searchWeb) {
        webResults = await webSearch(message)
        if (webResults) {
          contextualMessage = `${message}\n\n[Web search results for context]\n${webResults}`
        }
      }

      const systemPrompt = getSystemPromptForIntent("text")
      let reply: string
      try {
        reply = await callOpenRouter(TEXT_MODEL, systemPrompt, contextualMessage, conversationHistory)
      } catch (err) {
        // Fallback for development or API issues
        if (process.env.NODE_ENV === "development") {
          reply = `I received your message: "${message}". I'm AMUN, your Egyptian AI assistant. I can help with conversations, image, video, and music generation. To get full AI responses, please configure OPENROUTER_API_KEY with a valid API account.`
        } else {
          throw err
        }
      }

      return NextResponse.json({
        reply,
        intent: "text",
        webSearched: !!webResults,
      })
    }

    // ── Audio with lyrics pipeline ────────────────────────────────────────────
    if (intent === "audio" && needsLyricsPipeline(message)) {
      // Step 1: generate lyrics via text model
      const lyrics = await callOpenRouter(TEXT_MODEL, LYRICS_SYSTEM_PROMPT, message)

      return NextResponse.json({
        reply: `تم كتابة كلمات الأغنية. الآن جارٍ توليد الأغنية...\n\n---\n\n${lyrics}`,
        intent: "audio",
        requiresMedia: true,
        mediaIntent: "audio",
        lyricsForGeneration: lyrics,
        originalMessage: message,
      })
    }

    // ── Image / Video / Audio prompting ───────────────────────────────────────
    const systemPrompt = getSystemPromptForIntent(intent)
    const enhancedPrompt = await callOpenRouter(TEXT_MODEL, systemPrompt, message)

    return NextResponse.json({
      reply: `تم تجهيز الـ prompt. جارٍ التوليد...`,
      intent,
      requiresMedia: true,
      mediaIntent: intent,
      enhancedPrompt,
      originalMessage: message,
    })
  } catch (error) {
    console.error("[AMUN chat]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    )
  }
}
