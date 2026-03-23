import { asc, and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chats, chatMessages } from '@/db/schema';
import { requireUser } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [chat] = await db.select().from(chats).where(and(eq(chats.id, id), eq(chats.userId, user.id))).limit(1);
  if (!chat) return Response.json({ messages: [] });
  const messages = await db.select({ id: chatMessages.id, role: chatMessages.role, content: chatMessages.content }).from(chatMessages).where(eq(chatMessages.chatId, id)).orderBy(asc(chatMessages.createdAt));
  return Response.json({ messages });
}
