import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { createSession, hashPassword } from '@/lib/auth';
import { env } from '@/lib/env';
import { createAuthToken } from '@/lib/token';
import { sendMail } from '@/lib/mailer';
import { getRequestIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/enforce-rate-limit';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const username = String(form.get('username') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const ip = await getRequestIp();

    console.log('REGISTER_1_INPUT_OK', { username, email, ip });

    await enforceRateLimit({
      action: 'register_ip',
      ip,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });

    console.log('REGISTER_2_RATE_LIMIT_OK');

    if (username.length < 3 || password.length < 8 || !email.includes('@')) {
      await writeAuditLog({
        action: 'register',
        status: 'fail',
        ip,
        detail: { email, reason: 'validation' },
      });

      return NextResponse.json(
        { error: 'Data register tidak valid.' },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    console.log('REGISTER_3_DUPLICATE_CHECK_OK');

    if (existing) {
      await writeAuditLog({
        action: 'register',
        status: 'fail',
        ip,
        detail: { email, reason: 'duplicate' },
      });

      return NextResponse.json(
        { error: 'Email atau username sudah dipakai.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    console.log('REGISTER_4_HASH_OK');

    const role = env.ADMIN_EMAILS?.split(',')
      .map((item) => item.trim())
      .includes(email)
      ? 'admin'
      : 'user';

    const [user] = await db
      .insert(users)
      .values({
        email,
        username,
        passwordHash,
        role,
      })
      .returning();

    console.log('REGISTER_5_USER_CREATED', { userId: user.id });

    const verifyToken = await createAuthToken(user.id, 'email_verify', 24);
    const verifyUrl = `${env.APP_URL}/api/auth/verify?token=${verifyToken}`;

    console.log('REGISTER_6_TOKEN_CREATED');

    await sendMail({
      to: email,
      subject: 'Verify email Evora AI',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verifikasi email kamu</h2>
          <p>Klik tombol ini buat aktifin akun:</p>
          <p>
            <a
              href="${verifyUrl}"
              style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:12px"
            >
              Verifikasi Email
            </a>
          </p>
          <p>Link berlaku 24 jam.</p>
        </div>
      `,
    });

    console.log('REGISTER_7_MAIL_SENT');

    await writeAuditLog({
      action: 'register',
      status: 'success',
      userId: user.id,
      ip,
      detail: { email },
    });

    console.log('REGISTER_8_AUDIT_OK');

    await createSession({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('REGISTER_9_SESSION_OK');

    return NextResponse.json({
      ok: true,
      redirectTo: '/chat?welcome=1',
    });
  } catch (error) {
    console.error('REGISTER_ERROR', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat register.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to register.' },
    { status: 405 }
  );
}
