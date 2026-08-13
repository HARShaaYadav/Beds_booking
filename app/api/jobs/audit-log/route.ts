import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, resource, resourceId, metadata } = body;
    await prisma.auditLog.create({ data: { userId: userId ?? null, action, resource, resourceId, metadata: metadata ? JSON.stringify(metadata) : null } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Audit log enqueue failed', error);
    return NextResponse.json({ success: false, message: 'Failed to save audit log' }, { status: 500 });
  }
}
