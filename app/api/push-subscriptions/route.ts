import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const validation = subscriptionSchema.safeParse(await request.json());
    if (!validation.success) return NextResponse.json({ success: false, message: 'Invalid push subscription.' }, { status: 400 });
    const { endpoint, keys } = validation.data;
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Please sign in to enable push notifications.' }, { status: 401 });
  }
}
