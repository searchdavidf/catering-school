-- Catering School Schema
-- Run this in your Supabase SQL editor

-- Profiles (staff + kitchen users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('staff', 'kitchen')),
  created_at timestamptz DEFAULT now()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact text NOT NULL,
  department text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'preparing', 'ready', 'delivered')),
  deadline timestamptz,
  total numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items (line items)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Order status log (audit trail)
CREATE TABLE IF NOT EXISTS order_status_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust as needed)
-- Profiles: users can read their own profile
CREATE POLICY "profiles_self" ON profiles FOR SELECT USING (auth.uid() = id);

-- Menu items: anyone can read, only kitchen can write
CREATE POLICY "menu_read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_write" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'kitchen')
);

-- Orders: anyone can create (customer), staff/kitchen can read/update
CREATE POLICY "orders_create" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_read" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'kitchen'))
);

-- Order items: anyone can create/read, staff/kitchen can update
CREATE POLICY "order_items_create" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_read" ON order_items FOR SELECT USING (true);

-- Status log: anyone can read, staff/kitchen can insert
CREATE POLICY "status_log_read" ON order_status_log FOR SELECT USING (true);
CREATE POLICY "status_log_insert" ON order_status_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'kitchen'))
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, sort_order) VALUES
  ('Chowmein', 'Stir-fried noodles with vegetables', 15.00, 'Main Course', 1),
  ('Pav Bhaji', 'Spiced mashed vegetables with buttered bread rolls', 15.00, 'Main Course', 2),
  ('Samosa', 'Crispy pastry filled with spiced potatoes', 3.00, 'Starters', 1),
  ('Fried Rice', 'Stir-fried rice with vegetables and soy sauce', 12.00, 'Main Course', 3),
  ('Thali', 'Complete meal with dal, sabji, roti, rice, and pickle', 15.00, 'Main Course', 4);

-- Insert sample staff/kitchen users (run after creating auth users in Supabase dashboard)
-- INSERT INTO profiles (id, email, full_name, role) VALUES
--   ('user-uuid-1', 'staff@catering.com', 'Staff Member', 'staff'),
--   ('user-uuid-2', 'kitchen@catering.com', 'Kitchen Manager', 'kitchen');
