const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const httpServer = createServer();
const io = new Server(httpServer, {
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

// Function to release expired locks
async function releaseExpiredLocks() {
  const now = new Date();

  try {
    const expiredBeds = await prisma.bed.findMany({
      where: {
        status: 'LOCKED',
        lockedUntil: {
          lt: now,
        },
      },
    });

    for (const bed of expiredBeds) {
      await prisma.$transaction(async (tx) => {
        await tx.bed.update({
          where: { id: bed.id },
          data: {
            status: 'AVAILABLE',
            lockedById: null,
            lockedUntil: null,
          },
        });

        await tx.booking.updateMany({
          where: {
            bedId: bed.id,
            status: 'LOCKED',
          },
          data: {
            status: 'EXPIRED',
          },
        });

        await tx.bedStatusHistory.create({
          data: {
            bedId: bed.id,
            oldStatus: 'LOCKED',
            newStatus: 'AVAILABLE',
            changedById: bed.lockedById || 'system',
          },
        });
      });

      console.log(`Released expired lock for bed: ${bed.bedNumber}`);

      // Emit event to all connected clients
      io.emit('bed-status-changed', {
        bedId: bed.id,
        status: 'AVAILABLE',
        lockedById: null,
        lockedUntil: null,
      });
    }

    if (expiredBeds.length > 0) {
      console.log(`Released ${expiredBeds.length} expired locks`);
    }
  } catch (error) {
    console.error('Error releasing expired locks:', error);
  }
}

// Check for expired locks every 30 seconds
setInterval(releaseExpiredLocks, 30000);

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log('Automatic lock expiration enabled (checks every 30 seconds)');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});
