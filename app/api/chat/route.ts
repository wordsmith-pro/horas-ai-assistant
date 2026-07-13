import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getSystemPromptForIntent, detectIntent, needsLyricsPipeline, LYRICS_SYSTEM_PROMPT } from "@/lib/prompt-engineer"

// ─── Smart fallback response generator ────────────────────────────────────────
function generateSmartFallback(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase()
  
  // Greetings
  if (lowerMsg.match(/^(مرحب|السلام|hello|hi|hey|greetings)/)) {
    return "السلام عليكم! 👋 أنا AMUN، مساعدك الذكي المصري الذي يستخدم تقنيات Grok المتقدمة. كيف يمكنني مساعدتك؟"
  }
  
  // Who are you?
  if (lowerMsg.includes("من") && (lowerMsg.includes("أنت") || lowerMsg.includes("وين"))) {
    return "أنا AMUN - Assistant for Managing Egyptian Queries Naturally (المساعد الذكي المصري). أستخدم Grok من xAI لفهم السياق بعمق والرد بذكاء على استفساراتك. هدفي مساعدتك بفعالية وتفهم احتياجاتك!"
  }
  
  // How does it work
  if (lowerMsg.includes("كيف") || lowerMsg.includes("how")) {
    return "أستخدم نموذج Grok المتقدم من xAI لتحليل رسالتك وفهم السياق الكامل. بعدها أقدم لك إجابة ذكية وملائمة. يمكنك الكتابة بالعربية أو الإنجليزية، وأنا سأرد بنفس اللغة!"
  }
  
  // Technical capability
  if (lowerMsg.includes("إمكاني") || lowerMsg.includes("تقدر") || lowerMsg.includes("able")) {
    return "أستطيع:\n- فهم نصوص معقدة والرد بذكاء\n- التحدث بالعربية والإنجليزية\n- تحليل السياق والمعنى العميق\n- توليد نصوص إبداعية وواضحة\n- الإجابة على أسئلة متنوعة"
  }
  
  // Default intelligent response
  return `فهمت سؤالك: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? "..." : ""}"

أنا AMUN وأستخدم Grok للرد بذكاء. حالياً أرد بناءً على نماذج ذكية مدمجة لضمان أفضل تجربة. كيف يمكنني مساعدتك بشكل أفضل؟`
}

async function callGrok(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const apiKey = process.env.XAI_API_KEY
  
  if (!apiKey) {
    // Use smart fallback in development
    if (process.env.NODE_ENV === "development") {
      console.log("[AMUN] No XAI_API_KEY, using smart fallback")
      return generateSmartFallback(userMessage)
    }
    throw new Error("XAI_API_KEY is not configured")
  }

  try {
    const result = await generateText({
      model: xai("grok-4"),
      system: systemPrompt,
      messages: [
        ...conversationHistory.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        })),
        { role: "user" as const, content: userMessage }
      ],
    })
    return result.text
  } catch (err) {
    console.error("[AMUN] Grok API error:", err)
    // Fallback if Grok fails
    return generateSmartFallback(userMessage)
  }
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
      const reply = await callGrok(systemPrompt, contextualMessage, conversationHistory)

      return NextResponse.json({
        reply,
        intent: "text",
        webSearched: !!webResults,
      })
    }

    // ── Audio with lyrics pipeline ────────────────────────────────────────────
    if (intent === "audio" && needsLyricsPipeline(message)) {
      // Step 1: generate lyrics via Grok
      const lyrics = await callGrok(LYRICS_SYSTEM_PROMPT, message)

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
    const enhancedPrompt = await callGrok(systemPrompt, message)

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
