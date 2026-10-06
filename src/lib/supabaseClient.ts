import { createClient } from '@supabase/supabase-js';

/**
 * 雲端連線欄位：請在專案根目錄 .env 填入
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 * Vite 前端只能讀取 VITE_ 前綴變數，此處再對應到作業指定的欄位名稱。
 */
const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';

const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[DreamSand] 尚未設定 SUPABASE_URL / SUPABASE_ANON_KEY，請在 .env 填入雲端專案連線資訊。'
  );
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'dreamsand-auth-token',
  },
});

export function toAuthEmail(account: string): string {
  const trimmed = account.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed.toLowerCase()}@dreamsand.tw`;
}
