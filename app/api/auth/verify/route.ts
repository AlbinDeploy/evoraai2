import { and, eq, isNull, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authTokens, users } from '@/db/schema';
import { sha256 } from '@/lib/utils';
import { getRequestIp } from '@/lib/request';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const ip = await getRequestIp();
  const [record] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, sha256(token)), eq(authTokens.type, 'email_verify'), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .limit(1);

  if (!record) {
    await writeAuditLog({ action: 'verify_email', status: 'fail', ip, detail: { reason: 'invalid_token' } });
    return new Response('Token verifikasi tidak valid atau expired.', { status: 400 });
  }

  await db.update(users).set({ emailVerified: true, updatedAt: new Date() }).where(eq(users.id, record.userId));
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, record.id));
  await writeAuditLog({ action: 'verify_email', status: 'success', userId: record.userId, ip });
  return NextResponse.redirect(new URL('/chat?verified=1', request.url));
}
