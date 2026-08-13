import { prisma } from '@/lib/prisma';
import { BedStatus, AdmissionStatus, Prisma } from '@prisma/client';
import { createChildLogger } from '@/lib/logger';
import { enqueueAuditLog, enqueueCleaning } from '@/lib/queue';
import { emitBedStatusChange } from '@/lib/socket';
import { notificationService } from '@/services/notificationService';

const logger = createChildLogger('admission-service');

export class AdmissionService {
  /**
   * Admit a patient - transition from booking to occupied bed
   * Requires:
   * - Valid confirmed booking
   * - Permission (DOCTOR or NURSE)
   * - Booking not already admitted
   */
  async admitPatient(
    bookingId: string,
    admittedById: string,
    notes?: string
  ): Promise<{ success: boolean; admissionId?: string; message?: string }> {
    try {
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Get booking with details
          const booking = await tx.booking.findUnique({
            where: { id: bookingId },
            include: { bed: true, patient: true },
          });

          if (!booking) {
            logger.warn({ bookingId }, 'Booking not found');
            return { success: false, message: 'Booking not found' };
          }

          // Verify booking status
          if (booking.status !== 'CONFIRMED') {
            logger.warn({ bookingId, status: booking.status }, 'Booking not confirmed');
            return { success: false, message: 'Booking must be confirmed' };
          }

          // Check if already admitted
          const existing = await tx.admission.findUnique({
            where: { bookingId },
          });

          if (existing) {
            logger.warn({ bookingId }, 'Patient already admitted');
            return { success: false, message: 'Patient already admitted' };
          }

          // Create admission record
          const admission = await tx.admission.create({
            data: {
              bookingId,
              bedId: booking.bedId,
              patientId: booking.patientId || '',
              admittedById,
              notes,
              status: AdmissionStatus.ADMITTED,
            },
          });

          // Update bed status to OCCUPIED
          await tx.bed.update({
            where: { id: booking.bedId },
            data: {
              status: BedStatus.OCCUPIED,
            },
          });

          // Create history record
          await tx.bedStatusHistory.create({
            data: {
              bedId: booking.bedId,
              oldStatus: BedStatus.BOOKED,
              newStatus: BedStatus.OCCUPIED,
              changedById: admittedById,
            },
          });

          // Update booking admission date
          await tx.booking.update({
            where: { id: bookingId },
            data: {
              admissionAt: new Date(),
              status: 'CONFIRMED',
            },
          });

          logger.info({ admissionId: admission.id, bookingId }, 'Patient admitted');

          return { success: true, admissionId: admission.id };
        },
        {
          isolationLevel: 'Serializable',
        }
      );

      if (result.success) {
        // Enqueue audit log
        enqueueAuditLog({
          userId: admittedById,
          action: 'PATIENT_ADMITTED',
          resource: 'Admission',
          resourceId: result.admissionId!,
          metadata: { bookingId, notes },
        });

        // Emit real-time update
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });

        if (booking) {
          emitBedStatusChange({
            bedId: booking.bedId,
            status: BedStatus.OCCUPIED,
            lockedById: null,
            lockedUntil: null,
          });
        }
      }

      return result;
    } catch (error) {
      logger.error({ error, bookingId }, 'Error admitting patient');
      return { success: false, message: 'Failed to admit patient' };
    }
  }

  /**
   * Discharge a patient - clean bed and mark as available
   * Requires:
   * - Valid admission record
   * - Permission (DOCTOR or NURSE)
   * - Bed is currently occupied
   */
  async dischargePatient(
    admissionId: string,
    dischargedById: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Get admission record
          const admission = await tx.admission.findUnique({
            where: { id: admissionId },
            include: { bed: true, booking: true },
          });

          if (!admission) {
            logger.warn({ admissionId }, 'Admission not found');
            return { success: false, message: 'Admission not found' };
          }

          if (admission.status === AdmissionStatus.DISCHARGED) {
            logger.warn({ admissionId }, 'Patient already discharged');
            return { success: false, message: 'Patient already discharged' };
          }

          // Update admission
          await tx.admission.update({
            where: { id: admissionId },
            data: {
              status: AdmissionStatus.DISCHARGED,
              dischargedAt: new Date(),
            },
          });

          // Update bed status to CLEANING (will be available after cleaning)
          await tx.bed.update({
            where: { id: admission.bedId },
            data: {
              status: BedStatus.CLEANING,
              patientId: null,
            },
          });

          // Create history record
          await tx.bedStatusHistory.create({
            data: {
              bedId: admission.bedId,
              oldStatus: BedStatus.OCCUPIED,
              newStatus: BedStatus.CLEANING,
              changedById: dischargedById,
            },
          });

          // Update booking
          await tx.booking.update({
            where: { id: admission.bookingId },
            data: {
              dischargeAt: new Date(),
              status: 'COMPLETED',
            },
          });

          logger.info({ admissionId, bedId: admission.bedId }, 'Patient discharged');

          return { success: true };
        },
        {
          isolationLevel: 'Serializable',
        }
      );

      if (result.success) {
        // Enqueue audit log
        enqueueAuditLog({
          userId: dischargedById,
          action: 'PATIENT_DISCHARGED',
          resource: 'Admission',
          resourceId: admissionId,
        });

        // Enqueue cleaning task (assign to available nurse)
        const cleaningNurses = await prisma.user.findMany({
          where: { role: 'NURSE' },
          take: 1,
        });

        if (cleaningNurses.length > 0) {
          const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
          });

          if (admission) {
            enqueueCleaning(admission.bedId, cleaningNurses[0].id);
          }
        }

        // Emit real-time update
        const admission = await prisma.admission.findUnique({
          where: { id: admissionId },
        });

        if (admission) {
          emitBedStatusChange({
            bedId: admission.bedId,
            status: BedStatus.CLEANING,
            lockedById: null,
            lockedUntil: null,
          });
        }
        await notificationService.notifyDischargeCompleted(admissionId);
      }

      return result;
    } catch (error) {
      logger.error({ error, admissionId }, 'Error discharging patient');
      return { success: false, message: 'Failed to discharge patient' };
    }
  }

  /**
   * Complete cleaning task and mark bed as available
   */
  async completeCleaning(
    taskId: string,
    completedById: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Get cleaning task
          const task = await tx.cleaningTask.findUnique({
            where: { id: taskId },
            include: { bed: true },
          });

          if (!task) {
            logger.warn({ taskId }, 'Cleaning task not found');
            return { success: false, message: 'Cleaning task not found' };
          }

          // Update task
          await tx.cleaningTask.update({
            where: { id: taskId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          });

          // Update bed status to AVAILABLE
          await tx.bed.update({
            where: { id: task.bedId },
            data: {
              status: BedStatus.AVAILABLE,
            },
          });

          // Create history record
          await tx.bedStatusHistory.create({
            data: {
              bedId: task.bedId,
              oldStatus: BedStatus.CLEANING,
              newStatus: BedStatus.AVAILABLE,
              changedById: completedById,
            },
          });

          logger.info({ taskId, bedId: task.bedId }, 'Cleaning completed');

          return { success: true };
        },
        {
          isolationLevel: 'Serializable',
        }
      );

      if (result.success) {
        enqueueAuditLog({
          userId: completedById,
          action: 'CLEANING_COMPLETED',
          resource: 'CleaningTask',
          resourceId: taskId,
        });

        // Emit real-time update
        const task = await prisma.cleaningTask.findUnique({
          where: { id: taskId },
        });

        if (task) {
          emitBedStatusChange({
            bedId: task.bedId,
            status: BedStatus.AVAILABLE,
            lockedById: null,
            lockedUntil: null,
          });
        }
      }

      return result;
    } catch (error) {
      logger.error({ error, taskId }, 'Error completing cleaning');
      return { success: false, message: 'Failed to complete cleaning' };
    }
  }

  /**
   * Get admission history for a patient
   */
  async getPatientAdmissions(patientId: string) {
    return prisma.admission.findMany({
      where: { patientId },
      include: {
        bed: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            bookedAt: true,
          },
        },
      },
      orderBy: { admittedAt: 'desc' },
    });
  }

  /**
   * Get current occupancy metrics
   */
  async getOccupancyMetrics() {
    const [total, occupied, cleaning, available] = await Promise.all([
      prisma.bed.count(),
      prisma.bed.count({ where: { status: BedStatus.OCCUPIED } }),
      prisma.bed.count({ where: { status: BedStatus.CLEANING } }),
      prisma.bed.count({ where: { status: BedStatus.AVAILABLE } }),
    ]);

    const currentAdmissions = await prisma.admission.count({
      where: { status: AdmissionStatus.ADMITTED },
    });

    return {
      total,
      occupied,
      cleaning,
      available,
      currentAdmissions,
      occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) : '0',
    };
  }
}

export const admissionService = new AdmissionService();
