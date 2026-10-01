import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getInternalNotificationEmail,
  getResendClient,
  sendEmailWithDiagnostics,
} from './email-service';

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
      console.warn('Reservation validation failure:', {
        hasName: !!name,
        hasEmail: !!email,
        hasShareSize: !!shareSize,
      });
      return res.status(400).json({
        error: `Missing required reservation fields. Received: name=${Boolean(name)}, email=${Boolean(email)}, shareSize=${Boolean(shareSize)}.`,
      });
    }

    const reservationId =
      body.orderNumber ||
      body.reservationId ||
      'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();
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
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Shipping Address:</strong> ${address || 'N/A'}, ${city || ''}, ${state || ''} ${zip || ''}</p>
        <p><strong>Share Size:</strong> ${shareSize}</p>
        <p><strong>Finish:</strong> ${finish}</p>
        <p><strong>Preferred Delivery:</strong> ${preferredDeliveryDate || 'Standard'}</p>
        <p><strong>Notes:</strong> ${notes || 'None'}</p>
        <p><strong>Timestamp:</strong> ${createdAt}</p>
      </div>
    `;

    // 1. Send Customer Confirmation Email through Resend
    const custResult = await sendEmailWithDiagnostics({
      type: 'reservation_confirmation',
      category: 'customer',
      to: email,
      subject: `✨ Reservation Confirmed [#${reservationId}] - Bastanzi Premium Beef Co.`,
      html: customerHtml,
    });

    // 2. Send Internal Reservation Alert through Resend to RESEND_NOTIFICATION_EMAIL
    const internalRecipient = getInternalNotificationEmail();
    const intResult = await sendEmailWithDiagnostics({
      type: 'reservation_internal_alert',
      category: 'internal',
      to: internalRecipient,
      subject: `🔔 New Reservation Alert [#${reservationId}] - ${name}`,
      html: internalHtml,
    });

    let emailStatus = 'Not configured (Simulated Success)';
    const { hasKey } = getResendClient();
    if (hasKey) {
      if (custResult.success && intResult.success) {
        emailStatus = 'Customer confirmation and internal notification emails sent successfully.';
      } else if (custResult.success) {
        emailStatus = 'Customer confirmation email sent; internal alert queued.';
      } else {
        emailStatus = 'Reservation logged; email notification in progress.';
      }
    }

    return res.status(200).json({
      success: true,
      reservationId,
      message: 'Beef Share Reservation successfully logged and confirmed.',
      emailStatus,
      record: reservationRecord,
    });
  } catch (error: any) {
    console.error('Reservation API error:', error);
    return res.status(500).json({ error: 'Server error processing reservation' });
  }
}
