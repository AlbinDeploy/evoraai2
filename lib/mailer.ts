import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendMail(params: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
