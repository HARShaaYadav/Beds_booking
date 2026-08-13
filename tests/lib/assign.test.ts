import { describe, it, expect } from 'vitest';
import { chooseBedFromList } from '@/lib/assign';

describe('chooseBedFromList', () => {
  it('prefers preferred bed type', () => {
    const beds = [
      { id: '1', bedType: 'GENERAL', ward: 'A' },
      { id: '2', bedType: 'ICU', ward: 'B' },
      { id: '3', bedType: 'ICU', ward: 'A' },
    ];
    const chosen = chooseBedFromList(beds, 'ICU');
    expect(['2', '3']).toContain(chosen.id);
  });

  it('clusters by ward with most beds', () => {
    const beds = [
      { id: '1', bedType: 'GENERAL', ward: 'A' },
      { id: '2', bedType: 'GENERAL', ward: 'A' },
      { id: '3', bedType: 'GENERAL', ward: 'B' },
    ];
    const chosen = chooseBedFromList(beds);
    // should choose from ward A since it has most beds
    expect(['1','2']).toContain(chosen.id);
  });

  it('prefers overflow wards when no other clustering available', () => {
    const beds = [
      { id: '1', bedType: 'GENERAL', ward: 'X' },
      { id: '2', bedType: 'GENERAL', ward: 'Y' },
    ];
    const chosen = chooseBedFromList(beds, undefined, ['Y']);
    expect(chosen.ward).toBe('Y');
  });
});
