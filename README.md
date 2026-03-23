# Evora AI

AI workspace clean dan simpel berbasis **Next.js App Router + Vercel + Neon + Gemini**.

## Fitur utama

- Login, register, email verification real
- Reset password real via email
- Chat AI dengan Gemini
- Upload foto, PDF, TXT, JSON, MD
- Preview file sebelum dipakai AI
- Analisis gambar dan baca isi dokumen
- Chat history + rename chat
- Retry / regenerate response
- Copy code + download `.txt` + export PDF via print browser
- Rate limit per user + per IP
- Quota harian free user
- Audit log basic
- Mini admin panel
- Safety guard untuk prompt injection dari file

## Tech stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Neon Postgres
- Drizzle ORM
- Gemini API (`@google/genai`)
- Nodemailer SMTP untuk email verification & reset password

## Kenapa SMTP generic?

Supaya email verification dan reset password tetap **real** dan fleksibel. Untuk versi gratis, paling gampang pakai:

- Brevo SMTP free
- MailerSend free tier
- Zoho Mail SMTP

## Setup lokal

1. Copy env:

```bash
cp .env.example .env.local
```

2. Isi semua variable.

3. Install dependency:

```bash
npm install
```

4. Push schema ke Neon:

```bash
npm run db:push
```

5. Jalankan lokal:

```bash
npm run dev
```

## Deploy ke Vercel

1. Push project ke GitHub.
2. Import repo ke Vercel.
3. Tambahkan semua env dari `.env.example` di **Project Settings → Environment Variables**.
4. Redeploy setelah env lengkap.

## Catatan penting deploy

- Jangan simpan file upload di local disk Vercel, karena ephemeral.
- Versi ini menyimpan file kecil langsung ke database untuk menjaga deploy tetap sederhana di Neon free.
- Untuk scale lebih besar, pindah file storage ke Vercel Blob / S3-compatible storage.
- Kalau ingin export PDF server-side yang proper, tambahkan renderer terpisah. Versi ini pakai print browser agar tetap ringan.

## Rekomendasi tambahan kalau mau naik kelas

- Tambah Redis/Upstash untuk rate limit yang lebih kencang
- Tambah Vercel Blob untuk file storage
- Tambah streaming response Gemini
- Tambah moderation layer
- Tambah queue email
- Tambah billing/plan system

## Struktur penting

- `app/api/auth/*` → auth, verify, reset password
- `app/api/chat` → panggil Gemini + simpan history
- `app/api/files/upload` → upload + preview + parse file
- `app/admin` → mini admin panel
- `db/schema.ts` → schema Neon/Drizzle
- `middleware.ts` → security headers dasar

## Safety design

File diperlakukan sebagai **untrusted input**.

- Isi file tidak boleh override system instruction
- Kode dari file tidak pernah dijalankan otomatis
- File hanya dipakai sebagai data untuk dianalisis model
