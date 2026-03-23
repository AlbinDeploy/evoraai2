@'
export async function enforceRateLimit(_: {
  action: string;
  ip?: string | null;
  userId?: string | null;
  limit: number;
  windowMs: number;
}) {
  return;
}
'@ | Set-Content -Encoding UTF8 lib/enforce-rate-limit.ts
