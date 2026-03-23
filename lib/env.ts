import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  GEMINI_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().email(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  APP_URL: z.string().url(),
  ADMIN_EMAILS: z.string().optional(),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  FREE_DAILY_CHAT_LIMIT: z.coerce.number().int().positive().default(35),
  FREE_DAILY_UPLOAD_BYTES: z.coerce.number().int().positive().default(15 * 1024 * 1024),
  FREE_MAX_FILES_PER_CHAT: z.coerce.number().int().positive().default(4),
});

export const env = envSchema.parse(process.env);
