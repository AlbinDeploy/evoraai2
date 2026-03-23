import { createHash, randomBytes } from 'crypto';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export function randomToken(size = 32) {
  return randomBytes(size).toString('hex');
}

export function truncate(text: string, length = 80) {
  return text.length <= length ? text : `${text.slice(0, length - 1)}…`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
