import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { FormInput } from '@/components/form-input';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Bikin akun Evora" subtitle="Email verification real, bukan dummy.">
        <form action="/api/auth/register" method="post" className="space-y-4">
          <FormInput label="Username" name="username" required minLength={3} maxLength={30} />
          <FormInput label="Email" name="email" type="email" required />
          <FormInput label="Password" name="password" type="password" required minLength={8} />
          <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">Register</button>
        </form>
        <div className="mt-4 text-sm text-zinc-400">
          Sudah punya akun? <Link href="/login">Login</Link>
        </div>
      </AuthCard>
    </main>
  );
}
