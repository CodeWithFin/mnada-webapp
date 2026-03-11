import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customer, orderDetails, subtotal, shipping, total } = await req.json();

    // 1. Insert Order into Database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customer.email,
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        shipping_address: customer.address,
        shipping_apartment: customer.apartment || null,
        shipping_city: customer.city,
        shipping_postal_code: customer.postalCode,
        customer_phone: customer.phone,
        subtotal: subtotal,
        shipping_cost: shipping,
        total: total.toString() // stored as text per schema
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Failed to insert order:", orderError);
      return NextResponse.json({ error: "Failed to create order tracking record." }, { status: 500 });
    }

    // 2. Insert Order Items
    const orderItemsToInsert = orderDetails.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Failed to insert order items:", itemsError);
      // We don't fail the whole request here, but it's bad.
    }

    // 3. Send Confirmation Email
    const data = await resend.emails.send({
      from: 'Mnada <onboarding@resend.dev>', // Update this later if you have a custom domain
      to: [customer.email],
      subject: 'Order Confirmation - Mnada',
      html: `
        <div style="font-family: monospace; padding: 20px; color: #1c1a19;">
          <h1 style="text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
          <p>Thank you for your order from Mnada.</p>
          <p style="background-color: #f8f8f8; padding: 10px; border-left: 3px solid #a58c69;">
            <strong>Payment Status: Pending</strong><br/>
            We have received your order. We will follow up with you shortly to arrange for physical payment and delivery.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <h3 style="text-transform: uppercase;">Order Summary</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderDetails.map((item: any) => `
              <li style="margin-bottom: 10px;">
                <strong>${item.name}</strong> x ${item.quantity} - KSh ${item.price.toFixed(2)}
              </li>
            `).join('')}
          </ul>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <p style="font-size: 18px;"><strong>Total: KSh ${total.toFixed(2)}</strong></p>
          <p style="font-size: 10px; color: #999; margin-top: 40px;">
            Est. 2025 • Nakuru, Kenya
          </p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
