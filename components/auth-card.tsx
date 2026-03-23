export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
