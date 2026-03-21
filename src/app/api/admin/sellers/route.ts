import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

async function verifyAuth(req: Request) {
  return Boolean(await verifyRoleRequest(req, 'admin'));
}

export async function GET(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password, commission_rate } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert({
        name,
        email,
        password_hash,
        commission_rate: commission_rate || 0.10
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, email, password, commission_rate, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    const updateData: any = {
      name,
      email,
      commission_rate,
      status, // Allow updating status
      updated_at: new Date()
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabaseAdmin
      .from('sellers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
