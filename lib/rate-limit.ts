import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rateLimits } from '@/db/schema';

export async function enforceRateLimit(input: {
  action: string;
  ip?: string | null;
  userId?: string | null;
  limit: number;
  windowMs: number;
}) {
  const keyIp = input.ip ?? null;
  const keyUser = input.userId ?? null;
  const [row] = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.action, input.action), eq(rateLimits.ip, keyIp), eq(rateLimits.userId, keyUser)))
    .limit(1);

  const now = Date.now();
  if (!row) {
    await db.insert(rateLimits).values({
      action: input.action,
      ip: keyIp,
      userId: keyUser,
      count: 1,
      windowStart: new Date(now),
    });
    return;
  }

  const startedAt = new Date(row.windowStart).getTime();
  if (now - startedAt >= input.windowMs) {
    await db.update(rateLimits).set({ count: 1, windowStart: new Date(now) }).where(eq(rateLimits.id, row.id));
    return;
  }

  if (row.count >= input.limit) {
    throw new Error('Too many requests. Coba lagi sebentar.');
  }

  await db.update(rateLimits).set({ count: row.count + 1 }).where(eq(rateLimits.id, row.id));
}
