import { AuthCard } from '@/components/auth-card';
import { FormInput } from '@/components/form-input';

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Password baru" subtitle="Gas ganti password lama.">
        <form action="/api/auth/reset-password" method="post" className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <FormInput label="Password baru" name="password" type="password" required minLength={8} />
          <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">Simpan password</button>
        </form>
      </AuthCard>
    </main>
  );
}
