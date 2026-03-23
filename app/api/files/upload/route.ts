import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chats, files, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { ensureUploadQuota } from '@/lib/quota';
import { env } from '@/lib/env';
import { classifyFile, extractTextFromFile } from '@/lib/file-parser';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/rate-limit';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const user = await requireUser();
  const ip = await getRequestIp();
  await enforceRateLimit({ action: 'upload_ip', ip, userId: user.id, limit: 20, windowMs: 10 * 60 * 1000 });

  const form = await request.formData();
  const chatId = String(form.get('chatId') ?? '');
  const incomingFiles = form.getAll('files').filter((item): item is File => item instanceof File);

  const [chat] = await db.select().from(chats).where(and(eq(chats.id, chatId), eq(chats.userId, user.id))).limit(1);
  if (!chat) return Response.json({ error: 'Chat tidak ditemukan.' }, { status: 404 });

  const [fileCountRow] = await db.select({ total: count() }).from(files).where(eq(files.chatId, chatId));
  if ((fileCountRow?.total ?? 0) + incomingFiles.length > env.FREE_MAX_FILES_PER_CHAT) {
    return Response.json({ error: 'Jumlah file per chat melebihi limit free.' }, { status: 400 });
  }

  let totalBytes = 0;
  for (const file of incomingFiles) totalBytes += file.size;
  await ensureUploadQuota(user.id, totalBytes);

  const uploaded = [];
  for (const file of incomingFiles) {
    const extractedText = await extractTextFromFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const [saved] = await db.insert(files).values({
      userId: user.id,
      chatId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      kind: classifyFile(file) as 'image' | 'document' | 'text' | 'other',
      base64Data: buffer.toString('base64'),
      extractedText,
      status: extractedText || file.type.startsWith('image/') ? 'parsed' : 'stored',
    }).returning({ id: files.id, name: files.name, mimeType: files.mimeType, sizeBytes: files.sizeBytes, status: files.status, extractedText: files.extractedText });
    uploaded.push(saved);
  }

  await db.update(users).set({ dailyUploadBytes: user.dailyUploadBytes + totalBytes, updatedAt: new Date() }).where(eq(users.id, user.id));
  await writeAuditLog({ action: 'upload_file', status: 'success', userId: user.id, ip, detail: { count: uploaded.length, chatId } });

  const recentFiles = await db.select({ id: files.id, name: files.name, mimeType: files.mimeType, sizeBytes: files.sizeBytes, status: files.status, extractedText: files.extractedText }).from(files).where(and(eq(files.userId, user.id), eq(files.chatId, chatId))).orderBy(desc(files.createdAt));
  return Response.json({ files: recentFiles });
}
