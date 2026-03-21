-- Discount Usage Table
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_id TEXT -- Optional: link to an order if available
);

-- Enable RLS
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Index for fast lookup by email and code
CREATE INDEX IF NOT EXISTS idx_discount_usage_email_code ON discount_usage(email, code_id);

-- Policy: Admin can see everything
CREATE POLICY "Admin can view discount usage" ON discount_usage
    FOR SELECT
    USING (auth.role() = 'service_role');

-- Policy: Service role can insert (from API)
CREATE POLICY "System can record usage" ON discount_usage
    FOR INSERT
    WITH CHECK (true);
