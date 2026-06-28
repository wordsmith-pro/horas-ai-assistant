import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversations, messages } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
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
      .values({ id, userId, title })
      .returning()
    return NextResponse.json(conv, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
