import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getInternalNotificationEmail,
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
      } catch {
        body = {};
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const {
      orderNumber,
      customerName,
      customerEmail,
      beefShare,
      status,
      notes,
      fulfillmentMethod,
      pickupDate,
      deliveryDate,
    } = body;

    if (!orderNumber || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields: orderNumber or customerEmail' });
    }

    let statusHeader = `Order Update: ${status}`;
    let statusBadgeColor = '#d4af37'; // Amber default

    switch (status) {
      case 'Order Received':
        statusHeader = '✨ Order & Reservation Received';
        statusBadgeColor = '#3b82f6';
        break;
      case 'Reservation Confirmed':
        statusHeader = '🎉 Reservation Confirmed by Master Butcher';
        statusBadgeColor = '#10b981';
        break;
      case 'Payment Confirmed':
        statusHeader = '💳 Payment Received & Confirmed';
        statusBadgeColor = '#10b981';
        break;
      case 'Preparing Beef Share':
        statusHeader = '🥩 Preparing & Dry-Aging Your Beef Share';
        statusBadgeColor = '#f59e0b';
        break;
      case 'Quality Inspection':
        statusHeader = '🔍 Quality Inspection in Progress';
        statusBadgeColor = '#8b5cf6';
        break;
      case 'Packaged':
        statusHeader = '📦 Custom Cut & Flash Frozen Packaging Complete';
        statusBadgeColor = '#06b6d4';
        break;
      case 'Ready for Pickup':
        statusHeader = '📍 Your Beef Share is Ready for Pickup!';
        statusBadgeColor = '#10b981';
        break;
      case 'Out for Delivery':
        statusHeader = '🚚 Your Beef Share is Out for Delivery!';
        statusBadgeColor = '#3b82f6';
        break;
      case 'Delivered':
        statusHeader = '✅ Order Delivered / Picked Up - Enjoy Your Feast!';
        statusBadgeColor = '#10b981';
        break;
    }

    const subject = `${statusHeader} [#${orderNumber}] - Bastanzi Premium Beef Co.`;

    const customerHtmlContent = `
      <div style="font-family: 'Georgia', serif; background-color: #0c0c0e; color: #f4f4f6; padding: 40px; border-radius: 8px; border: 1px solid #d4af37; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; uppercase;">BASTANZI PREMIUM BEEF CO.</h1>
          <p style="text-transform: uppercase; letter-spacing: 3px; color: #a1a1aa; font-size: 11px; margin-top: 4px;">Order Management & Real-Time Tracking System</p>
        </div>
        <hr style="border-color: #27272a; margin: 20px 0;" />
        
        <div style="background-color: #18181b; padding: 16px; border-radius: 6px; border-left: 4px solid ${statusBadgeColor}; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Current Order Status</p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: ${statusBadgeColor};">${status}</p>
        </div>

        <h2 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">Order Summary</h2>
        <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${customerName}</p>
        <p style="margin: 6px 0;"><strong>Order Number:</strong> <span style="color: #d4af37; font-family: monospace; font-size: 15px;">${orderNumber}</span></p>
        <p style="margin: 6px 0;"><strong>Beef Share:</strong> ${beefShare}</p>
        <p style="margin: 6px 0;"><strong>Fulfillment Method:</strong> ${fulfillmentMethod || 'Pickup'}</p>
        ${pickupDate ? `<p style="margin: 6px 0;"><strong>Scheduled Pickup Date:</strong> ${pickupDate}</p>` : ''}
        ${deliveryDate ? `<p style="margin: 6px 0;"><strong>Estimated Delivery Date:</strong> ${deliveryDate}</p>` : ''}
        ${notes ? `<p style="margin: 6px 0;"><strong>Butcher / Status Notes:</strong> ${notes}</p>` : ''}

        <div style="background-color: #122117; padding: 20px; border-radius: 6px; border: 1px solid #1e3a29; margin-top: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; color: #a7f3d0; font-size: 14px;">Track your live order progress 24/7 on our website:</p>
          <a href="https://bastanzibeef.com/#track-order" style="display: inline-block; background-color: #d4af37; color: #000000; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 4px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Track My Order (#${orderNumber})</a>
        </div>

        <hr style="border-color: #27272a; margin: 30px 0 15px 0;" />
        <p style="text-align: center; font-size: 11px; color: #71717a; margin: 0;">
          Bastanzi Premium Beef Co. • Pasture Raised • 21-Day Dry Aged • USDA Inspected<br />
          Questions? Contact our concierge at info@bastanzibeef.com.
        </p>
      </div>
    `;

    const internalHtmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #f8fafc; color: #1e293b; border-left: 4px solid #3b82f6;">
        <h2 style="color: #0f172a; margin-top: 0;">📋 Order Status Updated: #${orderNumber}</h2>
        <p><strong>Status:</strong> <span style="font-weight: bold; color: #0369a1;">${status}</span></p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Share:</strong> ${beefShare}</p>
        <p><strong>Fulfillment:</strong> ${fulfillmentMethod || 'Pickup'}</p>
        ${pickupDate ? `<p><strong>Pickup Date:</strong> ${pickupDate}</p>` : ''}
        ${deliveryDate ? `<p><strong>Delivery Date:</strong> ${deliveryDate}</p>` : ''}
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p style="font-size: 11px; color: #64748b; margin-top: 20px;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    `;

    // 1. Send Customer Order Status Update
    await sendEmailWithDiagnostics({
      type: 'order_status_customer',
      category: 'customer',
      to: customerEmail,
      subject,
      html: customerHtmlContent,
    });

    // 2. Send Business Notification to RESEND_NOTIFICATION_EMAIL
    const internalRecipient = getInternalNotificationEmail();
    await sendEmailWithDiagnostics({
      type: 'order_status_internal',
      category: 'internal',
      to: internalRecipient,
      subject: `[Internal Order Update] #${orderNumber} → ${status}`,
      html: internalHtmlContent,
    });

    return res.status(200).json({
      success: true,
      message: 'Order status notification processed successfully.',
    });
  } catch (err: any) {
    console.error('Order notification handler error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send notification email' });
  }
}
