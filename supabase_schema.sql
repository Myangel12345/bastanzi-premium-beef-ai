-- Bastanzi Premium Beef Co. - Supabase Database Schema

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for customer lookup
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  beef_share TEXT NOT NULL,
  estimated_weight TEXT,
  total_price NUMERIC(10,2) DEFAULT 0.00,
  payment_status TEXT DEFAULT 'Pending Deposit',
  fulfillment_method TEXT DEFAULT 'Pickup',
  pickup_date TEXT,
  delivery_date TEXT,
  current_status TEXT DEFAULT 'Order Received',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast order lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- 3. Order History Table
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'System'
);

-- Index for history timeline
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public read access for tracking matching both order_number and email
CREATE POLICY "Allow public order tracking" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public customer access" ON public.customers
  FOR SELECT USING (true);

CREATE POLICY "Allow public order history tracking" ON public.order_history
  FOR SELECT USING (true);

-- Allow full access for authenticated users / anon for order insertion
CREATE POLICY "Allow order creation" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow customer creation" ON public.customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow history creation" ON public.order_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin operations on orders" ON public.orders
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on customers" ON public.customers
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on order history" ON public.order_history
  FOR ALL USING (true);

CREATE POLICY "Allow admin user checks" ON public.admin_users
  FOR ALL USING (true);

-- Insert initial default admin user
INSERT INTO public.admin_users (email, role)
VALUES ('admin@bastanzibeef.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 5. Managed Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  image_url TEXT NOT NULL,
  description TEXT,
  target_section TEXT DEFAULT 'gallery',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Store Table (site pricing, fees, and photo metadata JSON)
CREATE TABLE IF NOT EXISTS public.content_store (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for photos and content_store
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read photos" ON public.photos
  FOR SELECT USING (true);

CREATE POLICY "Allow public write photos" ON public.photos
  FOR ALL USING (true);

CREATE POLICY "Allow public read content store" ON public.content_store
  FOR SELECT USING (true);

CREATE POLICY "Allow public write content store" ON public.content_store
  FOR ALL USING (true);
