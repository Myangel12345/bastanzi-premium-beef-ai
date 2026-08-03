import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../lib/auth.js';

// In-memory store for fallback when Supabase is not configured or during local sessions
let memoryShipments: any[] = [
  {
    id: 'RES-882194A',
    trackingNumber: 'OGF-882194A',
    name: 'Harrison Vance',
    email: 'harrison.vance@example.com',
    phone: '415-555-0192',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zip: '97477',
    shareSize: 'Quarter',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'In Transit',
    origin: 'Bastanzi Ranch - Sheridan, MT',
    destination: 'Springfield, OR',
    carrier: 'OGFCARGO Cold Chain Logistics',
    estimatedDelivery: '2026-08-05',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    updated_by: 'admin@ogfcargo.com',
    notes: 'Keep chilled below 0°F in vacuum packaging.',
  },
  {
    id: 'RES-993021B',
    trackingNumber: 'OGF-993021B',
    name: 'Evelyn Sterling',
    email: 'evelyn@sterlingwealth.com',
    phone: '310-555-0144',
    address: '1000 Wilshire Blvd Suite 400',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90017',
    shareSize: 'Full',
    finish: '100% Grass-Fed & Finished',
    status: 'Processing',
    origin: 'Bastanzi Processing Facility',
    destination: 'Los Angeles, CA',
    carrier: 'OGFCARGO Priority Express',
    estimatedDelivery: '2026-08-08',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_by: 'system',
    notes: 'VIP customer. Include custom butcher cut sheet.',
  },
  {
    id: 'RES-441203C',
    trackingNumber: 'OGF-441203C',
    name: 'Marcus Brody',
    email: 'mbrody@brodyarch.com',
    phone: '212-555-0188',
    address: '450 Lexington Ave Fl 12',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    shareSize: 'Half',
    finish: 'Pasture-Raised Grain-Finished',
    status: 'Delivered',
    origin: 'Bastanzi Ranch - Sheridan, MT',
    destination: 'New York, NY',
    carrier: 'OGFCARGO Cold Chain Logistics',
    estimatedDelivery: '2026-08-01',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_by: 'admin@ogfcargo.com',
    notes: 'Delivered and signed by concierge desk.',
  },
];

function getSupabase() {
  try {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
    if (url && key && url.startsWith('http')) {
      return createClient(url, key);
    }
  } catch (err) {
    console.warn('Supabase initialization skipped:', err);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Strictly enforce authentication for every admin endpoint
  const authHeader = req.headers.authorization;
  const session = verifyAdminToken(authHeader as string);

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication token required',
      message: 'Access denied. Please log in with valid admin credentials.',
    });
  }

  const supabase = getSupabase();

  // GET: Retrieve all shipments / reservations
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Normalize Supabase fields to shipment interface
          const mapped = data.map((item: any) => ({
            id: item.id,
            trackingNumber: item.tracking_number || `OGF-${item.id.replace('RES-', '')}`,
            name: item.name,
            email: item.email,
            phone: item.phone,
            address: item.address,
            city: item.city,
            state: item.state,
            zip: item.zip,
            shareSize: item.share_size || item.shareSize || 'Quarter',
            finish: item.finish_preference || item.finish || 'Pasture-Raised Grain-Finished',
            status: item.status || 'Pending',
            origin: item.origin || 'Bastanzi Ranch - Sheridan, MT',
            destination: `${item.city || ''}, ${item.state || ''}`.trim() || 'Customer Address',
            carrier: item.carrier || 'OGFCARGO Cold Chain Express',
            estimatedDelivery: item.preferred_delivery_date || item.estimated_delivery || 'To Be Confirmed',
            createdAt: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || item.created_at || new Date().toISOString(),
            updated_by: item.updated_by || 'admin@ogfcargo.com',
            notes: item.notes || '',
          }));
          return res.status(200).json({ success: true, shipments: mapped, source: 'supabase' });
        }
      } catch (e) {
        console.warn('Supabase fetch failed, returning in-memory store:', e);
      }
    }
    return res.status(200).json({ success: true, shipments: memoryShipments, source: 'memory' });
  }

  // POST: Create a new shipment / reservation as admin
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const now = new Date().toISOString();
      const newId = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const newRecord = {
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
        status: body.status || 'Pending',
        origin: body.origin || 'Bastanzi Ranch - Sheridan, MT',
        destination: body.destination || `${body.city || ''}, ${body.state || ''}`.trim() || 'Destination',
        carrier: body.carrier || 'OGFCARGO Cold Chain Logistics',
        estimatedDelivery: body.estimatedDelivery || 'To Be Scheduled',
        createdAt: now,
        updated_at: now,
        updated_by: session.email,
        notes: body.notes || '',
      };

      if (supabase) {
        try {
          await supabase.from('reservations').insert([
            {
              id: newRecord.id,
              name: newRecord.name,
              email: newRecord.email,
              phone: newRecord.phone,
              address: newRecord.address,
              city: newRecord.city,
              state: newRecord.state,
              zip: newRecord.zip,
              share_size: newRecord.shareSize,
              finish_preference: newRecord.finish,
              status: newRecord.status,
              created_at: now,
              updated_at: now,
              updated_by: session.email,
              notes: newRecord.notes,
            },
          ]);
        } catch (e) {
          console.warn('Supabase insert error in admin endpoint:', e);
        }
      }

      memoryShipments.unshift(newRecord);
      return res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        shipment: newRecord,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'Invalid payload or server error' });
    }
  }

  // PUT: Update shipment details or status (Audit trail required!)
  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status, notes, destination, carrier, estimatedDelivery, shareSize, finish, name, email, phone } = body;

      if (!id) {
        return res.status(400).json({ error: 'Shipment/Reservation ID is required for update' });
      }

      const now = new Date().toISOString();
      let updatedRecord: any = null;

      // Update in memory
      const index = memoryShipments.findIndex((item) => item.id === id);
      if (index !== -1) {
        memoryShipments[index] = {
          ...memoryShipments[index],
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
          updated_at: now, // Requirement 5: Automatically update updated_at timestamp
          updated_by: session.email, // Requirement 5: Record admin identity
        };
        updatedRecord = memoryShipments[index];
      } else {
        // Create entry in memory if not present
        updatedRecord = {
          id,
          name: name || 'Customer',
          email: email || '',
          phone: phone || '',
          status: status || 'Updated',
          updated_at: now,
          updated_by: session.email,
          notes: notes || '',
        };
        memoryShipments.unshift(updatedRecord);
      }

      // Update in Supabase if configured
      if (supabase) {
        try {
          await supabase
            .from('reservations')
            .update({
              ...(status && { status }),
              ...(notes !== undefined && { notes }),
              updated_at: now,
              updated_by: session.email,
            })
            .eq('id', id);
        } catch (e) {
          console.warn('Supabase update failed in admin endpoint:', e);
        }
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

      memoryShipments = memoryShipments.filter((item) => item.id !== id);

      if (supabase) {
        try {
          await supabase.from('reservations').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete error:', e);
        }
      }

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
