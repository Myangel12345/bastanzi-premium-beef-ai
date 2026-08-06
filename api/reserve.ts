import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getSupabaseServerClient, serverOrdersCache } from './track.ts';

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

    // Standardized Bastanzi Order Number format
    const orderNumber = body.orderNumber || body.order_number || (`BST-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    const reservationId = orderNumber;
    const createdAt = new Date().toISOString();

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const customerObj = {
      id: 'cust-' + Math.random().toString(36).substring(2, 9),
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || 'N/A',
      address: address || '',
      city: city || '',
      state: state || '',
      zip_code: zip || '',
      created_at: createdAt,
    };

    const fullOrderObj = {
      id: reservationId,
      order_number: orderNumber,
      customer_id: customerObj.id,
      beef_share: shareSize,
      estimated_weight: 'TBD',
      total_price: 0,
      payment_status: 'Pending Deposit',
      fulfillment_method: 'Pickup',
      pickup_date: preferredDeliveryDate || '',
      delivery_date: '',
      current_status: 'Order Received',
      notes: notes || '',
      created_at: createdAt,
      updated_at: createdAt,
      customer: customerObj,
      history: [
        {
          id: 'hist-' + Math.random().toString(36).substring(2, 9),
          order_id: reservationId,
          status: 'Order Received',
          notes: notes || 'Reservation submitted via online concierge.',
          created_at: createdAt,
          created_by: 'System',
        },
      ],
    };

    // Save to server-side memory cache
    serverOrdersCache.unshift(fullOrderObj);

    // Save to Supabase from server if client is available
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        console.log(`[SERVER /api/reserve] Writing reservation #${orderNumber} to Supabase database...`);
        const { data: custData, error: custErr } = await supabase
          .from('customers')
          .insert([
            {
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
              address: address,
              city: city,
              state: state,
              zip_code: zip,
            },
          ])
          .select()
          .single();

        if (custErr) {
          console.warn('[SERVER /api/reserve] Customer insert note:', custErr.message);
        }

        const dbCustId = custData ? custData.id : customerObj.id;

        const { data: ordData, error: ordErr } = await supabase
          .from('orders')
          .insert([
            {
              order_number: orderNumber,
              customer_id: dbCustId,
              beef_share: shareSize,
              estimated_weight: 'TBD',
              total_price: 0,
              payment_status: 'Pending Deposit',
              fulfillment_method: 'Pickup',
              pickup_date: preferredDeliveryDate || '',
              delivery_date: '',
              current_status: 'Order Received',
              notes: notes || '',
            },
          ])
          .select()
          .single();

        if (ordErr) {
          console.warn('[SERVER /api/reserve] Order insert note:', ordErr.message);
        } else if (ordData) {
          await supabase.from('order_history').insert([
            {
              order_id: ordData.id,
              status: 'Order Received',
              notes: notes || 'Reservation received',
              created_by: 'System',
            },
          ]);
          console.log(`[SERVER /api/reserve] Successfully persisted order #${orderNumber} in Supabase with DB ID ${ordData.id}`);
        }
      } catch (dbEx: any) {
        console.error('[SERVER /api/reserve] Supabase write exception:', dbEx);
      }
    }

    const reservationRecord = {
      id: reservationId,
      orderNumber,
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
      status: 'Order Received',
    };

    // Initialize Resend if API key exists
    const resendApiKey = process.env.RESEND_API_KEY || '';
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'orders@bastanzibeef.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Bastanzi Beef Orders <orders@bastanzibeef.com>';

    let emailStatus = 'Not configured (Simulated Success)';
    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [notificationEmail, email],
          subject: `✨ New Beef Share Reservation #${orderNumber} - Bastanzi Premium Beef Co.`,
          html: `
            <div style="font-family: 'Georgia', serif; background-color: #0c0c0e; color: #f4f4f6; padding: 40px; border-radius: 8px; border: 1px solid #d4af37;">
              <h1 style="color: #d4af37; margin-bottom: 8px;">BASTANZI PREMIUM BEEF CO.</h1>
              <p style="text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; font-size: 12px;">Pasture to Table Luxury Beef Reservation</p>
              <hr style="border-color: #27272a; margin: 20px 0;" />
              
              <h2 style="color: #ffffff;">Reservation Summary #${orderNumber}</h2>
              <p><strong>Customer:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Address:</strong> ${address || ''}, ${city || ''}, ${state || ''} ${zip || ''}</p>
              <p><strong>Selected Share Size:</strong> <span style="color: #d4af37; font-weight: bold;">${shareSize} Beef Share</span></p>
              <p><strong>Finishing Preference:</strong> ${finish || 'Standard'}</p>
              <p><strong>Preferred Delivery Date:</strong> ${preferredDeliveryDate || 'As soon as available'}</p>
              <p><strong>Special Butcher Notes:</strong> ${notes || 'None specified'}</p>
              
              <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #d4af37; margin-top: 25px;">
                <p style="margin: 0; color: #d4af37; font-size: 14px;"><strong>Next Steps:</strong> Our ranch concierge will review your reservation and contact you via email at ${email} within 24 hours to confirm custom cutting instructions and deposit placement.</p>
              </div>
            </div>
          `,
        });
        emailStatus = 'Sent successfully';
      } catch (emailErr: any) {
        console.error('Resend email error:', emailErr);
        emailStatus = `Email error: ${emailErr.message || 'Failed'}`;
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
