import { and, eq, gt, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authTokens, users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { sha256 } from '@/lib/utils';
import { getRequestIp } from '@/lib/request';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  const password = String(form.get('password') ?? '');
  const ip = await getRequestIp();

  if (password.length < 8) {
    return new Response('Password minimal 8 karakter.', { status: 400 });
  }

  const [record] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, sha256(token)), eq(authTokens.type, 'password_reset'), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .limit(1);

  if (!record) {
    await writeAuditLog({ action: 'reset_password', status: 'fail', ip, detail: { reason: 'invalid_token' } });
    return new Response('Token reset tidak valid atau expired.', { status: 400 });
  }

  await db.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, record.userId));
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, record.id));
  await writeAuditLog({ action: 'reset_password', status: 'success', userId: record.userId, ip });
  return NextResponse.redirect(new URL('/login?reset=done', request.url));
}
