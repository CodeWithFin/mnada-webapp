import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSMS } from "@/lib/tilil";
import { getOrderReference } from "@/lib/orderReference";
import { normalizePhone } from "@/lib/phone";

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
    const {
      customer,
      orderDetails,
      subtotal,
      shipping,
      total
    }: {
      customer: CheckoutCustomer;
      orderDetails: CheckoutOrderItem[];
      subtotal: number;
      shipping: number;
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
        total: total.toString()
      })
      .select('id, created_at')
      .single();

    if (orderError) {
      console.error("Failed to insert order:", orderError);
      return NextResponse.json({ error: "Failed to create order tracking record." }, { status: 500 });
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

    const smsResults = await Promise.allSettled(smsPromises);
    smsResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`SMS [${i}] failed:`, result.reason);
      }
    });

    return NextResponse.json({ success: true, orderId: orderData.id, orderReference });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
