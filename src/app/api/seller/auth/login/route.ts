import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createRoleToken, findSystemUser } from '@/lib/systemAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const seller = await findSystemUser(email, 'seller');

    if (!seller || !seller.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check status
    const { data: statusData } = await supabaseAdmin
      .from('sellers')
      .select('status')
      .eq('id', seller.id)
      .single();

    if (statusData?.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your account is pending approval or has been restricted.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password_hash as string);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = createRoleToken(seller, 'seller');

    // Authentication successful
    return NextResponse.json(
      { 
        success: true, 
        message: 'Authentication successful', 
        token, 
        role: 'seller', 
        username: seller.name,
        email: seller.email,
        id: seller.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seller login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
