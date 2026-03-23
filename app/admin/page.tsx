import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/db/schema';

export default async function AdminPage() {
  await requireAdmin();
  const [userCount] = await db.select({ value: count() }).from(users);
  const [verifiedCount] = await db.select({ value: count() }).from(users).where(eq(users.emailVerified, true));
  const recentLogs = await db.select().from(auditLogs).limit(20);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Admin mini panel</h1>
        <Link href="/chat" className="rounded-2xl border border-white/10 px-4 py-2 text-sm">Balik ke chat</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">Total user: {userCount?.value ?? 0}</div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">Email verified: {verifiedCount?.value ?? 0}</div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">Recent audit log: {recentLogs.length}</div>
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-zinc-400">
            <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">At</th></tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id} className="border-t border-white/10">
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.status}</td>
                <td className="px-4 py-3">{log.ip}</td>
                <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
