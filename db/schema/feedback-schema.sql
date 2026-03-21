-- Feedback table for Customer Reviews and Suggestions
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending', -- pending, approved, hidden
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow public to insert feedback
CREATE POLICY "Public can insert feedback" ON public.feedback
FOR INSERT WITH CHECK (true);

-- Allow public to read approved or featured feedback
CREATE POLICY "Public can read approved feedback" ON public.feedback
FOR SELECT USING (status = 'approved' OR is_featured = true);

-- Admins can do everything (usually via service role)
