import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';
const FEEDBACK_PREFIX = 'FEEDBACK::';

type FeedbackPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  rating: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

function isFeedbackSchemaError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybe = error as { code?: string; message?: string };
  // PGRST205: Missing table
  // PGRST204: Missing column
  return (maybe.code === 'PGRST205' || maybe.code === 'PGRST204') && 
         (maybe.message || '').includes('feedback');
}

function validate(payload: Partial<FeedbackPayload>) {
  if (!payload.name || payload.name.trim().length < 2) return 'Name is required';
  if (!payload.email || !payload.email.includes('@')) return 'Valid email is required';
  if (!payload.message || payload.message.trim().length < 10) return 'Feedback message is too short';
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) return 'Valid rating (1-5) is required';
  return null;
}

async function insertFallbackFeedback(payload: FeedbackPayload) {
  const markerName = `${FEEDBACK_PREFIX}${Date.now()}::${payload.name.trim()}`;

  const { error } = await supabaseAdmin
    .from('products')
    .insert({
      name: markerName,
      category: SYSTEM_AUTH_CATEGORY,
      description: JSON.stringify({
        type: 'feedback',
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        message: payload.message.trim(),
        rating: payload.rating,
        created_at: new Date().toISOString()
      }),
      price: 0,
      image: 'system-feedback',
      main_image_url: 'system-feedback',
      mock_id: `system-feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      is_new: false,
      sizes: ['S', 'M', 'L', 'XL']
    });

  if (error) {
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<FeedbackPayload>;
    const validationError = validate(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const payload: FeedbackPayload = {
      name: body.name!.trim(),
      email: body.email!.trim(),
      phone: body.phone?.trim() || '',
      message: body.message!.trim(),
      rating: body.rating || 5
    };

    const { error } = await supabaseAdmin
      .from('feedback')
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        message: payload.message,
        rating: payload.rating
      });

    if (error) {
      if (isFeedbackSchemaError(error)) {
        await insertFallbackFeedback(payload);
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
    // 1. Fetch from the proper feedback table
    const { data: feedbackData, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    const properFeedback = feedbackError ? [] : (feedbackData || []);

    // 2. Fetch from products table fallback
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('description, created_at')
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .order('created_at', { ascending: false });

    const fallbackFeedback = productsError ? [] : (productsData || [])
      .map(item => {
        try {
          const parsed = JSON.parse(item.description);
          if (parsed.type === 'feedback') {
            return {
              id: item.created_at,
              name: parsed.name,
              message: parsed.message,
              rating: parsed.rating || 5,
              created_at: parsed.created_at || item.created_at,
              status: 'approved' // Consider fallback items as approved
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // 3. Merge and Sort
    const merged = [...properFeedback, ...fallbackFeedback]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(merged);
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
      return NextResponse.json({ error: 'Missing feedback ID' }, { status: 400 });
    }

    // 1. Try deleting from the proper feedback table (UUID check)
    if (id.includes('-')) {
      const { error: feedbackError } = await supabaseAdmin
        .from('feedback')
        .delete()
        .eq('id', id);

      if (!feedbackError) {
        return NextResponse.json({ success: true });
      }
    }

    // 2. Try deleting from the fallback products table
    // Fallback IDs are either created_at timestamps or mock IDs
    const { error: productsError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .eq('created_at', id);

    if (productsError) {
      // Also try mock_id check if created_at didn't match (less likely but possible)
      await supabaseAdmin
        .from('products')
        .delete()
        .eq('category', SYSTEM_AUTH_CATEGORY)
        .eq('mock_id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
