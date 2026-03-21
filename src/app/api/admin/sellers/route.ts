import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { resend } from '@/lib/resend';

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

    // --- Send Approval Email ---
    if (status === 'approved') {
      try {
        await resend.emails.send({
          from: 'Mnada Admin <hello@mnada.shop>',
          to: [data.email],
          subject: 'Congratulations! Your Mnada Seller Account is Approved',
          html: `
            <div style="font-family: monospace; padding: 40px; color: #1c1a19; background-color: #f8f8f8;">
              <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e5e5;">
                <h2 style="text-transform: uppercase; border-bottom: 2px solid #1c1a19; padding-bottom: 10px; margin-bottom: 30px;">MNADA</h2>
                <h3 style="text-transform: uppercase; color: #a58c69;">Welcome to the Pioneer Program</h3>
                <p>Hello ${data.name},</p>
                <p>Great news! Your application to become a seller on Mnada has been <strong>approved</strong>.</p>
                <p style="margin-top: 20px;">You can now log in to the Seller Portal to set up your brand profile and start adding products.</p>
                
                <div style="margin: 40px 0;">
                  <a href="https://mnada.shop/seller/login" style="background-color: #1c1a19; color: #ffffff; padding: 15px 30px; text-decoration: none; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">Go to Seller Portal</a>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
                <p style="font-size: 11px; color: #666; font-style: italic;">
                  "Industrial goods for the modern pioneer. Designed in Nakuru, worn worldwide."
                </p>
                <p style="font-size: 10px; color: #999; margin-top: 20px;">
                  Est. 2025 • Nakuru, Kenya
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
      }
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
