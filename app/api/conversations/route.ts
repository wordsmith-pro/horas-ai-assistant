import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversations, messages } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.id) {
    return session.user.id
  }
  
  // For localhost testing without auth
  const headersList = await headers()
  const host = headersList.get("host") || ""
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    console.log("[v0] Localhost demo mode: using test user ID")
    return "test-user-dev-" + Date.now()
  }
  
  throw new Error("Unauthorized")
}

// GET /api/conversations — list all conversations
export async function GET() {
  try {
    const userId = await getUserId()
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
    return NextResponse.json(convs)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// POST /api/conversations — create new conversation
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    const { title = "New Conversation" } = await req.json().catch(() => ({}))
    const id = randomUUID()
    const [conv] = await db
      .insert(conversations)
      .values({ id, userId, title, createdAt: new Date(), updatedAt: new Date() })
      .returning()
    return NextResponse.json(conv, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
