-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    percentage INTEGER NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do anything
CREATE POLICY "Admin can manage discount codes" ON discount_codes
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Public can read active codes (for validation at checkout)
CREATE POLICY "Public can read active discount codes" ON discount_codes
    FOR SELECT
    USING (active = true);
