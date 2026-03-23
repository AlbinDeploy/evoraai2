import { AuthCard } from '@/components/auth-card';
import { FormInput } from '@/components/form-input';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Reset password" subtitle="Kami kirim link reset ke email kamu.">
        <form action="/api/auth/forgot-password" method="post" className="space-y-4">
          <FormInput label="Email" name="email" type="email" required />
          <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">Kirim link reset</button>
        </form>
      </AuthCard>
    </main>
  );
}
