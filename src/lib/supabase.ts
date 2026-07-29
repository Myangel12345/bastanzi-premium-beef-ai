import { createClient } from '@supabase/supabase-js';
import { ReservationPayload } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function saveReservationToDatabase(reservation: ReservationPayload) {
  const timestamp = new Date().toISOString();
  const id = 'RES-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  // If Supabase is configured, store in Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            id,
            name: reservation.name,
            email: reservation.email,
            phone: reservation.phone,
            address: reservation.address,
            city: reservation.city,
            state: reservation.state,
            zip: reservation.zip,
            share_size: reservation.shareSize,
            finish_preference: reservation.finish,
            preferred_delivery_date: reservation.preferredDeliveryDate,
            notes: reservation.notes,
            created_at: timestamp,
            status: 'Pending',
          },
        ])
        .select();

      if (error) {
        console.warn('Supabase insertion error (falling back to local store):', error.message);
      } else if (data) {
        return { success: true, id, data: data[0] };
      }
    } catch (err) {
      console.error('Supabase client exception:', err);
    }
  }

  // Fallback local storage / memory store
  try {
    const existing = JSON.parse(localStorage.getItem('bastanzi_reservations') || '[]');
    const record = { id, ...reservation, createdAt: timestamp, status: 'Pending' };
    existing.unshift(record);
    localStorage.setItem('bastanzi_reservations', JSON.stringify(existing));
    return { success: true, id, data: record };
  } catch {
    return { success: true, id, data: { id, ...reservation, createdAt: timestamp } };
  }
}
