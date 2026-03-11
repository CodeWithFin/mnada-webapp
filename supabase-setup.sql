-- If the products table does not exist, create it with all columns.
-- If it DOES exist, we will try to add the columns one by one.

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

-- Add missing columns individually
DO $$ BEGIN ALTER TABLE products ADD COLUMN mock_id text UNIQUE; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN name text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN price numeric; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN image text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN category text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN is_new boolean DEFAULT false; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN description text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN materials text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN fit text; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN sizes text[] DEFAULT '{"S", "M", "L", "XL"}'; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER TABLE products ADD COLUMN main_image_url text; EXCEPTION WHEN others THEN null; END $$;

-- Create gallery table to support multiple images without modifying products
CREATE TABLE IF NOT EXISTS product_gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for gallery
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to gallery" ON product_gallery FOR SELECT TO public USING (true);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can view products)
-- Drop policy if it exists first to prevent errors
DO $$ BEGIN
    DROP POLICY "Allow public read access" ON products;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT TO public USING (true);

-- Insert initial data
INSERT INTO products (mock_id, name, price, image, main_image_url, category, is_new, description, materials, fit) VALUES 
('p1', 'Bucking Bronco Hoodie - Washed Black', 8000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', 'Men''s', true, 'A heavy-weight, premium cotton blend hoodie featuring our iconic bucking bronco graphic. Designed to withstand the elements and age beautifully with wear. Featuring a slightly oversized, relaxed fit perfect for layering on the road.', '100% Organic Cotton. 450gsm heavyweight fleece. Made in Portugal.', 'Relaxed fit. True to size. Model is 6''1" and wears a size L.'),
('p2', 'Mechanic Overshirt - Raw Indigo', 12000, 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg', 'Men''s', false, 'A heavy-weight, premium cotton blend hoodie featuring our iconic bucking bronco graphic. Designed to withstand the elements and age beautifully with wear. Featuring a slightly oversized, relaxed fit perfect for layering on the road.', '100% Organic Cotton. 450gsm heavyweight fleece. Made in Portugal.', 'Relaxed fit. True to size. Model is 6''1" and wears a size L.'),
('p3', 'Wayfarer Cap - Rust Orange', 3200, 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'Accessories', false, 'Classic 6-panel cap in a garment-dyed rust orange. Built for the road, it will naturally fade over time to create a unique patina.', '100% Cotton Canvas.', 'One size fits most with adjustable strap.'),
('p4', 'Utility Tote - Olive Canvas', 8500, 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop', 'Women''s', false, 'A rugged, high-capacity tote bag made from heavyweight canvas. Perfect for weekend getaways or daily hauls.', '100% Heavyweight Cotton Canvas. Leather handles.', '20" W x 14" H x 6" D.'),
('m3', 'Wayfarer Cap - Rust Orange', 3200, 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'Men''s', false, 'Classic 6-panel cap in a garment-dyed rust orange. Built for the road, it will naturally fade over time to create a unique patina.', '100% Cotton Canvas.', 'One size fits most with adjustable strap.'),
('m4', 'Utility Tote - Olive Canvas', 8500, 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop', 'Men''s', false, 'A rugged, high-capacity tote bag made from heavyweight canvas. Perfect for weekend getaways or daily hauls.', '100% Heavyweight Cotton Canvas. Leather handles.', '20" W x 14" H x 6" D.'),
('m5', 'Wilderness Graphic Tee', 4500, 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1974&auto=format&fit=crop', 'Men''s', true, '', '', ''),
('m6', 'Pioneer Jacket - Moss', 18000, 'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=2003&auto=format&fit=crop', 'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=2003&auto=format&fit=crop', 'Men''s', false, '', '', ''),
('w1', 'Rider Leather Jacket - Vintage Brown', 28000, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop', 'Women''s', true, '', '', ''),
('w2', 'Desert Wanderer Boots', 19500, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1974&auto=format&fit=crop', 'Women''s', false, '', '', ''),
('w3', 'Selvedge Denim Shorts', 6800, 'https://images.unsplash.com/photo-1591369822096-11440d4e9fd8?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1591369822096-11440d4e9fd8?q=80&w=1974&auto=format&fit=crop', 'Women''s', false, '', '', ''),
('w4', 'Sunset Crop Tee', 3500, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop', 'Women''s', false, '', '', '')
ON CONFLICT (mock_id) DO NOTHING;

-- --------------------------------------------------------
-- Create a Storage Bucket for Product Images
-- --------------------------------------------------------

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to prevent errors on re-run
DO $$ BEGIN
    DROP POLICY "Public Access" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY "Authenticated users can upload" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Policy to allow public read access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- --------------------------------------------------------
-- Create Orders Schema
-- --------------------------------------------------------

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email text NOT NULL,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  shipping_address text NOT NULL,
  shipping_apartment text,
  shipping_city text NOT NULL,
  shipping_postal_code text NOT NULL,
  customer_phone text NOT NULL,
  status text DEFAULT 'pending' NOT NULL, -- e.g., pending, payment_completed, shipped, cancelled
  subtotal numeric NOT NULL,
  shipping_cost numeric NOT NULL,
  total text NOT NULL -- Storing as text or numeric depending on precision needs, numeric preferred but keeping simple for now
);

-- Enable RLS for Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert an order (since checkout is public)
DO $$ BEGIN
    DROP POLICY "Public can insert orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT TO public WITH CHECK (true);

-- Allow admins (authenticated) to view all orders
DO $$ BEGIN
    DROP POLICY "Authenticated can view orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Authenticated can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

-- Order Items Table (Line Items)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL, -- Storing mock_id or name to keep history if product is deleted
  product_name text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  size text NOT NULL
);

-- Enable RLS for Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert order items
DO $$ BEGIN
    DROP POLICY "Public can insert order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT TO public WITH CHECK (true);

-- Allow admins to view order items
DO $$ BEGIN
    DROP POLICY "Authenticated can view order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Authenticated can view order items" ON order_items
  FOR SELECT TO authenticated USING (true);


