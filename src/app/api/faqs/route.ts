import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';
const FAQ_PREFIX = 'FAQ::';

type FaqPayload = {
  question: string;
  author_name?: string;
  author_email?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

function isFaqSchemaError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybe = error as { code?: string; message?: string };
  return (maybe.code === 'PGRST205' || maybe.code === 'PGRST204') && 
         (maybe.message || '').includes('faqs');
}

async function insertFallbackFaq(payload: FaqPayload) {
  const markerName = `${FAQ_PREFIX}${Date.now()}::${(payload.author_name || 'Anonymous').trim()}`;

  const { error } = await supabaseAdmin
    .from('products')
    .insert({
      name: markerName,
      category: SYSTEM_AUTH_CATEGORY,
      description: JSON.stringify({
        type: 'faq_submission',
        question: payload.question.trim(),
        author_name: payload.author_name?.trim() || 'Anonymous',
        author_email: payload.author_email?.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }),
      price: 0,
      image: 'system-faq',
      main_image_url: 'system-faq',
      mock_id: `system-faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      is_new: false,
      sizes: ['S']
    });

  if (error) {
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<FaqPayload>;
    
    if (!body.question || body.question.trim().length < 5) {
      return NextResponse.json({ error: 'Question is too short' }, { status: 400 });
    }

    const payload: FaqPayload = {
      question: body.question.trim(),
      author_name: body.author_name?.trim() || 'Anonymous',
      author_email: body.author_email?.trim()
    };

    const { error } = await supabaseAdmin
      .from('faqs')
      .insert({
        question: payload.question,
        author_name: payload.author_name,
        author_email: payload.author_email,
        status: 'pending'
      });

    if (error) {
      if (isFaqSchemaError(error)) {
        await insertFallbackFaq(payload);
        return NextResponse.json({ success: true, fallback: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 1. Fetch from the proper faqs table
    const { data: faqsData, error: faqsError } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    const properFaqs = faqsError ? [] : (faqsData || []);

    // 2. Fetch from products table fallback (if any published?)
    // In fallback mode, we assume anything that has an 'answer' in the JSON is published
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('description, created_at')
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .order('created_at', { ascending: false });

    const fallbackFaqs = productsError ? [] : (productsData || [])
      .map(item => {
        try {
          const parsed = JSON.parse(item.description);
          if (parsed.type === 'faq_submission' && parsed.status === 'published' && parsed.answer) {
            return {
              id: item.created_at,
              question: parsed.question,
              answer: parsed.answer,
              category: parsed.category || 'General',
              created_at: parsed.created_at || item.created_at
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    const merged = [...properFaqs, ...fallbackFaqs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(merged);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
