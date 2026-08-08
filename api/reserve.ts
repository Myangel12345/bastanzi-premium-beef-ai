import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('Incoming reservation request body:', req.body);

  try {
    let body: any = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse req.body as JSON string:', e);
        body = {};
      }
    } else if (Buffer.isBuffer(req.body)) {
      try {
        body = JSON.parse(req.body.toString('utf-8'));
      } catch (e) {
        console.error('Failed to parse req.body Buffer as JSON:', e);
        body = {};
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const name = body.name || body.fullName || body.customerName || '';
    const email = body.email || body.customerEmail || '';
    const phone = body.phone || body.phoneNumber || '';
    const address = body.address || '';
    const city = body.city || '';
    const state = body.state || '';
    const zip = body.zip || '';
    const shareSize = body.shareSize || body.selectedShare || body.tier || '';
    const finish = body.finish || body.finishingOption || '';
    const preferredDeliveryDate = body.preferredDeliveryDate || body.deliveryDate || '';
    const notes = body.notes || body.specialNotes || '';

    if (!name || !email || !shareSize) {
      console.log('Reservation validation failure:', {
        hasName: !!name,
        hasEmail: !!email,
        hasShareSize: !!shareSize,
        parsedBody: body,
        rawReqBody: req.body,
      });
      return res.status(400).json({
        error: `Missing required reservation fields. Received: name=${Boolean(name)}, email=${Boolean(email)}, shareSize=${Boolean(shareSize)}.`
      });
    }

    const reservationId = body.orderNumber || body.reservationId || ('RES-' + Math.random().toString(36).substring(2, 9).toUpperCase());
    const createdAt = new Date().toISOString();

    const reservationRecord = {
      id: reservationId,
      name,
      email,
      phone: phone || 'N/A',
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
      shareSize,
      finish: finish || 'Pasture-Raised Grain-Finished',
      preferredDeliveryDate: preferredDeliveryDate || '',
      notes: notes || '',
      createdAt,
      status: 'Pending',
    };

    // Initialize Resend if API key exists
    const resendApiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Bastanzi Beef Orders <orders@bastanzibeef.com>';
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';

    console.log('--- EMAIL NOTIFICATION DIAGNOSTICS ---');
    console.log('RESEND_API_KEY present:', Boolean(resendApiKey), resendApiKey ? `(length: ${resendApiKey.length})` : '');
    console.log('RESEND_FROM_EMAIL:', fromEmail);
    console.log('NOTIFICATION_EMAIL:', notificationEmail);
    console.log('Customer Email:', email);

    let resend: Resend | null = null;
    if (resendApiKey) {
      try {
        resend = new Resend(resendApiKey);
      } catch (resendErr: any) {
        console.error('Failed to initialize Resend client:', resendErr);
      }
    }

    let customerEmailResponse: any = null;
    let internalEmailResponse: any = null;
    let emailStatus = 'Not configured (Simulated Success)';

    if (resend) {
      const customerHtml = `
        <div style="font-family: 'Georgia', serif; background-color: #0c0c0e; color: #f4f4f6; padding: 40px; border-radius: 8px; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; margin-bottom: 8px;">BASTANZI PREMIUM BEEF CO.</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; font-size: 12px;">Pasture to Table Luxury Beef Reservation Confirmation</p>
          <hr style="border-color: #27272a; margin: 20px 0;" />
          
          <h2 style="color: #ffffff;">Reservation Confirmation #${reservationId}</h2>
          <p>Dear ${name},</p>
          <p>Thank you for reserving your pasture-raised beef share with Bastanzi Premium Beef Co.</p>
          
          <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #d4af37; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Order / Reservation #:</strong> <span style="color: #d4af37;">${reservationId}</span></p>
            <p style="margin: 4px 0;"><strong>Selected Share:</strong> ${shareSize} Beef Share</p>
            <p style="margin: 4px 0;"><strong>Finishing:</strong> ${finish}</p>
            <p style="margin: 4px 0;"><strong>Preferred Delivery:</strong> ${preferredDeliveryDate || 'Standard Harvest'}</p>
          </div>
          
          <p>Our Master Butcher will review your reservation details and contact you to finalize custom cut selections.</p>
          <p style="color: #a1a1aa; font-size: 12px; margin-top: 30px;">Bastanzi Premium Beef Co. • Pasture Raised • 21-Day Dry Aged</p>
        </div>
      `;

      const internalHtml = `
        <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f4f4f5; color: #18181b;">
          <h2 style="color: #b45309;">🚨 NEW RESERVATION RECEIVED - #${reservationId}</h2>
          <hr />
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Customer Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Shipping Address:</strong> ${address}, ${city}, ${state} ${zip}</p>
          <p><strong>Share Size:</strong> ${shareSize}</p>
          <p><strong>Finish:</strong> ${finish}</p>
          <p><strong>Preferred Delivery:</strong> ${preferredDeliveryDate}</p>
          <p><strong>Notes:</strong> ${notes || 'None'}</p>
          <p><strong>Timestamp:</strong> ${createdAt}</p>
        </div>
      `;

      // Helper function to send email with fallback for unverified sender domain
      const sendSingleEmail = async (toEmail: string, subjectStr: string, contentHtml: string) => {
        let sender = fromEmail;
        let response = await resend!.emails.send({
          from: sender,
          to: [toEmail],
          subject: subjectStr,
          html: contentHtml,
        });

        // If primary fromEmail fails due to unverified domain error, retry with onboarding@resend.dev
        if (response.error && response.error.message && (
          response.error.message.includes('domain') || 
          response.error.message.includes('verify') ||
          response.error.message.includes('not owned') ||
          response.error.message.includes('validation_error')
        )) {
          console.warn(`Primary sender ${sender} failed for ${toEmail}. Retrying with onboarding@resend.dev fallback...`);
          sender = 'Bastanzi Beef <onboarding@resend.dev>';
          response = await resend!.emails.send({
            from: sender,
            to: [toEmail],
            subject: subjectStr,
            html: contentHtml,
          });
        }
        return { senderUsed: sender, response };
      };

      try {
        // 1. Send Customer Confirmation Email
        const custResult = await sendSingleEmail(
          email,
          `✨ Reservation Confirmed [#${reservationId}] - Bastanzi Premium Beef Co.`,
          customerHtml
        );
        customerEmailResponse = {
          to: email,
          from: custResult.senderUsed,
          ...custResult.response
        };
        console.log('Customer Email Resend API Response:', JSON.stringify(customerEmailResponse, null, 2));

        // 2. Send Internal Notification Email
        const intResult = await sendSingleEmail(
          notificationEmail,
          `🔔 New Reservation Alert [#${reservationId}] - ${name}`,
          internalHtml
        );
        internalEmailResponse = {
          to: notificationEmail,
          from: intResult.senderUsed,
          ...intResult.response
        };
        console.log('Internal Email Resend API Response:', JSON.stringify(internalEmailResponse, null, 2));

        const custSuccess = !custResult.response.error && custResult.response.data?.id;
        const intSuccess = !intResult.response.error && intResult.response.data?.id;

        if (custSuccess && intSuccess) {
          emailStatus = 'Both customer and internal emails sent successfully';
        } else if (custSuccess || intSuccess) {
          emailStatus = 'Partial email success (Check resendResponses log for details)';
        } else {
          emailStatus = 'Email send attempted but returned error from Resend API';
        }

      } catch (emailErr: any) {
        console.error('Unhandled Resend email exception:', emailErr);
        emailStatus = `Email exception: ${emailErr.message || 'Failed'}`;
      }
    }

    return res.status(200).json({
      success: true,
      reservationId,
      message: 'Beef Share Reservation successfully logged and confirmed.',
      emailStatus,
      resendResponses: {
        resendApiKeyConfigured: Boolean(resendApiKey),
        apiKeyFingerprint: resendApiKey ? {
          exists: true,
          length: resendApiKey.length,
          prefix: resendApiKey.substring(0, 6),
          suffix: resendApiKey.substring(resendApiKey.length - 4),
          startsWithRe: resendApiKey.startsWith('re_')
        } : { exists: false },
        fromEmailConfigured: fromEmail,
        notificationEmailConfigured: notificationEmail,
        customerEmailResponse,
        internalEmailResponse,
      },
      record: reservationRecord,
    });
  } catch (error: any) {
    console.error('Reservation API error:', error);
    return res.status(500).json({ error: 'Server error processing reservation' });
  }
}
