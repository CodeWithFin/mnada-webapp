-- Sellers table for Multi-Seller System
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    commission_rate NUMERIC DEFAULT 0.10, -- Default 10% commission
    business_category TEXT,
    estimated_sales TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add seller_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id);

-- Enable RLS for sellers
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Super Admin can do everything on sellers
-- (Admins use service role in API, which bypasses RLS)

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
