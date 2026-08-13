const { createServer } = require('http');
const { Server } = require('socket.io');

let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Warning: Prisma not available for lock expiration');
  prisma = null;
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  // Send connection confirmation
  socket.emit('connected', { message: 'Connected to Socket.IO server', timestamp: new Date() });
});

// Function to release expired locks (if Prisma available)
async function releaseExpiredLocks() {
  if (!prisma) return;

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
      try {
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

        console.log(`🔓 Released expired lock for bed: ${bed.bedNumber}`);

        // Emit event to all connected clients
        io.emit('bed-status-changed', {
          bedId: bed.id,
          status: 'AVAILABLE',
          lockedById: null,
          lockedUntil: null,
        });
      } catch (err) {
        console.error(`Error processing bed ${bed.id}:`, err.message);
      }
    }

    if (expiredBeds.length > 0) {
      console.log(`📊 Released ${expiredBeds.length} expired locks`);
    }
  } catch (error) {
    console.error('Error checking expired locks:', error.message);
  }
}

// Check for expired locks every 30 seconds
setInterval(releaseExpiredLocks, 30000);

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Socket.IO server running on http://localhost:${PORT}`);
  console.log('✅ Ready to accept real-time updates');
  console.log('🔄 Automatic lock expiration enabled (checks every 30 seconds)\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('🛑 Server closed');
    if (prisma) prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, closing server...');
  httpServer.close(() => {
    console.log('🛑 Server closed');
    if (prisma) prisma.$disconnect();
    process.exit(0);
  });
});
