import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-xl font-semibold">Evora AI</div>
            <div className="text-sm text-zinc-400">Clean. Simpel. Berasa premium.</div>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-2xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Login</Link>
            <Link href="/register" className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black">Register</Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Designed to help humans, not replace them.</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight">AI design clean, simpel, login aman, upload file, coding mode, dan export hasil.</h1>
            <p className="max-w-2xl text-lg text-zinc-400">Stack ini dibikin buat Next.js + Vercel + Neon + Gemini. Sudah ada auth lengkap, email verification real, reset password real, quota, rate limit, audit log, basic admin, chat history, rename chat, retry, preview file, dan safety guard untuk prompt injection file.</p>
            <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
              {['Gemini', 'Neon', 'Vercel Ready', 'Email Verification', 'Reset Password', 'Rate Limit', 'File Analysis'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
            <div className="text-sm text-zinc-400">Included</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-200">
              <li>• Login, register, verify email, reset password</li>
              <li>• Upload foto dan dokumen + preview status parse</li>
              <li>• Chat history, rename chat, retry/regenerate</li>
              <li>• Copy code, download .txt, export PDF sederhana</li>
              <li>• Rate limit per IP + per user</li>
              <li>• Usage quota harian free tier</li>
              <li>• Audit log + mini admin panel</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
