/*
# 新增個人資料聯絡欄位

1. 修改 profiles 資料表
   - `real_name` (text) — 真實姓名（選填）
   - `phone` (text) — 聯絡電話（選填）
   - `address` (text) — 收件地址（選填）
   - `bio` (text) — 個人簡介（選填，100字內）

2. 安全
   - 沿用既有 RLS 策略（自讀自寫）
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='real_name') THEN
    ALTER TABLE profiles ADD COLUMN real_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END;
$$;
