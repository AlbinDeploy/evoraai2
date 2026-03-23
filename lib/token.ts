import { addHours } from '@/lib/time';
import { db } from '@/lib/db';
import { authTokens } from '@/db/schema';
import { randomToken, sha256 } from '@/lib/utils';

export async function createAuthToken(userId: string, type: 'email_verify' | 'password_reset', ttlHours: number) {
  const raw = randomToken(24);
  await db.insert(authTokens).values({
    userId,
    type,
    tokenHash: sha256(raw),
    expiresAt: addHours(ttlHours),
  });
  return raw;
}
