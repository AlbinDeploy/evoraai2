import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { FormInput } from '@/components/form-input';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Masuk dulu" subtitle="Login aman dan simpel.">
        <form action="/api/auth/login" method="post" className="space-y-4">
          <FormInput label="Email" name="email" type="email" required />
          <FormInput label="Password" name="password" type="password" required />
          <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">Login</button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-zinc-400">
          <Link href="/register">Belum punya akun?</Link>
          <Link href="/forgot-password">Lupa password?</Link>
        </div>
      </AuthCard>
    </main>
  );
}
