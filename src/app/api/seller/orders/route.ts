import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sellerPayload = await verifyRoleRequest(req, 'seller');
  if (!sellerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get seller's products
    const { data: products, error: pError } = await supabaseAdmin
      .from('products')
      .select('id, name, mock_id')
      .eq('seller_id', sellerPayload.id);

    if (pError) throw pError;
    const productIds = [
      ...products.map(p => p.id),
      ...products.map(p => p.mock_id).filter(Boolean)
    ];

    // 2. Get order items for these products, including order details
    const { data: orderItems, error: oError } = await supabaseAdmin
      .from('order_items')
      .select(`
        *,
        orders (*)
      `)
      .in('product_id', productIds);

    if (oError) throw oError;

    // Group items by order if necessary, but usually sellers want to see individual item sales
    // We'll return the items with their order context
    // Sort in memory by order date
    const formattedOrders = orderItems
      .map((item: any) => ({
        ...item,
        product_name: products.find(p => p.id === item.product_id || p.mock_id === item.product_id)?.name || 'Unknown Product',
        order_reference: item.orders?.id.substring(0, 8),
        customer_name: `${item.orders?.customer_first_name} ${item.orders?.customer_last_name}`,
        status: item.orders?.status,
        date: item.orders?.created_at
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(formattedOrders);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
