-- Categories table for dynamic category pages
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Allow admins to manage
CREATE POLICY "Allow service role full access to categories"
  ON categories
  USING (auth.jwt() ->> 'role' = 'service_role');
