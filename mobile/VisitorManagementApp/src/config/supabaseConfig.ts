/**
 * Supabase URL and anon key for VMS mobile app.
 * - Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (Expo loads these).
 * - Or for React Native CLI: paste your values below as fallback (do not commit real keys to git).
 */
const fromEnv =
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_URL: string = fromEnv
  ? (process.env.EXPO_PUBLIC_SUPABASE_URL as string)
  : ''; // Paste your URL here if not using .env, e.g. 'https://ibuskfesyzvyruhudvvr.supabase.co'

export const SUPABASE_ANON_KEY: string = fromEnv
  ? (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string)
  : ''; // Paste your anon key here if not using .env
