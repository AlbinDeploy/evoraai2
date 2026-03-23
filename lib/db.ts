import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing. Database routes will fail until it is set.');
}

const sql = neon(process.env.DATABASE_URL ?? 'postgres://invalid');
export const db = drizzle(sql, { schema });
