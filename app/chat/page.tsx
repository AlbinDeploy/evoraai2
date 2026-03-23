import { desc, eq } from 'drizzle-orm';
import { ChatShell } from '@/components/chat-shell';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { chats } from '@/db/schema';

export default async function ChatPage() {
  const user = await requireUser();
  const initialChats = await db.select({ id: chats.id, title: chats.title }).from(chats).where(eq(chats.userId, user.id)).orderBy(desc(chats.updatedAt));
  return <ChatShell initialChats={initialChats} />;
}
