import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../lib/auth.js';
import { getOrders, saveOrder, deleteOrder, ShipmentOrder } from '../lib/db.js';
import { sendEmail, getBrandedEmailWrapper } from '../lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Enforce authentication
  const authHeader = req.headers.authorization;
  const session = verifyAdminToken(authHeader as string);

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication token required',
      message: 'Access denied. Please log in with valid admin credentials.',
    });
  }

  // GET: List all orders
  if (req.method === 'GET') {
    const orders = await getOrders();
    return res.status(200).json({ success: true, shipments: orders });
  }

  // POST: Create a new shipment / reservation
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const now = new Date().toISOString();
      const newId = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const newRecord: ShipmentOrder = {
        id: newId,
        trackingNumber: body.trackingNumber || `OGF-${newId.replace('RES-', '')}`,
        name: body.name || 'Valued Customer',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        city: body.city || '',
        state: body.state || '',
        zip: body.zip || '',
        shareSize: body.shareSize || 'Quarter',
        finish: body.finish || 'Pasture-Raised Grain-Finished',
        status: body.status || 'Order received',
        origin: body.origin || 'Bastanzi Ranch - Sheridan, MT',
        destination: body.destination || `${body.city || ''}, ${body.state || ''}`.trim() || 'Destination Address',
        carrier: body.carrier || 'OGFCARGO Cold Chain Logistics',
        estimatedDelivery: body.estimatedDelivery || 'In 3-5 Business Days',
        createdAt: now,
        updated_at: now,
        updated_by: session.email,
        notes: body.notes || '',
        totalAmount: body.totalAmount || 1150,
        paymentStatus: body.paymentStatus || 'Paid',
      };

      await saveOrder(newRecord);

      // Send Order Confirmation Email
      if (newRecord.email) {
        const html = getBrandedEmailWrapper(
          'Order Confirmation',
          `
            <h2 style="color: #fbbf24; margin-top: 0;">Order & Share Reservation Confirmed!</h2>
            <p>Dear ${newRecord.name},</p>
            <p>Thank you for choosing Bastanzi Premium Beef Co. Your reservation <strong>#${newRecord.id}</strong> has been logged into our master ranch ledger.</p>
            
            <div style="background-[#0f2117]; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0;">
              <p style="margin: 0; color: #fbbf24; font-weight: bold;">Order Summary:</p>
              <p style="margin: 5px 0;">Share: ${newRecord.shareSize} Beef Share (${newRecord.finish})</p>
              <p style="margin: 5px 0;">Waybill Tracking #: <strong>${newRecord.trackingNumber}</strong></p>
              <p style="margin: 5px 0;">Current Status: <span style="color: #34d399; font-weight: bold;">${newRecord.status}</span></p>
            </div>
            
            <p>You can monitor your beef share progression across all 9 processing and cold-chain shipping stages on our website using your tracking number.</p>
          `
        );
        await sendEmail({
          to: newRecord.email,
          subject: `✨ Order Confirmed: Bastanzi Beef Share #${newRecord.id}`,
          html,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        shipment: newRecord,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'Invalid payload or server error' });
    }
  }

  // PUT: Update shipment details or status
  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status, notes, destination, carrier, estimatedDelivery, shareSize, finish, name, email, phone } = body;

      if (!id) {
        return res.status(400).json({ error: 'Shipment ID is required' });
      }

      const allOrders = await getOrders();
      const existing = allOrders.find((o) => o.id === id) || {
        id,
        trackingNumber: `OGF-${id.replace('RES-', '')}`,
        name: name || 'Customer',
        email: email || '',
        phone: phone || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        shareSize: shareSize || 'Quarter',
        finish: finish || 'Pasture-Raised Grain-Finished',
        status: 'Order received' as const,
        origin: 'Bastanzi Ranch - Sheridan, MT',
        destination: destination || 'Customer Address',
        carrier: carrier || 'OGFCARGO Cold Chain Logistics',
        estimatedDelivery: estimatedDelivery || 'In 3-5 Business Days',
        createdAt: new Date().toISOString(),
      };

      const now = new Date().toISOString();
      const oldStatus = existing.status;

      const updatedRecord: ShipmentOrder = {
        ...existing,
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(destination && { destination }),
        ...(carrier && { carrier }),
        ...(estimatedDelivery && { estimatedDelivery }),
        ...(shareSize && { shareSize }),
        ...(finish && { finish }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        updated_at: now,
        updated_by: session.email,
      };

      await saveOrder(updatedRecord);

      // Trigger automatic status update email if status changed
      if (status && status !== oldStatus && updatedRecord.email) {
        const html = getBrandedEmailWrapper(
          'Order Status Update',
          `
            <h2 style="color: #fbbf24; margin-top: 0;">Order Status Update: ${status}</h2>
            <p>Dear ${updatedRecord.name},</p>
            <p>Your Bastanzi Beef share order <strong>#${updatedRecord.id}</strong> has progressed to a new stage!</p>

            <div style="background-[#0f2117]; padding: 20px; border-radius: 8px; border: 1px solid #059669; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #34d399;">
                Status: ${status}
              </p>
              <p style="margin: 0; color: #d1d5db; font-size: 13px;">
                Tracking Number: <strong>${updatedRecord.trackingNumber}</strong><br/>
                Estimated Delivery: <strong>${updatedRecord.estimatedDelivery}</strong>
              </p>
            </div>

            <p>You can view full temperature logs and transportation milestones anytime on our tracking portal.</p>
          `
        );

        await sendEmail({
          to: updatedRecord.email,
          subject: `🚚 Beef Share Update: ${status} (#${updatedRecord.id})`,
          html,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Shipment ${id} updated successfully by ${session.email}`,
        shipment: updatedRecord,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update shipment' });
    }
  }

  // DELETE: Delete shipment / reservation
  if (req.method === 'DELETE') {
    try {
      const id = (req.query.id as string) || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Shipment ID is required' });
      }

      await deleteOrder(id);

      return res.status(200).json({
        success: true,
        message: `Shipment ${id} deleted by ${session.email}`,
        deletedId: id,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete shipment' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
