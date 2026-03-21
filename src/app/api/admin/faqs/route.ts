import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

export async function GET(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch from proper faqs table
    const { data: faqsData, error: faqsError } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: false });

    const properFaqs = faqsError ? [] : (faqsData || []);

    // 2. Fetch from fallback products table
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .order('created_at', { ascending: false });

    const fallbackFaqs = productsError ? [] : (productsData || [])
      .map(item => {
        try {
          const parsed = JSON.parse(item.description);
          if (parsed.type === 'faq_submission') {
            return {
              id: item.created_at, // Use created_at as ID for fallback items
              question: parsed.question,
              answer: parsed.answer || null,
              status: parsed.status || 'pending',
              category: parsed.category || 'General',
              author_name: parsed.author_name,
              author_email: parsed.author_email,
              created_at: parsed.created_at || item.created_at,
              is_fallback: true
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

export async function PUT(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, question, answer, status, category, is_featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing FAQ ID' }, { status: 400 });
    }

    // 1. Try updating the proper faqs table (UUID check)
    if (String(id).includes('-')) {
      const { error: faqError } = await supabaseAdmin
        .from('faqs')
        .update({
          question,
          answer,
          status,
          category,
          is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (!faqError) {
        return NextResponse.json({ success: true });
      }
    }

    // 2. Try updating fallback products table
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('description')
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .eq('created_at', id)
      .single();

    if (!fetchError && existing) {
      const parsed = JSON.parse(existing.description);
      const updatedDescription = JSON.stringify({
        ...parsed,
        question: question || parsed.question,
        answer: answer || parsed.answer,
        status: status || parsed.status,
        category: category || parsed.category,
        is_featured: is_featured !== undefined ? is_featured : parsed.is_featured,
        updated_at: new Date().toISOString()
      });

      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ description: updatedDescription })
        .eq('created_at', id);

      if (!updateError) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing FAQ ID' }, { status: 400 });
    }

    // 1. Try deleting from the proper faqs table
    if (id.includes('-')) {
      const { error: faqError } = await supabaseAdmin
        .from('faqs')
        .delete()
        .eq('id', id);

      if (!faqError) {
        return NextResponse.json({ success: true });
      }
    }

    // 2. Try deleting from the fallback products table
    const { error: productsError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .eq('created_at', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
