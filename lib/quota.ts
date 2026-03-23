import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { env } from '@/lib/env';

function isNewDay(lastResetAt: Date) {
  const now = new Date();
  return lastResetAt.toDateString() !== now.toDateString();
}

export async function refreshUserQuota(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User tidak ditemukan.');
  if (isNewDay(new Date(user.lastQuotaResetAt))) {
    await db
      .update(users)
      .set({
        dailyChatCount: 0,
        dailyUploadBytes: 0,
        lastQuotaResetAt: new Date(),
      })
      .where(eq(users.id, userId));
    return { ...user, dailyChatCount: 0, dailyUploadBytes: 0 };
  }
  return user;
}

export async function ensureChatQuota(userId: string) {
  const user = await refreshUserQuota(userId);
  if (user.dailyChatCount >= env.FREE_DAILY_CHAT_LIMIT) {
    throw new Error('Quota chat harian habis. Balik lagi besok ya.');
  }
}

export async function ensureUploadQuota(userId: string, uploadBytes: number) {
  const user = await refreshUserQuota(userId);
  if (user.dailyUploadBytes + uploadBytes > env.FREE_DAILY_UPLOAD_BYTES) {
    throw new Error('Quota upload harian habis.');
  }
  if (uploadBytes > env.MAX_UPLOAD_BYTES) {
    throw new Error('File terlalu besar.');
  }
}
