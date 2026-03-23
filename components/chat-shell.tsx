'use client';

import { useEffect, useMemo, useState } from 'react';

type Chat = { id: string; title: string };
type Message = { id: string; role: string; content: string };
type UploadedFile = { id: string; name: string; mimeType: string; sizeBytes: number; status: string; extractedText?: string | null };

function downloadBlob(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ChatShell({ initialChats }: { initialChats: Chat[] }) {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0]?.id ?? '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const activeChat = useMemo(() => chats.find((item) => item.id === activeChatId), [chats, activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;
    void fetch(`/api/chats/${activeChatId}/messages`).then(async (res) => {
      const data = await res.json();
      setMessages(data.messages ?? []);
    });
  }, [activeChatId]);

  async function createChat() {
    const res = await fetch('/api/chats', { method: 'POST' });
    const data = await res.json();
    setChats((prev) => [data.chat, ...prev]);
    setActiveChatId(data.chat.id);
    setMessages([]);
    setFiles([]);
  }

  async function renameChat() {
    if (!activeChatId) return;
    const title = window.prompt('Nama chat baru:', activeChat?.title ?? '');
    if (!title) return;
    await fetch(`/api/chats/${activeChatId}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setChats((prev) => prev.map((item) => (item.id === activeChatId ? { ...item, title } : item)));
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || !activeChatId) return;
    const body = new FormData();
    body.append('chatId', activeChatId);
    Array.from(fileList).forEach((file) => body.append('files', file));
    const res = await fetch('/api/files/upload', { method: 'POST', body });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Upload gagal');
      return;
    }
    setFiles(data.files);
  }

  async function sendPrompt(regenerate = false) {
    if (!activeChatId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChatId, prompt, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat gagal');
      setMessages(data.messages);
      if (data.chatTitle) {
        setChats((prev) => prev.map((item) => (item.id === activeChatId ? { ...item, title: data.chatTitle } : item)));
      }
      if (!regenerate) setPrompt('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[300px_1fr]">
      <aside className="border-r border-white/10 bg-zinc-950/80 p-4">
        <button onClick={createChat} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">+ Chat baru</button>
        <div className="mt-4 space-y-2">
          {chats.map((chat) => (
            <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${activeChatId === chat.id ? 'bg-white text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}>
              {chat.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="text-lg font-semibold">{activeChat?.title ?? 'Evora AI'}</div>
            <div className="text-sm text-zinc-400">Bahasa gaul secukupnya, tetap berguna.</div>
          </div>
          <button onClick={renameChat} className="rounded-2xl border border-white/10 px-4 py-2 text-sm">Rename chat</button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-3xl rounded-3xl border px-4 py-3 ${msg.role === 'assistant' ? 'border-white/10 bg-white/5' : 'ml-auto border-emerald-500/20 bg-emerald-500/10'}`}>
              <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">{msg.role}</div>
              <pre className="whitespace-pre-wrap text-sm text-zinc-100">{msg.content}</pre>
              {msg.role === 'assistant' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => navigator.clipboard.writeText(msg.content)} className="rounded-xl border border-white/10 px-3 py-2 text-xs">Copy</button>
                  <button onClick={() => downloadBlob('evora-response.txt', msg.content)} className="rounded-xl border border-white/10 px-3 py-2 text-xs">Download .txt</button>
                  <button onClick={() => window.print()} className="rounded-xl border border-white/10 px-3 py-2 text-xs">Export PDF</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <div className="mb-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-medium">File preview</div>
                <div className="text-xs text-zinc-400">Nama, ukuran, tipe, dan status parse sebelum dipakai AI.</div>
              </div>
              <input type="file" multiple onChange={(e) => void uploadFiles(e.target.files)} className="max-w-[220px] text-xs text-zinc-400" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-white/10 p-3 text-sm">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-zinc-400">{file.mimeType}</div>
                  <div className="text-zinc-400">{Math.round(file.sizeBytes / 1024)} KB • {file.status}</div>
                </div>
              ))}
            </div>
          </div>

          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} placeholder="Tanya apa aja. Bisa coding, analisis dokumen, atau gambar." className="w-full rounded-3xl border border-white/10 bg-black/30 p-4 text-sm placeholder:text-zinc-500" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button disabled={loading || !prompt.trim()} onClick={() => void sendPrompt(false)} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50">{loading ? 'Loading...' : 'Kirim'}</button>
            <button disabled={loading || messages.length === 0} onClick={() => void sendPrompt(true)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm disabled:opacity-50">Retry / regenerate</button>
          </div>
        </div>
      </main>
    </div>
  );
}
