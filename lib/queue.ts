/**
 * Job Queue Configuration
 * Note: BullMQ is a Node.js background task library and should only be instantiated
 * in server-side code (API routes, backend workers), NOT in Next.js build time
 */

// This is a placeholder for production setup
// BullMQ should be used in a separate worker process, not bundled with Next.js frontend code

export const enqueueAuditLog = async (data: {
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
}) => {
  // In production, call a background job API
  try {
    await fetch('/api/jobs/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silently fail if job queue not available
    });
  } catch {
    console.warn('Audit logging not available');
  }
};

export const enqueueCleaning = async (bedId: string, assignedTo: string) => {
  try {
    await fetch('/api/jobs/cleaning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedId, assignedTo }),
    }).catch(() => {
      // Silently fail if job queue not available
    });
  } catch {
    console.warn('Cleaning task enqueueing not available');
  }
};

export const closeQueues = async () => {
  // Cleanup when needed
  console.log('Queues closed');
};
