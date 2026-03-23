'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '@/components/auth-card';
import { FormInput } from '@/components/form-input';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (response.redirected) {
        router.push(response.url);
        return;
      }

      if (response.ok) {
        router.push('/chat?welcome=1');
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      const message = contentType.includes('application/json')
        ? (await response.json())?.error || 'Register gagal.'
        : await response.text();

      setError(message || 'Register gagal.');
    } catch {
      setError('Terjadi kesalahan saat register.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Bikin akun Evora" subtitle="Email verification real, bukan dummy.">
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput label="Username" name="username" required minLength={3} maxLength={30} />
          <FormInput label="Email" name="email" type="email" required />
          <FormInput label="Password" name="password" type="password" required minLength={8} />

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-400">
          Sudah punya akun? <Link href="/login">Login</Link>
        </div>
      </AuthCard>
    </main>
  );
}
