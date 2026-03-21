-- Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- active, unsubscribed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do anything
CREATE POLICY "Admin can manage subscribers" ON subscribers
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Public can insert (subscribe)
CREATE POLICY "Public can subscribe" ON subscribers
    FOR INSERT
    WITH CHECK (true);
