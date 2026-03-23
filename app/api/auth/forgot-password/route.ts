import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { createAuthToken } from '@/lib/token';
import { sendMail } from '@/lib/mailer';
import { env } from '@/lib/env';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/enforce-rate-limit';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const ip = await getRequestIp();

  await enforceRateLimit({ action: 'forgot_password_ip', ip, limit: 8, windowMs: 10 * 60 * 1000 });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const raw = await createAuthToken(user.id, 'password_reset', 2);
    const resetUrl = `${env.APP_URL}/reset-password/${raw}`;
    await sendMail({
      to: email,
      subject: 'Reset password Evora AI',
      html: `<div style="font-family:Arial,sans-serif"><h2>Reset password</h2><p>Klik link ini buat ganti password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link berlaku 2 jam.</p></div>`,
    });
    await writeAuditLog({ action: 'reset_password_request', status: 'success', userId: user.id, ip, detail: { email } });
  }

  return NextResponse.redirect(new URL('/login?reset=sent', request.url));
}
