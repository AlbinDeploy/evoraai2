import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evora AI',
  description: 'AI workspace clean, simpel, dan aman.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
