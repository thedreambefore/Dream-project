/*
# 夢沙 DreamSand — 完整資料庫結構

1. 概述
   建立匿名星塵願望交易所所需的所有資料表，包含用戶設定檔、故事卡片、投資記錄、錢包餘額、公告、標籤分類、以及履約記錄。

2. 新增資料表
   - `profiles` — 用戶設定檔（角色、手機驗證、顯示名稱、信用評級）
   - `stories` — 許願故事卡片（商品、金額、Tag、故事、承諾、狀態、進度）
   - `investments` — 投資記錄（金額、留言、匿名）
   - `wallets` — 錢包（可用星塵、旅途中星塵）
   - `announcements` — 公告
   - `tags` — 標籤分類
   - `fulfillments` — 履約記錄（開箱emoji、感謝信）

3. 安全 (RLS)
   - 全表啟用 RLS，每表四條 CRUD 策略
   - profiles: 自讀自寫 + 管理員讀全部
   - stories: 審核通過對所有人可讀；作者建/改自己的；管理員可改
   - investments: 讀自己的或自己故事的；只能建自己的
   - wallets: 自讀自寫
   - announcements/tags/fulfillments: 公開可讀，管理員可寫
*/

-- ===== profiles =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  display_name text NOT NULL DEFAULT '匿名星旅人',
  avatar_emoji text NOT NULL DEFAULT '🌙',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone_verified boolean NOT NULL DEFAULT false,
  credit_rating text NOT NULL DEFAULT '新星' CHECK (credit_rating IN ('新星', '星塵', '銀河', '傳說')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===== tags =====
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '🏷️',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tags_select_all" ON tags;
CREATE POLICY "tags_select_all" ON tags FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tags_insert_admin" ON tags;
CREATE POLICY "tags_insert_admin" ON tags FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "tags_update_admin" ON tags;
CREATE POLICY "tags_update_admin" ON tags FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "tags_delete_admin" ON tags;
CREATE POLICY "tags_delete_admin" ON tags FOR DELETE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ===== announcements =====
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_select_all" ON announcements;
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "announcements_insert_admin" ON announcements;
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "announcements_update_admin" ON announcements;
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "announcements_delete_admin" ON announcements;
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ===== stories =====
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_price int NOT NULL CHECK (product_price > 0),
  tag_name text NOT NULL DEFAULT '其他',
  story_text text NOT NULL CHECK (length(story_text) <= 500),
  promise_text text NOT NULL,
  cover_emoji text NOT NULL DEFAULT '🎁',
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'blocked', 'fulfilled')),
  block_reason text,
  current_stardust int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_select_approved_or_own_or_admin" ON stories;
CREATE POLICY "stories_select_approved_or_own_or_admin" ON stories FOR SELECT
TO anon, authenticated USING (
  status = 'approved' OR status = 'fulfilled'
  OR auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "stories_insert_own" ON stories;
CREATE POLICY "stories_insert_own" ON stories FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_update_own_or_admin" ON stories;
CREATE POLICY "stories_update_own_or_admin" ON stories FOR UPDATE
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (true);

-- ===== investments =====
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  amount int NOT NULL CHECK (amount > 0),
  message text CHECK (length(message) <= 50),
  is_anonymous boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investments_select_own_or_story" ON investments;
CREATE POLICY "investments_select_own_or_story" ON investments FOR SELECT
TO authenticated USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM stories s WHERE s.id = investments.story_id AND s.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "investments_insert_own" ON investments;
CREATE POLICY "investments_insert_own" ON investments FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== wallets =====
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  available_stardust int NOT NULL DEFAULT 0,
  in_transit_stardust int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
CREATE POLICY "wallets_select_own" ON wallets FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_insert_own" ON wallets;
CREATE POLICY "wallets_insert_own" ON wallets FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_update_own" ON wallets;
CREATE POLICY "wallets_update_own" ON wallets FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== fulfillments =====
CREATE TABLE IF NOT EXISTS fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL UNIQUE REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  unboxing_emoji text NOT NULL DEFAULT '📦',
  thank_you_letter text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fulfillments_select_all" ON fulfillments;
CREATE POLICY "fulfillments_select_all" ON fulfillments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "fulfillments_insert_story_owner" ON fulfillments;
CREATE POLICY "fulfillments_insert_story_owner" ON fulfillments FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== trigger: auto-create profile + wallet on signup =====
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_emoji)
  VALUES (NEW.id, '匿名星旅人', '🌙')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id, available_stardust, in_transit_stardust)
  VALUES (NEW.id, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== seed tags =====
INSERT INTO tags (name, icon, sort_order) VALUES
  ('文具天堂', '✏️', 1),
  ('3C數位', '📱', 2),
  ('生活家居', '🏠', 3),
  ('服飾配件', '👕', 4),
  ('美食饗宴', '🍜', 5),
  ('夢想體驗', '✨', 6),
  ('其他', '🏷️', 99)
ON CONFLICT (name) DO NOTHING;

-- ===== seed announcement =====
INSERT INTO announcements (title, body, is_active)
SELECT '歡迎來到夢沙 DreamSand', '在這裡，每個願望都是一顆星塵。匿名寫下你的心願，讓群眾的星光照亮你的夢想沙漏。完成的心願將以開箱故事回報每一份溫暖。', true
WHERE NOT EXISTS (SELECT 1 FROM announcements);

-- ===== seed demo stories =====
DO $$
DECLARE
  seed_user_1 uuid := gen_random_uuid();
  seed_user_2 uuid := gen_random_uuid();
  seed_user_3 uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM stories) THEN
    INSERT INTO profiles (id, display_name, avatar_emoji, phone_verified, credit_rating)
    VALUES
      (seed_user_1, '星旅人A', '🌙', true, '星塵'),
      (seed_user_2, '星旅人B', '⭐', true, '銀河'),
      (seed_user_3, '星旅人C', '💫', true, '新星')
    ON CONFLICT DO NOTHING;

    INSERT INTO stories (user_id, product_name, product_price, tag_name, story_text, promise_text, cover_emoji, status, current_stardust) VALUES
      (seed_user_1, 'Hobonichi 手帳一本', 1200, '文具天堂', '自從媽媽住院後，我每天在病床旁記錄她的復原點滴。但現用的筆記本已經破舊不堪，好想要一本能陪伴我一整年的 Hobonichi，把每一天的小進步都好好留下來。', '收到後會在 30 天內上傳手帳內頁照片與一封匿名感謝信，讓大家看到你們的星塵如何化為真實的溫暖。', '📓', 'approved', 400),
      (seed_user_2, 'AirPods Pro 2', 7990, '3C數位', '我是聽障中度者，助聽器太貴買不起。AirPods 的通透模式對我日常幫助很大，舊的耳機已經壞了三個月，上課越來越聽不清楚。', '收到後會錄製一段日常使用影片（不露臉）與匿名感謝信，證明星塵真實改變了我的生活。', '🎧', 'approved', 2500),
      (seed_user_3, '給奶奶的電動按摩椅', 15000, '生活家居', '奶奶腰痛多年，每天貼布貼到皮膚過敏。好想送她一台電動按摩椅，讓她每晚都能舒服休息。目前家裡經濟只夠溫飽，這個願望對我來說太奢侈了。', '收到後會拍攝奶奶使用按摩椅的照片（模糊處理）與一封來自奶奶的匿名感謝信。', '🪑', 'approved', 13950),
      (seed_user_1, '入學用平板電腦', 8000, '3C數位', '考上大學但家裡無法負擔平板，許多課程需要電子設備才能完成作業。', '收到後會上傳學生證與平板使用照片與匿名感謝信。', '📱', 'approved', 3200),
      (seed_user_2, '給流浪貓的過冬物資', 3000, '其他', '我在社區照顧 8 隻流浪貓，冬天快到了需要貓窩、飼料和保溫墊。', '收到後會拍攝物資與貓咪使用照片與匿名感謝信。', '🐱', 'approved', 800),
      (seed_user_3, '陶藝課程體驗券', 2500, '夢想體驗', '從小就想學陶藝但家裡無法負擔才藝費。好想親手做一個杯子送給爸爸。', '收到後會上傳成品照片與匿名感謝信。', '🏺', 'approved', 500),
      (seed_user_1, '數位繪圖板', 4500, '3C數位', '想成為插畫家但買不起繪圖板，目前用滑鼠畫圖非常吃力。', '收到後會上傳第一幅數位作品與匿名感謝信。', '🎨', 'approved', 1500),
      (seed_user_2, '給自閉症弟弟的療癒玩具組', 3500, '其他', '弟弟被診斷為自閉症，治療師建議添購感官玩具但家中經濟不允許。', '收到後會上傳弟弟使用玩具的照片（模糊處理）與匿名感謝信。', '🧸', 'approved', 600);
  END IF;
END;
$$;
