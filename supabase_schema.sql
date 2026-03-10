-- 1. Create Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'mens', 'womens', 'accessories'
    is_new BOOLEAN DEFAULT false,
    materials TEXT,
    fit TEXT,
    main_image_url TEXT NOT NULL
);

-- 2. Create Product Images Table (for galleries)
CREATE TABLE product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policies (Read-only for users)
CREATE TABLE IF NOT EXISTS public.products (
    -- Re-check or apply policies
);

-- Actual Policies
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to product_images" ON product_images
    FOR SELECT USING (true);

-- 5. Storage Bucket Configuration
-- Note: Buckets are usually created via the Supabase Dashboard.
-- After creating a 'product-images' bucket, run these:

-- Policy to allow public read access to images
-- (This assumes the bucket is public, but RLS policies can still be applied)
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'product-images' );

-- Policy to allow authenticated uploads (for admins)
-- CREATE POLICY "Admin Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
