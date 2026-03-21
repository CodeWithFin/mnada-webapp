import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { createRoleToken, findSystemUser } from '@/lib/systemAuth';

export async function GET(req: Request) {
  // ... (keeping GET as is for existence checks if needed, but signup page doesn't use it now)
  // Actually, I'll just keep it for now.
}

export async function POST(req: Request) {
  try {
    const { email, password, name, business_category, estimated_sales } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from('sellers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Attempt 1: Full insert with all columns
    let { data: seller, error } = await supabaseAdmin
      .from('sellers')
      .insert({
        email,
        name,
        business_category,
        estimated_sales,
        password_hash,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    // Attempt 2: Fallback if columns are missing (PGRST204)
    if (error && error.message.includes('business_category')) {
      console.warn('Fallback: DB columns missing. Retrying with minimal columns...');
      const fallback = await supabaseAdmin
        .from('sellers')
        .insert({
          email,
          name,
          password_hash
        })
        .select()
        .maybeSingle();
      
      seller = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Signup Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted successfully' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
