-- DailyDabba — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run this in Supabase SQL Editor or via `supabase db push`

-- ============================================
-- TABLE: profiles (one per business owner)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  business_name text,
  language_preference text DEFAULT 'en',
  currency text DEFAULT 'INR',
  printer_enabled boolean DEFAULT false,
  token_system_enabled boolean DEFAULT false,
  close_day_pin text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- ============================================
-- TABLE: operators (staff handling billing)
-- ============================================
CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_operators" ON operators FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TABLE: menu_items (permanent master list)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price numeric NOT NULL,
  is_available boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_menu" ON menu_items FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TABLE: daily_menu_overrides (today's availability)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_menu_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  override_date date NOT NULL DEFAULT CURRENT_DATE,
  is_available_today boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (owner_id, menu_item_id, override_date)
);

ALTER TABLE daily_menu_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_daily_menu" ON daily_menu_overrides FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TABLE: day_sessions (open/close state per day)
-- ============================================
CREATE TABLE IF NOT EXISTS day_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'open',
  opened_at timestamptz DEFAULT now(),
  close_requested_at timestamptz,
  closed_at timestamptz,
  UNIQUE (owner_id, session_date)
);

ALTER TABLE day_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_sessions" ON day_sessions FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TABLE: orders (each customer transaction)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  order_time timestamptz DEFAULT now(),
  total_amount numeric NOT NULL,
  payment_mode text DEFAULT 'cash',
  token_number int,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_orders" ON orders FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TABLE: order_items (line items per order)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  item_name text NOT NULL,
  item_price numeric NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_order_items" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE owner_id = auth.uid())
  );

-- ============================================
-- TABLE: daily_summaries (pre-computed at close)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  summary_date date NOT NULL,
  total_orders int DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  best_seller_name text,
  best_seller_quantity int DEFAULT 0,
  slowest_seller_name text,
  slowest_seller_quantity int DEFAULT 0,
  busiest_hour int,
  avg_order_value numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (owner_id, summary_date)
);

ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_summaries" ON daily_summaries FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_owner_date ON orders (owner_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_owner_sort ON menu_items (owner_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_owner_date ON daily_summaries (owner_id, summary_date DESC);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, language_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'language_preference', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
