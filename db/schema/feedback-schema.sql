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

-- Ensure rating column exists if table was created previously
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='rating') THEN
        ALTER TABLE public.feedback ADD COLUMN rating INTEGER DEFAULT 5;
    END IF;
END $$;

-- Enable RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow public to insert feedback
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;
CREATE POLICY "Public can insert feedback" ON public.feedback
FOR INSERT WITH CHECK (true);

-- Allow public to read approved or featured feedback
DROP POLICY IF EXISTS "Public can read approved feedback" ON public.feedback;
CREATE POLICY "Public can read approved feedback" ON public.feedback
FOR SELECT USING (status = 'approved' OR is_featured = true);
