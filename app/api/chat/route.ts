import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chatMessages, chats, files, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { ensureChatQuota } from '@/lib/quota';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/rate-limit';
import { generateChatResponse } from '@/lib/gemini';
import { truncate } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await requireUser();
  const ip = await getRequestIp();
  await enforceRateLimit({ action: 'chat_ip', ip, userId: user.id, limit: 40, windowMs: 10 * 60 * 1000 });
  await ensureChatQuota(user.id);

  const { chatId, prompt, regenerate } = await request.json();
  const [chat] = await db.select().from(chats).where(and(eq(chats.id, chatId), eq(chats.userId, user.id))).limit(1);
  if (!chat) return Response.json({ error: 'Chat tidak ditemukan.' }, { status: 404 });

  if (!regenerate && !String(prompt ?? '').trim()) {
    return Response.json({ error: 'Prompt kosong.' }, { status: 400 });
  }

  const history = await db.select().from(chatMessages).where(eq(chatMessages.chatId, chatId)).orderBy(asc(chatMessages.createdAt));
  const recentFiles = await db.select().from(files).where(and(eq(files.userId, user.id), eq(files.chatId, chatId))).orderBy(desc(files.createdAt));

  if (!regenerate) {
    await db.insert(chatMessages).values({
      chatId,
      role: 'user',
      content: String(prompt),
      parts: [],
    });
  }

  const compiledPrompt = [
    ...history.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`),
    !regenerate ? `USER: ${String(prompt)}` : 'USER: Please regenerate the previous answer with a better version.',
  ].join('\n\n');

  const responseText = await generateChatResponse({
    prompt: compiledPrompt,
    fileParts: recentFiles.map((file) => ({
      name: file.name,
      mimeType: file.mimeType,
      base64Data: file.base64Data,
      extractedText: file.extractedText,
    })),
  });

  await db.insert(chatMessages).values({ chatId, role: 'assistant', content: responseText, parts: [] });
  await db.update(users).set({ dailyChatCount: user.dailyChatCount + 1, updatedAt: new Date() }).where(eq(users.id, user.id));
  if (chat.title === 'New Chat' && !regenerate) {
    await db.update(chats).set({ title: truncate(String(prompt), 60), updatedAt: new Date() }).where(eq(chats.id, chatId));
  } else {
    await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));
  }

  const messages = await db.select({ id: chatMessages.id, role: chatMessages.role, content: chatMessages.content }).from(chatMessages).where(eq(chatMessages.chatId, chatId)).orderBy(asc(chatMessages.createdAt));
  return Response.json({ messages, chatTitle: chat.title === 'New Chat' && !regenerate ? truncate(String(prompt), 60) : chat.title });
}
