import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { createSession, verifyPassword } from '@/lib/auth';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/enforce-rate-limit';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const ip = await getRequestIp();

  await enforceRateLimit({ action: 'login_ip', ip, limit: 12, windowMs: 10 * 60 * 1000 });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await writeAuditLog({ action: 'login', status: 'fail', ip, detail: { email } });
    return new Response('Email atau password salah.', { status: 401 });
  }

  if (user.role === 'blocked') {
    return new Response('Akun diblokir admin.', { status: 403 });
  }

  await createSession({ sub: user.id, email: user.email, role: user.role });
  await writeAuditLog({ action: 'login', status: 'success', userId: user.id, ip, detail: { email } });
  return NextResponse.redirect(new URL('/chat', request.url));
}
