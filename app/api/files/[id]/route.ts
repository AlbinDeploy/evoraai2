import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { files } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { getRequestIp } from '@/lib/request';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const ip = await getRequestIp();
  const { id } = await params;
  await db.delete(files).where(and(eq(files.id, id), eq(files.userId, user.id)));
  await writeAuditLog({ action: 'delete_file', status: 'success', userId: user.id, ip, detail: { fileId: id } });
  return Response.json({ ok: true });
}
