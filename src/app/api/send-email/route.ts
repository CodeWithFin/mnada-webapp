import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSMS } from "@/lib/tilil";
import { getOrderReference } from "@/lib/orderReference";
import { normalizePhone } from "@/lib/phone";
import { resend } from "@/lib/resend";

const OWNER_PHONE = "0746551520";

type CheckoutCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
  phone: string;
};

type CheckoutOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
};

export async function POST(req: Request) {
  try {
      customer,
      orderDetails,
      subtotal,
      shipping,
      discount,
      total
    }: {
      customer: CheckoutCustomer;
      orderDetails: CheckoutOrderItem[];
      subtotal: number;
      shipping: number;
      discount?: { codeId: string; code: string; amount: number } | null;
      total: number | string;
    } = await req.json();

    const normalizedPhone = normalizePhone(customer.phone);

    // 1. Insert Order into Database
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_email: customer.email,
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        shipping_address: customer.address,
        shipping_apartment: customer.apartment || null,
        shipping_city: customer.city,
        shipping_postal_code: customer.postalCode,
        customer_phone: normalizedPhone,
        subtotal: subtotal,
        shipping_cost: shipping,
        discount_code: discount?.code || null,
        discount_amount: discount?.amount || 0,
        total: total.toString()
      })
      .select('id, created_at')
      .single();

    if (orderError) {
      console.error("Failed to insert order:", orderError);
      return NextResponse.json({ error: "Failed to create order tracking record." }, { status: 500 });
    }

    // 1b. Record Discount Usage
    if (discount?.codeId) {
      const { error: usageError } = await supabaseAdmin
        .from('discount_usage')
        .insert({
          code_id: discount.codeId,
          email: customer.email.toLowerCase().trim(),
          order_id: orderData.id
        });
      
      if (usageError) {
        console.error("Failed to record discount usage:", usageError);
      }
    }

    // 2. Insert Order Items
    const orderItemsToInsert = orderDetails.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Failed to insert order items:", itemsError);
    }

    // 3. Send SMS notifications
    const totalNum = parseFloat(String(total));
    const totalFormatted = isNaN(totalNum) ? String(total) : totalNum.toFixed(2);

    const itemsSummary = orderDetails
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");

    const smsPromises: Promise<void>[] = [];
    const orderReference = getOrderReference(orderData);

    // SMS to customer (only if they provided a phone number)
    if (normalizedPhone) {
      const customerMsg =
        `Hello ${customer.firstName}, your Mnada order ${orderReference} has been received! ` +
        `Total: KSh ${totalFormatted}. We will contact you to arrange payment & delivery. Thank you!`;
      smsPromises.push(sendSMS(normalizedPhone, customerMsg));
    }

    // SMS to owner
    const ownerMsg =
      `New Mnada order ${orderReference} from ${customer.firstName} ${customer.lastName}` +
      (normalizedPhone ? ` (${normalizedPhone})` : "") +
      `. Items: ${itemsSummary}. Total: KSh ${totalFormatted}.`;
    smsPromises.push(sendSMS(OWNER_PHONE, ownerMsg));

    // 3b. SMS to individual sellers
    try {
      // Find all unique products in this order
      const productIds = orderDetails.map(item => item.id);
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, mock_id, name, seller_id, sellers(phone, brand_name)')
        .or(`id.in.(${productIds.join(',')}),mock_id.in.(${productIds.join(',')})`);

      if (products) {
        const sellerMessages = new Map<string, { phone: string, items: string[], brand: string }>();

        orderDetails.forEach(item => {
          const product = products.find(p => p.id === item.id || p.mock_id === item.id);
          if (!product) return;
          
          const seller = (product as any)?.sellers;
          if (seller?.phone) {
            const sellerId = product.seller_id!;
            if (!sellerMessages.has(sellerId)) {
              sellerMessages.set(sellerId, { phone: seller.phone, items: [], brand: seller.brand_name });
            }
            sellerMessages.get(sellerId)!.items.push(`${item.name} x${item.quantity}`);
          }
        });

        sellerMessages.forEach((data, sellerId) => {
          const sellerMsg = `Hello ${data.brand}, you have a new order ${orderReference}! Items: ${data.items.join(', ')}. Login to your Mnada portal to manage it.`;
          smsPromises.push(sendSMS(data.phone, sellerMsg));
        });
      }
    } catch (sellerSmsError) {
      console.error("Failed to send seller notifications:", sellerSmsError);
    }

    const smsResults = await Promise.allSettled(smsPromises);
    smsResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`SMS [${i}] failed:`, result.reason);
      }
    });

    // 4. Send Confirmation Email via Resend
    try {
      console.log("Attempting to send email to:", customer.email);
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Mnada <orders@mnada.shop>',
        to: [customer.email],
        subject: `Order Confirmation - ${orderReference}`,
        html: `
          <div style="font-family: monospace; padding: 20px; color: #1c1a19;">
            <h2 style="text-transform: uppercase; border-bottom: 2px solid #1c1a19; padding-bottom: 10px;">MNADA</h2>
            <p>Hello ${customer.firstName},</p>
            <p>Thank you for your purchase from Mnada. Your order <strong>${orderReference}</strong> has been received.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <h3 style="text-transform: uppercase;">Order Summary</h3>
            <ul style="list-style: none; padding: 0;">
              ${orderDetails.map((item) => `
                <li style="margin-bottom: 10px;">
                  <strong>${item.name}</strong> x ${item.quantity} - KSh ${item.price.toFixed(2)}
                </li>
              `).join('')}
            </ul>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <p style="font-size: 18px;"><strong>Total: KSh ${totalFormatted}</strong></p>
            <p style="margin-top: 20px;">We will contact you shortly to arrange payment and delivery.</p>
            <p style="font-size: 10px; color: #999; margin-top: 40px;">
              Est. 2025 • Nakuru, Kenya
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error("Resend API rejected the request:", emailError);
      } else {
        console.log("Resend API accepted the request. Email ID:", emailData?.id);
      }
    } catch (err) {
      console.error("Critical error in Resend integration:", err);
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({ success: true, orderId: orderData.id, orderReference });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

