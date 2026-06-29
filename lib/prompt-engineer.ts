/**
 * AMUN Prompt Engineer
 * ────────────────────
 * Detects the intent of the user's message and crafts an optimised English
 * prompt for the relevant OpenRouter model. Also handles multi-step pipelines
 * (e.g. "write a song" → generate lyrics first, then audio).
 */

export type MediaIntent = "text" | "image" | "video" | "audio"

export interface IntentResult {
  intent: MediaIntent
  /** Translated + enhanced English prompt ready for the target model */
  enhancedPrompt: string
  /** Original message (may be Arabic / mixed) */
  originalMessage: string
  /** True when this is step 2 of a pipeline (e.g. lyrics already generated) */
  isPipelineStep?: boolean
  /** For pipeline: the intermediate text result (lyrics etc.) */
  pipelineText?: string
}

// ─── Keyword maps for intent detection ───────────────────────────────────────
const IMAGE_KEYWORDS = [
  // Arabic
  "صورة", "صور", "رسم", "ارسم", "صمم", "تصميم", "لوجو", "شعار",
  "توليد صورة", "ولد صورة", "عمل صورة", "اعمل صورة", "انشئ صورة",
  // English
  "image", "photo", "picture", "draw", "generate image", "create image",
  "illustration", "portrait", "logo", "design image", "artwork",
]

const VIDEO_KEYWORDS = [
  // Arabic
  "فيديو", "مقطع فيديو", "انيميشن", "متحرك", "كليب", "ولد فيديو",
  "اعمل فيديو", "صنع فيديو",
  // English
  "video", "animation", "clip", "movie", "generate video", "create video",
  "motion", "reel",
]

const AUDIO_KEYWORDS = [
  // Arabic
  "اغنية", "أغنية", "موسيقى", "صوت", "مقطع صوتي", "نغمة", "لحن",
  "مؤثر صوتي", "موسيقي", "غنوة", "انشيد", "ترنيمة", "توليد صوت",
  "موسيقى", "صوتيات",
  // English
  "song", "music", "audio", "sound", "melody", "beat", "track",
  "jingle", "sound effect", "generate music", "create song", "compose",
  "lyrics and music", "nasheed",
]

export function detectIntent(message: string): MediaIntent {
  const lower = message.toLowerCase()

  if (AUDIO_KEYWORDS.some((k) => lower.includes(k))) return "audio"
  if (VIDEO_KEYWORDS.some((k) => lower.includes(k))) return "video"
  if (IMAGE_KEYWORDS.some((k) => lower.includes(k))) return "image"
  return "text"
}

// ─── System prompts per modality ─────────────────────────────────────────────
export function getSystemPromptForIntent(intent: MediaIntent): string {
  switch (intent) {
    case "image":
      return `You are an expert image-generation prompt engineer. 
The user's request may be in Arabic or English. 
Translate it to English if needed and produce a detailed, vivid, high-quality image-generation prompt.
Return ONLY the enhanced English prompt — no explanations, no markdown.
Include: subject, style, lighting, colors, mood, camera angle, quality modifiers (8K, ultra-realistic, etc.).`

    case "video":
      return `You are an expert video-generation prompt engineer.
The user's request may be in Arabic or English.
Translate it to English if needed and produce a detailed video generation prompt.
Return ONLY the enhanced English prompt — no explanations.
Include: scene description, motion, style, duration hint, camera movement, mood, lighting.`

    case "audio":
      return `You are an expert music and audio prompt engineer.
The user's request may be in Arabic or English.
Translate it to English if needed and produce a detailed audio/music generation prompt.
Return ONLY the enhanced English prompt — no explanations.
Include: genre, mood, instruments, tempo (BPM), key, vocals style, language of lyrics, cultural influences, duration.`

    default:
      return `You are AMUN, an advanced Egyptian AI assistant — powerful, knowledgeable, and friendly.
You speak both Arabic and English fluently.
Always respond in the same language the user used.
If the user asks about current events or recent information, mention that you are searching the web and provide up-to-date information.
Be concise, accurate, and helpful.`
  }
}

// ─── Lyrics system prompt (for pipeline step 1) ───────────────────────────────
export const LYRICS_SYSTEM_PROMPT = `You are a talented bilingual songwriter and poet.
The user wants song lyrics. Write complete, expressive song lyrics based on the request.
Match the language and dialect requested (Egyptian Arabic, Modern Standard Arabic, English, etc.).
Include: verse 1, chorus, verse 2, chorus, bridge, final chorus.
Format the output as clean lyrics only — no explanations or metadata.`

// ─── Needs-pipeline check ─────────────────────────────────────────────────────
/**
 * Returns true when the request is for a song/audio AND clearly wants lyrics
 * to be composed first (as opposed to a pure instrumental or sound effect).
 */
export function needsLyricsPipeline(message: string): boolean {
  const lower = message.toLowerCase()
  const audioIntent = AUDIO_KEYWORDS.some((k) => lower.includes(k))
  const noLyricsSignals = ["instrumental", "موسيقى بحتة", "بدون كلمات", "مؤثر صوتي", "sound effect"]
  if (!audioIntent) return false
  if (noLyricsSignals.some((k) => lower.includes(k))) return false
  // If audio keyword found without explicit "no lyrics" signal → use pipeline
  return true
}
