import { describe, it, expect } from 'vitest';
import {
  setDisasterModeSync,
  isDisasterModeSync,
  activateOverflowWardSync,
  deactivateOverflowWardSync,
  getOverflowWardsSync,
} from '@/lib/disaster';

describe('disaster sync state', () => {
  it('toggles disaster mode', () => {
    setDisasterModeSync(true);
    expect(isDisasterModeSync()).toBe(true);
    setDisasterModeSync(false);
    expect(isDisasterModeSync()).toBe(false);
  });

  it('manages overflow wards in-memory', () => {
    activateOverflowWardSync('Overflow A');
    expect(getOverflowWardsSync()).toContain('Overflow A');
    deactivateOverflowWardSync('Overflow A');
    expect(getOverflowWardsSync()).not.toContain('Overflow A');
  });
});
