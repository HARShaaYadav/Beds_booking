/**
 * Choose a bed from a list of available beds.
 * Strategy:
 * - Prefer beds matching `preferredType`.
 * - Cluster by ward: pick a ward with the most available beds to reduce fragmentation.
 * - Prefer ICU when requested.
 */
export function chooseBedFromList(beds: Array<any>, preferredType?: string, overflowWards: string[] = []) {
  if (!beds || beds.length === 0) return null;

  // If preferredType present, prefer those
  let candidates = beds.slice();
  if (preferredType) {
    const preferred = candidates.filter(b => b.bedType === preferredType);
    if (preferred.length) candidates = preferred;
  }

  // If ICU is preferred and available, pick ICU
  if (preferredType === 'ICU') {
    const icu = candidates.filter(b => b.bedType === 'ICU');
    if (icu.length) {
      // cluster by ward
      const ward = chooseWardWithMostBeds(icu);
      return icu.find(b => b.ward === ward) ?? icu[0];
    }
  }

  // Cluster by ward for remaining candidates
  const ward = chooseWardWithMostBeds(candidates);
  if (ward) {
    const byWard = candidates.filter(b => b.ward === ward);
    if (byWard.length) return byWard[0];
  }

  // fallback: prefer overflow wards if any
  if (overflowWards && overflowWards.length) {
    const overflow = candidates.filter(b => overflowWards.includes(b.ward));
    if (overflow.length) return overflow[0];
  }

  // last resort: return first candidate
  return candidates[0] ?? null;
}

function chooseWardWithMostBeds(beds: Array<any>) {
  const counts: Record<string, number> = {};
  for (const b of beds) counts[b.ward] = (counts[b.ward] || 0) + 1;
  let bestWard = '';
  let bestCount = 0;
  for (const w of Object.keys(counts)) {
    if (counts[w] > bestCount) {
      bestCount = counts[w];
      bestWard = w;
    }
  }
  return bestWard || null;
}
