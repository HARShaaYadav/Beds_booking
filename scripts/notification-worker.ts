import { notificationService } from '../services/notificationService';

const pollIntervalMs = Number(process.env.NOTIFICATION_WORKER_POLL_MS ?? 15_000);

async function work() {
  try {
    const result = await notificationService.processDueJobs();
    if (result.processed) console.log('Notification worker:', result);
  } catch (error) {
    console.error('Notification worker error:', error);
  }
}

void work();
setInterval(() => void work(), pollIntervalMs);
