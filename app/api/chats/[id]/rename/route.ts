import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chats } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { truncate } from '@/lib/utils';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { title } = await request.json();
  await db.update(chats).set({ title: truncate(String(title ?? '').trim() || 'New Chat', 140), updatedAt: new Date() }).where(and(eq(chats.id, id), eq(chats.userId, user.id)));
  return Response.json({ ok: true });
}
