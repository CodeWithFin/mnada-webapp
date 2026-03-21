import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();

    // 1. Check if code exists and is active
    const { data: discount, error: codeError } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('active', true)
      .single();

    if (codeError || !discount) {
      return NextResponse.json({ error: 'Invalid or expired discount code' }, { status: 404 });
    }

    // 2. Check if user has already used this code
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('discount_usage')
      .select('*')
      .eq('code_id', discount.id)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (usage) {
      return NextResponse.json({ error: 'You have already used this discount code' }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true, 
      percentage: discount.percentage,
      codeId: discount.id
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
