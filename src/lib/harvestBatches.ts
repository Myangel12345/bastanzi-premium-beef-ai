export interface HarvestBatch {
  id: string;
  name: string;
  active: boolean;
  estimatedDelivery?: string;
}

const STORAGE_KEY = 'bastanzi_harvest_batches';

export const DEFAULT_HARVEST_BATCHES: HarvestBatch[] = [
  {
    id: 'batch-1',
    name: 'Late Fall 2026 Harvest (October–November)',
    active: true,
    estimatedDelivery: 'October–November 2026',
  },
  {
    id: 'batch-2',
    name: 'Winter 2026 Harvest (December–January)',
    active: true,
    estimatedDelivery: 'December 2026–January 2027',
  },
  {
    id: 'batch-3',
    name: 'Spring 2027 Harvest (March–April)',
    active: true,
    estimatedDelivery: 'March–April 2027',
  },
];

export function getHarvestBatches(): HarvestBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load harvest batches from localStorage:', e);
  }
  return DEFAULT_HARVEST_BATCHES;
}

export function getActiveHarvestBatches(): HarvestBatch[] {
  const batches = getHarvestBatches();
  return batches.filter((b) => b.active);
}

export function saveHarvestBatches(batches: HarvestBatch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch (e) {
    console.error('Failed to save harvest batches:', e);
  }
}
