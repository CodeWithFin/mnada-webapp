import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { sendSMS } from '@/lib/tilil';
import { getOrderReference } from '@/lib/orderReference';

export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

async function verifyAuth(req: Request) {
  return Boolean(await verifyRoleRequest(req, 'admin'));
}

function toStatusMessage(status: string) {
  switch (status) {
    case 'pending':
      return 'is pending and being reviewed by our team.';
    case 'confirmed':
      return 'has been confirmed. We are preparing it for dispatch.';
    case 'dispatched':
      return 'has been dispatched and is on the way.';
    case 'delivered':
      return 'has been delivered. Thank you for shopping with Mnada.';
    case 'cancelled':
      return 'has been cancelled. Please contact us if you need help.';
    default:
      return `status is now: ${status}.`;
  }
}

export async function GET(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const allowedStatuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        order_items (*)
      `)
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.customer_phone) {
      const orderReference = getOrderReference(data);
      const customerName = [data.customer_first_name, data.customer_last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      const namePart = customerName ? `Hello ${customerName}, ` : 'Hello, ';
      const smsMessage = `${namePart}your order ${orderReference} ${toStatusMessage(status)}`;

      try {
        await sendSMS(data.customer_phone, smsMessage);
      } catch (smsError) {
        console.error('Failed to send order status SMS:', smsError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
