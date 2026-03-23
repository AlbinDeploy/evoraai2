import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chats } from '@/db/schema';
import { requireUser } from '@/lib/auth';

export async function POST() {
  const user = await requireUser();
  const [chat] = await db.insert(chats).values({ userId: user.id, title: 'New Chat' }).returning();
  return Response.json({ chat });
}

export async function GET() {
  const user = await requireUser();
  const data = await db.select().from(chats).where(eq(chats.userId, user.id)).orderBy(desc(chats.updatedAt));
  return Response.json({ chats: data });
}
