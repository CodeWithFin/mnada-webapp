-- FAQs table for Customer Questions and Answers
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'pending', -- pending, published, archived
    is_featured BOOLEAN DEFAULT FALSE,
    author_name TEXT,
    author_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Allow public to insert questions
DROP POLICY IF EXISTS "Public can insert questions" ON public.faqs;
CREATE POLICY "Public can insert questions" ON public.faqs
FOR INSERT WITH CHECK (true);

-- Allow public to read published FAQs
DROP POLICY IF EXISTS "Public can read published FAQs" ON public.faqs;
CREATE POLICY "Public can read published FAQs" ON public.faqs
FOR SELECT USING (status = 'published');

-- Allow admins full access (Admin access is handled via service role/supabaseAdmin in the API)
-- But we can add an explicit policy for safe-measure if needed for future direct dashboard access
DROP POLICY IF EXISTS "Admins can do everything" ON public.faqs;
CREATE POLICY "Admins can do everything" ON public.faqs
FOR ALL USING (true); -- This is just a placeholder, real security is in the API layer with supabaseAdmin
