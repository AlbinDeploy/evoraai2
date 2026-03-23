import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema';

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  status: 'success' | 'fail';
  ip?: string | null;
  detail?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    userId: input.userId ?? null,
    action: input.action,
    status: input.status,
    ip: input.ip ?? null,
    detail: input.detail ?? {},
  });
}
