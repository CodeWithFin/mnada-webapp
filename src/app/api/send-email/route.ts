import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, orderDetails, total } = await req.json();

    const data = await resend.emails.send({
      from: 'Mnada <onboarding@resend.dev>', // Update this later if you have a custom domain
      to: [email],
      subject: 'Order Confirmation - Mnada',
      html: `
        <div style="font-family: monospace; padding: 20px; color: #1c1a19;">
          <h1 style="text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
          <p>Thank you for your purchase from Mnada.</p>
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
