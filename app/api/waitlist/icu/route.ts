import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { icuWaitlistService } from '@/services/icuWaitlistService';

const addToWaitlistSchema = z.object({
  patientId: z.string().uuid('A valid patient is required.'),
  clinicalUrgency: z.number().int().min(1).max(5),
  requiresVentilator: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  try {
    await getCurrentUser();
    return NextResponse.json({ success: true, entries: await icuWaitlistService.getActiveEntries() });
  } catch {
    return NextResponse.json({ success: false, message: 'Please sign in to view the ICU waitlist.' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const validation = addToWaitlistSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const result = await icuWaitlistService.add({ ...validation.data, requestedById: user.id });
    return NextResponse.json(result, { status: result.success ? 201 : 409 });
  } catch (error) {
    console.error('Error adding ICU waitlist entry:', error);
    return NextResponse.json({ success: false, message: 'Unable to add ICU waitlist entry.' }, { status: 500 });
  }
}
