import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const admin = await verifyRoleRequest(req, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message, customEmails } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    let recipients: string[] = [];

    if (customEmails && customEmails.length > 0) {
      recipients = customEmails;
    } else {
      const { data, error } = await supabaseAdmin
        .from('subscribers')
        .select('email')
        .eq('status', 'active');

      if (error) throw error;
      recipients = data.map(s => s.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    // Resend batch sending (limit 100 per call for bulk)
    const batchRequests = recipients.map(email => ({
      from: 'Mnada <orders@mnada.shop>',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1a19;">
          <h1 style="text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #eee; padding-bottom: 20px;">Mnada</h1>
          <div style="line-height: 1.6; font-size: 16px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
            Mnada Collective • Nakuru, Kenya
          </p>
        </div>
      `
    }));

    // Chunks of 100 for Resend batch API
    const chunkSize = 100;
    for (let i = 0; i < batchRequests.length; i += chunkSize) {
      const chunk = batchRequests.slice(i, i + chunkSize);
      const { error: batchError } = await resend.batch.send(chunk);
      if (batchError) {
        console.error('Resend Batch Error:', batchError);
        return NextResponse.json({ 
          error: 'Failed to send batch emails', 
          details: batchError 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: recipients.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
