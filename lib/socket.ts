import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export type SocketServer = SocketIOServer;

let io: SocketIOServer | null = null;

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function emitBedStatusChange(data: {
  bedId: string;
  status: string;
  lockedById?: string | null;
  lockedUntil?: Date | null;
}) {
  if (io) {
    io.emit('bed-status-changed', data);
  }
}

export function emitBedLocked(data: {
  bedId: string;
  lockedById: string;
  lockedUntil: Date;
}) {
  if (io) {
    io.emit('bed-locked', data);
  }
}

export function emitBedUnlocked(data: {
  bedId: string;
}) {
  if (io) {
    io.emit('bed-unlocked', data);
  }
}

export function emitBedBooked(data: {
  bedId: string;
  patientId: string;
}) {
  if (io) {
    io.emit('bed-booked', data);
  }
}

export function emitIcuBedAvailable(data: {
  bedId: string;
  bedNumber: string;
  entryId: string;
  userId: string;
  notificationId: string;
}) {
  if (io) {
    io.emit('icu-bed-available', data);
  }
}
