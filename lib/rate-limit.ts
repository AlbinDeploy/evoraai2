import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rateLimits } from '@/db/schema';

type RateLimitInput = {
  action: string;
  ip?: string | null;
  userId?: string | null;
};

export async function getRateLimitRow(input: RateLimitInput) {
  const [row] = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.action, input.action),
        input.ip === undefined
          ? undefined
          : input.ip === null
            ? isNull(rateLimits.ip)
            : eq(rateLimits.ip, input.ip),
        input.userId === undefined
          ? undefined
          : input.userId === null
            ? isNull(rateLimits.userId)
            : eq(rateLimits.userId, input.userId),
      ),
    )
    .limit(1);

  return row ?? null;
}
