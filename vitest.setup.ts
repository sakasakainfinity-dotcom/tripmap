import '@testing-library/jest-dom/vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-key';
process.env.NEXT_PUBLIC_MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? 'maptiler-test-key';
