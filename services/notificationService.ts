import { NotificationChannel, NotificationEventType, NotificationJobStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type EventInput = {
  eventType: NotificationEventType;
  userId: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  scheduledAt?: Date;
  payload?: Prisma.InputJsonValue;
};

export class NotificationService {
  async notifyBedLocked(userId: string, bedNumber: string, expiresAt: Date): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) return;
    await this.enqueueEvent({
      eventType: NotificationEventType.BED_LOCKED, userId, email: user.email,
      subject: 'Bed temporarily reserved', message: `Bed ${bedNumber} is locked for you until ${expiresAt.toLocaleTimeString()}.`,
      payload: { bedNumber, expiresAt: expiresAt.toISOString() },
    });
    await this.enqueueEvent({
      eventType: NotificationEventType.LOCK_EXPIRING, userId, email: user.email,
      subject: 'Bed lock expires in 1 minute', message: `Your lock for bed ${bedNumber} expires in 1 minute. Complete the booking now.`,
      scheduledAt: new Date(expiresAt.getTime() - 60_000), payload: { bedNumber, expiresAt: expiresAt.toISOString() },
    });
  }

  async notifyBookingConfirmed(bookingId: string): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }, include: { bed: true, patient: true, bookedBy: true },
    });
    if (!booking) return;
    const details = { bookingId, bedNumber: booking.bed.bedNumber, patientId: booking.patientId };
    await this.enqueueEvent({
      eventType: NotificationEventType.BOOKING_CONFIRMED, userId: booking.bookedById, email: booking.bookedBy.email, phone: booking.patient?.phone,
      subject: 'Booking confirmed', message: `Booking confirmed: bed ${booking.bed.bedNumber} is now occupied.`, payload: details,
    });
    await this.enqueueEvent({
      eventType: NotificationEventType.BED_ASSIGNED, userId: booking.bookedById, email: booking.bookedBy.email, phone: booking.patient?.phone,
      subject: 'Bed assigned', message: `Bed ${booking.bed.bedNumber} has been assigned to ${booking.patient?.name ?? 'the patient'}.`, payload: details,
    });
  }

  async notifyDischargeCompleted(admissionId: string): Promise<void> {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId }, include: { bed: true, patient: true, booking: { include: { bookedBy: true } } },
    });
    if (!admission) return;
    await this.enqueueEvent({
      eventType: NotificationEventType.DISCHARGE_COMPLETED, userId: admission.booking.bookedById,
      email: admission.booking.bookedBy.email, phone: admission.patient.phone,
      subject: 'Discharge completed', message: `Discharge for ${admission.patient.name} from bed ${admission.bed.bedNumber} is complete. The bed is being cleaned.`,
      payload: { admissionId, bedNumber: admission.bed.bedNumber },
    });
  }

  async enqueueEvent(input: EventInput): Promise<void> {
    const channels: Array<{ channel: NotificationChannel; recipient: string }> = [
      { channel: NotificationChannel.EMAIL, recipient: input.email },
    ];
    if (input.phone) {
      channels.push(
        { channel: NotificationChannel.SMS, recipient: input.phone },
        { channel: NotificationChannel.WHATSAPP, recipient: input.phone },
      );
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: input.userId },
      select: { endpoint: true },
    });
    channels.push(...subscriptions.map(({ endpoint }) => ({ channel: NotificationChannel.PUSH, recipient: endpoint })));

    await prisma.notificationJob.createMany({
      data: channels.map(({ channel, recipient }) => ({
        userId: input.userId,
        channel,
        eventType: input.eventType,
        recipient,
        subject: input.subject,
        message: input.message,
        payload: input.payload,
        scheduledAt: input.scheduledAt ?? new Date(),
      })),
    });
  }

  async processDueJobs(limit = 25): Promise<{ processed: number; sent: number; failed: number }> {
    const jobs = await prisma.notificationJob.findMany({
      where: { status: NotificationJobStatus.PENDING, scheduledAt: { lte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      const claimed = await prisma.notificationJob.updateMany({
        where: { id: job.id, status: NotificationJobStatus.PENDING },
        data: { status: NotificationJobStatus.PROCESSING, attempts: { increment: 1 } },
      });
      if (!claimed.count) continue;

      try {
        await this.deliver(job);
        await prisma.notificationJob.update({
          where: { id: job.id }, data: { status: NotificationJobStatus.SENT, processedAt: new Date(), lastError: null },
        });
        sent++;
      } catch (error) {
        const attempts = job.attempts + 1;
        const retry = attempts < 3;
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: retry ? NotificationJobStatus.PENDING : NotificationJobStatus.FAILED,
            scheduledAt: retry ? new Date(Date.now() + attempts * 60_000) : job.scheduledAt,
            lastError: error instanceof Error ? error.message : 'Unknown delivery error',
          },
        });
        failed++;
      }
    }
    return { processed: jobs.length, sent, failed };
  }

  private async deliver(job: { channel: NotificationChannel; recipient: string; subject: string | null; message: string; payload: Prisma.JsonValue | null }) {
    if (job.channel === NotificationChannel.SMS || job.channel === NotificationChannel.WHATSAPP) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = job.channel === NotificationChannel.SMS ? process.env.TWILIO_SMS_FROM : process.env.TWILIO_WHATSAPP_FROM;
      if (!accountSid || !authToken || !from) throw new Error(`Twilio ${job.channel} is not configured`);
      const to = job.channel === NotificationChannel.WHATSAPP ? `whatsapp:${job.recipient}` : job.recipient;
      const body = new URLSearchParams({ From: job.channel === NotificationChannel.WHATSAPP ? `whatsapp:${from}` : from, To: to, Body: job.message });
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body,
      });
      if (!response.ok) throw new Error(`Twilio delivery failed: ${response.status}`);
      return;
    }
    if (job.channel === NotificationChannel.EMAIL) {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email provider is not configured');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [job.recipient], subject: job.subject ?? 'MediBook update', text: job.message }),
      });
      if (!response.ok) throw new Error(`Email delivery failed: ${response.status}`);
      return;
    }
    // Browser push is delivered through your configured push gateway. Payload includes the subscription endpoint.
    if (!process.env.PUSH_GATEWAY_URL) throw new Error('Push gateway is not configured');
    const response = await fetch(process.env.PUSH_GATEWAY_URL, {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.PUSH_GATEWAY_TOKEN ?? ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: job.recipient, notification: { title: job.subject, body: job.message }, payload: job.payload }),
    });
    if (!response.ok) throw new Error(`Push delivery failed: ${response.status}`);
  }
}

export const notificationService = new NotificationService();
