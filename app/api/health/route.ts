import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createChildLogger } from '@/lib/logger';
import Redis from 'ioredis';

const logger = createChildLogger('health');

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {} as Record<string, any>,
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = { status: 'up' };
    } catch (error) {
      health.checks.database = { status: 'down', error: String(error) };
      health.status = 'degraded';
    }

    // Check Redis
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
      await redis.ping();
      await redis.disconnect();
      health.checks.redis = { status: 'up' };
    } catch (error) {
      health.checks.redis = { status: 'down', error: String(error) };
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
