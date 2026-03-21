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
    // Earned: Only delivered
    const deliveredItems = orderItems.filter((item: any) => item.orders?.status === 'delivered');
    const earnedRevenue = deliveredItems.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 0)), 0);
    const earnedProfit = earnedRevenue * (1 - commissionRate);

    // Potential: Confirmed or Dispatched but not yet delivered
    const potentialItems = orderItems.filter((item: any) => 
      ['confirmed', 'dispatched'].includes(item.orders?.status)
    );
    const potentialRevenue = potentialItems.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 0)), 0);
    const potentialProfit = potentialRevenue * (1 - commissionRate);

    // Total stats for overview
    const totalRevenue = (earnedRevenue + potentialRevenue);
    const salesCount = (deliveredItems.length + potentialItems.length);

    // 5. Get recent activity (recent orders)
    const recentOrders = orderItems
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_name: products.find(p => p.id === item.product_id || p.mock_id === item.product_id)?.name || 'Unknown Product',
        quantity: item.quantity,
        total: (item.price || 0) * (item.quantity || 0),
        status: item.orders?.status || 'unknown',
        date: item.created_at
      }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        earnedProfit,
        potentialProfit,
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
