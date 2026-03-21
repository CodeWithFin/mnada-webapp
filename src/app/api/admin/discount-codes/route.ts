import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, percentage } = await req.json();

    if (!code || !percentage) {
      return NextResponse.json({ error: 'Code and percentage are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert([{ 
        code: code.toUpperCase().trim(), 
        percentage: parseInt(percentage),
        active: true 
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Discount code deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
