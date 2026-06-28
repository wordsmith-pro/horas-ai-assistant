import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversations } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/horas/ChatInterface"

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const userId = session.user.id

  const userConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))

  return (
    <ChatInterface
      user={{
        id: userId,
        name: session.user.name,
        email: session.user.email,
      }}
      initialConversations={userConversations}
    />
  )
}
