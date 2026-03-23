import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authTokens, users } from '@/db/schema';
import { createSession, hashPassword } from '@/lib/auth';
import { env } from '@/lib/env';
import { createAuthToken } from '@/lib/token';
import { sendMail } from '@/lib/mailer';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/enforce-rate-limit';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get('username') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const ip = await getRequestIp();

  await enforceRateLimit({ action: 'register_ip', ip, limit: 8, windowMs: 10 * 60 * 1000 });

  if (username.length < 3 || password.length < 8 || !email.includes('@')) {
    await writeAuditLog({ action: 'register', status: 'fail', ip, detail: { email, reason: 'validation' } });
    return new Response('Data register tidak valid.', { status: 400 });
  }

  const [existing] = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);
  if (existing) {
    await writeAuditLog({ action: 'register', status: 'fail', ip, detail: { email, reason: 'duplicate' } });
    return new Response('Email atau username sudah dipakai.', { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const role = env.ADMIN_EMAILS?.split(',').map((item) => item.trim()).includes(email) ? 'admin' : 'user';
  const [user] = await db.insert(users).values({ email, username, passwordHash, role }).returning();
  const verifyToken = await createAuthToken(user.id, 'email_verify', 24);
  const verifyUrl = `${env.APP_URL}/api/auth/verify?token=${verifyToken}`;

  await sendMail({
    to: email,
    subject: 'Verify email Evora AI',
    html: `<div style="font-family:Arial,sans-serif"><h2>Verifikasi email kamu</h2><p>Klik tombol ini buat aktifin akun:</p><p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:12px">Verifikasi Email</a></p><p>Link berlaku 24 jam.</p></div>`,
  });

  await writeAuditLog({ action: 'register', status: 'success', userId: user.id, ip, detail: { email } });
  await createSession({ sub: user.id, email: user.email, role: user.role });
  return NextResponse.redirect(new URL('/chat?welcome=1', request.url));
}
