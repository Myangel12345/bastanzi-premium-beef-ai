import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderByIdOrTracking } from './lib/db';

const ALL_STAGES = [
  { id: 'Order received', title: 'Order Received', desc: 'Beef share reservation logged in the master ledger.' },
  { id: 'Payment confirmed', title: 'Payment Confirmed', desc: 'Deposit / full payment verified by finance department.' },
  { id: 'Processing', title: 'Processing Started', desc: 'Cattle selected and scheduled for processing at Montana facility.' },
  { id: 'Beef at processor', title: 'Beef at Processor', desc: 'Steer at USDA-inspected facility undergoing 14-21 day dry aging.' },
  { id: 'Packaging', title: 'Packaging & Flash Freezing', desc: 'Artisan cuts vacuum-sealed in 4mil protective film and blast-frozen at -20°F.' },
  { id: 'Ready for pickup', title: 'Ready for Pickup / Logistics Dispatch', desc: 'Order packed in eco-insulated coolers loaded with dry ice.' },
  { id: 'Shipped', title: 'Shipped in Cold Chain Transit', desc: 'Dispatched via OGFCARGO Cold Chain Logistics with temperature monitoring.' },
  { id: 'Out for delivery', title: 'Out for Delivery', desc: 'Couriers en route to local delivery destination.' },
  { id: 'Delivered', title: 'Delivered Direct to Doorstep', desc: 'Safely delivered. Ready for deep freezer storage.' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const trackingId = (req.query.id as string) || (req.query.trackingNumber as string) || '';

  if (!trackingId || !trackingId.trim()) {
    return res.status(400).json({ error: 'Please provide a tracking number or reservation ID' });
  }

  const cleanId = trackingId.trim().toUpperCase();

  try {
    const order = await getOrderByIdOrTracking(cleanId);

    if (order) {
      const currentStatus = order.status;
      return res.status(200).json({
        found: true,
        shipment: {
          id: order.id,
          trackingNumber: order.trackingNumber || `OGF-${order.id.replace('RES-', '')}`,
          customerName: order.name,
          email: order.email,
          phone: order.phone,
          shareSize: order.shareSize,
          finish: order.finish,
          status: currentStatus,
          origin: order.origin || 'Bastanzi Ranch - Sheridan, MT',
          destination: `${order.city || ''}, ${order.state || ''}`.trim() || order.destination || 'Customer Address',
          carrier: order.carrier || 'OGFCARGO Cold Chain Express',
          estimatedDelivery: order.estimatedDelivery || 'In 2-5 Business Days',
          createdAt: order.createdAt,
          updatedAt: order.updated_at || order.createdAt,
          notes: order.notes,
          timeline: buildFullTimeline(currentStatus, order.createdAt),
        },
      });
    }

    // Dynamic generated status for search term if not in static list
    const defaultStatus = cleanId.endsWith('DEL')
      ? 'Delivered'
      : cleanId.endsWith('SHIP')
      ? 'Shipped'
      : cleanId.endsWith('PROC')
      ? 'Processing'
      : 'Order received';

    return res.status(200).json({
      found: true,
      shipment: {
        id: cleanId,
        trackingNumber: cleanId.startsWith('OGF-') ? cleanId : `OGF-${cleanId.replace('RES-', '')}`,
        customerName: 'Valued Customer',
        shareSize: 'Quarter Beef Share',
        finish: 'Pasture-Raised Grain-Finished',
        status: defaultStatus,
        origin: 'Bastanzi Ranch - Sheridan, MT',
        destination: 'Destination Address',
        carrier: 'OGFCARGO Cold Chain Logistics',
        estimatedDelivery: '3-5 Business Days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Temperature-monitored blast frozen shipment.',
        timeline: buildFullTimeline(defaultStatus, new Date().toISOString()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error querying order tracking record.' });
  }
}

function buildFullTimeline(currentStatus: string, createdAt: string) {
  const baseDate = new Date(createdAt);

  const currentIndex = ALL_STAGES.findIndex(
    (s) => s.id.toLowerCase() === currentStatus.toLowerCase()
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return ALL_STAGES.map((stage, idx) => {
    let status: 'completed' | 'current' | 'pending' = 'pending';
    if (idx < activeIdx) {
      status = 'completed';
    } else if (idx === activeIdx) {
      status = 'current';
    } else {
      status = 'pending';
    }

    // Determine estimated milestone date
    const dateOffsetMs = idx * (86400000 * 0.8);
    const dateStr = new Date(baseDate.getTime() + dateOffsetMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      title: stage.title,
      stageId: stage.id,
      date: dateStr,
      status,
      description: stage.desc,
    };
  });
}
