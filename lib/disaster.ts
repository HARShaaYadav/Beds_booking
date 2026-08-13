import { prisma } from '@/lib/prisma';

// In-memory fallback (used when DB not available or during tests)
let _disasterMode = false;
let _overflowWards: string[] = [];

async function ensureTables() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS disaster_state (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        active boolean NOT NULL,
        buffer_reserved int DEFAULT 3,
        updated_by varchar(255),
        updated_at timestamptz DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS overflow_wards (
        name varchar(255) PRIMARY KEY,
        active boolean NOT NULL DEFAULT true,
        capacity int DEFAULT 0,
        created_by varchar(255),
        created_at timestamptz DEFAULT now()
      );
    `);
  } catch (err) {
    // If we cannot create tables (e.g., during tests), silently fallback to in-memory
    // console.warn('Could not ensure disaster tables', err);
  }
}

export async function isDisasterMode() {
  try {
    await ensureTables();
    const rows: Array<{ active: boolean }> = await prisma.$queryRawUnsafe(`SELECT active FROM disaster_state ORDER BY updated_at DESC LIMIT 1;`);
    if (rows && rows.length) return !!rows[0].active;
  } catch (err) {
    // fallback
  }
  return _disasterMode;
}

export async function setDisasterMode(enabled: boolean, updatedBy?: string) {
  try {
    await ensureTables();
    await prisma.$executeRawUnsafe(`INSERT INTO disaster_state(active, buffer_reserved, updated_by) VALUES($1, $2, $3);`, enabled, 3, updatedBy ?? null);
    return;
  } catch (err) {
    _disasterMode = enabled;
  }
}

export async function activateOverflowWard(ward: string, createdBy?: string) {
  try {
    await ensureTables();
    await prisma.$executeRawUnsafe(`INSERT INTO overflow_wards(name, active, created_by) VALUES($1, true, $2) ON CONFLICT (name) DO UPDATE SET active = true;`, ward, createdBy ?? null);
    return;
  } catch (err) {
    if (!_overflowWards.includes(ward)) _overflowWards.push(ward);
  }
}

export async function deactivateOverflowWard(ward: string) {
  try {
    await ensureTables();
    await prisma.$executeRawUnsafe(`UPDATE overflow_wards SET active = false WHERE name = $1;`, ward);
    return;
  } catch (err) {
    _overflowWards = _overflowWards.filter((w) => w !== ward);
  }
}

export async function getOverflowWards() {
  try {
    await ensureTables();
    const rows: Array<{ name: string }> = await prisma.$queryRawUnsafe(`SELECT name FROM overflow_wards WHERE active = true;`);
    return rows.map((r) => r.name);
  } catch (err) {
    return _overflowWards.slice();
  }
}

export async function getReservedBuffer(): Promise<number> {
  try {
    await ensureTables();
    const rows: Array<{ buffer_reserved: number }> = await prisma.$queryRawUnsafe(`SELECT buffer_reserved FROM disaster_state ORDER BY updated_at DESC LIMIT 1;`);
    if (rows && rows.length) return Number(rows[0].buffer_reserved) || 3;
  } catch (err) {
    // fallback
  }
  return 3;
}

// For backward compatibility, expose sync functions that operate on in-memory state
export function isDisasterModeSync() {
  return _disasterMode;
}

export function setDisasterModeSync(enabled: boolean) {
  _disasterMode = enabled;
}

export function activateOverflowWardSync(ward: string) {
  if (!_overflowWards.includes(ward)) _overflowWards.push(ward);
}

export function deactivateOverflowWardSync(ward: string) {
  _overflowWards = _overflowWards.filter((w) => w !== ward);
}

export function getOverflowWardsSync() {
  return _overflowWards.slice();
}

