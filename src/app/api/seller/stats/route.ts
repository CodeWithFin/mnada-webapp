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
      .select('id, name, price, seller_id, mock_id')
      .eq('seller_id', sellerPayload.id);

    if (pError) throw pError;

    const productIds = [
      ...products.map(p => p.id),
      ...products.map(p => p.mock_id).filter(Boolean)
    ];

    // 2. Get seller's commission rate
    const { data: seller, error: sError } = await supabaseAdmin
      .from('sellers')
      .select('commission_rate')
      .eq('id', sellerPayload.id)
      .single();

    if (sError) throw sError;
    const commissionRate = seller.commission_rate || 0.10;

    // 3. Get order items for these products
    const { data: orderItems, error: oError } = await supabaseAdmin
      .from('order_items')
      .select('*, orders(status)')
      .in('product_id', productIds);

    if (oError) throw oError;

    // 4. Calculate stats
    // We only count 'confirmed', 'dispatched', or 'delivered' for real profit
    const validItems = orderItems.filter((item: any) => 
      ['confirmed', 'dispatched', 'delivered'].includes(item.orders?.status)
    );

    const totalRevenue = validItems.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const totalPotentialProfit = totalRevenue * (1 - commissionRate);
    const salesCount = validItems.length;

    // 5. Get recent activity (recent orders)
    const recentOrders = orderItems
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_name: products.find(p => p.id === item.product_id || p.mock_id === item.product_id)?.name || 'Unknown Product',
        quantity: item.quantity,
        total: item.unit_price * item.quantity,
        status: item.orders?.status || 'unknown',
        date: item.created_at
      }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalPotentialProfit,
        salesCount,
        productCount: products.length,
        commissionRate
      },
      recentOrders
    });

  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
