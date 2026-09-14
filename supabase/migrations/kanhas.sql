-- Kanhas Veg Restaurant Schema
-- Run this in your Kanhas Supabase project SQL editor

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  table_number text,
  channel text DEFAULT 'dine-in',
  status text DEFAULT 'pending',
  total numeric(10,2) DEFAULT 0,
  estimated_time_min int DEFAULT 15,
  special_instructions text,
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

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  stock numeric(10,2) DEFAULT 0,
  unit text DEFAULT 'kg',
  reorder_level numeric(10,2) DEFAULT 0,
  supplier text,
  last_restocked timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Invoices (OCR-captured)
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier text,
  invoice_date date,
  total numeric(10,2),
  items jsonb DEFAULT '[]'::jsonb,
  raw_text text,
  image_path text,
  created_at timestamptz DEFAULT now()
);

-- Sales records (daily summaries)
CREATE TABLE IF NOT EXISTS sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  total_revenue numeric(10,2) DEFAULT 0,
  order_count int DEFAULT 0,
  top_items jsonb DEFAULT '[]'::jsonb,
  channel_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text UNIQUE,
  whatsapp text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock, reorder_level);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(record_date DESC);
