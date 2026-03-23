import pdf from 'pdf-parse';

export async function extractTextFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'application/octet-stream';

  if (mime.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
    return buffer.toString('utf8').slice(0, 40_000);
  }

  if (mime === 'application/pdf' || file.name.endsWith('.pdf')) {
    const parsed = await pdf(buffer);
    return parsed.text.slice(0, 40_000);
  }

  return null;
}

export function classifyFile(file: File) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('text/')) return 'text';
  if (file.type === 'application/pdf') return 'document';
  if (file.name.endsWith('.pdf')) return 'document';
  return 'other';
}
