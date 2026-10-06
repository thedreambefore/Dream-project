/*
# 作業規格對齊：wishes 視圖、is_phone_verified、封鎖狀態、管理員帳號

1. `profiles.is_phone_verified` 與既有 `phone_verified` 雙向同步
2. `wishes` 為 `stories` 的可更新視圖，前端可安全寫入願望卡片
3. 卡片 `status` 允許 '已封鎖'，前台僅顯示 approved / fulfilled
4. 註冊 email 為 admin@dreamsand.tw 時自動賦予 admin 角色
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_phone_verified boolean NOT NULL DEFAULT false;
  END IF;
END;
$$;

UPDATE profiles
SET is_phone_verified = phone_verified
WHERE is_phone_verified IS DISTINCT FROM phone_verified;

CREATE OR REPLACE FUNCTION sync_phone_verified_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.is_phone_verified := COALESCE(NEW.is_phone_verified, NEW.phone_verified, false);
    NEW.phone_verified := NEW.is_phone_verified;
    RETURN NEW;
  END IF;

  IF NEW.is_phone_verified IS DISTINCT FROM OLD.is_phone_verified THEN
    NEW.phone_verified := NEW.is_phone_verified;
  ELSIF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified THEN
    NEW.is_phone_verified := NEW.phone_verified;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_phone_verified ON profiles;
CREATE TRIGGER trg_sync_phone_verified
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION sync_phone_verified_columns();

ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_status_check;
ALTER TABLE stories ADD CONSTRAINT stories_status_check
  CHECK (status IN ('pending', 'approved', 'blocked', 'fulfilled', '已封鎖'));

CREATE OR REPLACE VIEW wishes AS
SELECT * FROM stories;

ALTER VIEW wishes SET (security_invoker = true);

GRANT SELECT, INSERT, UPDATE ON wishes TO anon, authenticated;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role text := 'user';
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'admin@dreamsand.tw' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO profiles (id, display_name, avatar_emoji, role)
  VALUES (
    NEW.id,
    CASE WHEN v_role = 'admin' THEN '平台管理員' ELSE '匿名星旅人' END,
    CASE WHEN v_role = 'admin' THEN '🛠️' ELSE '🌙' END,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role
    WHERE profiles.role IS DISTINCT FROM EXCLUDED.role AND EXCLUDED.role = 'admin';

  INSERT INTO wallets (user_id, available_stardust, in_transit_stardust)
  VALUES (NEW.id, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
