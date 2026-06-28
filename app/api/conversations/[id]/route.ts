import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversations, messages } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

// GET /api/conversations/[id] — get messages for a conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params

    // Verify ownership
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const msgs = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, id), eq(messages.userId, userId)))
      .orderBy(asc(messages.createdAt))

    return NextResponse.json({ conversation: conv, messages: msgs })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST /api/conversations/[id] — add a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const { role, content, mediaType, mediaUrl, mediaMeta } = await req.json()

    // Verify ownership
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const msgId = randomUUID()
    const [msg] = await db
      .insert(messages)
      .values({ id: msgId, conversationId: id, userId, role, content, mediaType, mediaUrl, mediaMeta })
      .returning()

    // Update conversation updatedAt & title if first user message
    if (role === "user" && conv.title === "New Conversation") {
      const shortTitle = content.slice(0, 60)
      await db
        .update(conversations)
        .set({ title: shortTitle, updatedAt: new Date() })
        .where(eq(conversations.id, id))
    } else {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, id))
    }

    return NextResponse.json(msg, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}

// DELETE /api/conversations/[id] — delete a conversation
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params

    await db
      .delete(messages)
      .where(and(eq(messages.conversationId, id), eq(messages.userId, userId)))

    await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
