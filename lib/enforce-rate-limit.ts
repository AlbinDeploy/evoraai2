export async function enforceRateLimit(_: {
  action: string;
  ip?: string | null;
  userId?: string | null;
  limit: number;
  windowMs: number;
}) {
  return;
}
