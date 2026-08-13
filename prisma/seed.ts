import { PrismaClient, BedType, BedStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create or get hospital
  let hospital = await prisma.hospital.findFirst();
  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: 'City General Hospital',
        address: '123 Healthcare Avenue, Medical District',
        phone: '+1-555-0100',
      },
    });
    console.log('Hospital created:', hospital.name);
  } else {
    console.log('Hospital already exists:', hospital.name);
  }

  // Create users if they don't exist
  const adminPassword = await bcrypt.hash('admin123', 10);
  const receptionistPassword = await bcrypt.hash('reception123', 10);

  let admin = await prisma.user.findUnique({
    where: { email: 'admin@hospital.com' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@hospital.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  let receptionist = await prisma.user.findUnique({
    where: { email: 'receptionist@hospital.com' },
  });

  if (!receptionist) {
    receptionist = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'receptionist@hospital.com',
        passwordHash: receptionistPassword,
        role: 'RECEPTIONIST',
      },
    });
    console.log('Receptionist user created');
  } else {
    console.log('Receptionist user already exists');
  }

  // Create patients if they don't exist
  const existingPatients = await prisma.patient.findMany();
  
  if (existingPatients.length === 0) {
    const patients = await Promise.all([
      prisma.patient.create({
        data: {
          name: 'Rahul Kumar',
          phone: '+1-555-0201',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'Male',
        },
      }),
      prisma.patient.create({
        data: {
          name: 'Priya Sharma',
          phone: '+1-555-0202',
          dateOfBirth: new Date('1990-03-22'),
          gender: 'Female',
        },
      }),
      prisma.patient.create({
        data: {
          name: 'John Doe',
          phone: '+1-555-0203',
          dateOfBirth: new Date('1978-11-30'),
          gender: 'Male',
        },
      }),
    ]);

    console.log('Patients created:', patients.length);
  } else {
    console.log('Patients already exist:', existingPatients.length);
  }

  // Create beds if none exist
  const existingBeds = await prisma.bed.findMany();
  
  if (existingBeds.length === 0) {
    const beds = [];

    // General beds (10)
    for (let i = 1; i <= 10; i++) {
      beds.push({
        hospitalId: hospital.id,
        bedNumber: `GEN-${i.toString().padStart(2, '0')}`,
        bedType: BedType.GENERAL,
        ward: 'General Ward',
        floor: Math.ceil(i / 5),
        status: BedStatus.AVAILABLE,
      });
    }

    // ICU beds (5)
    for (let i = 1; i <= 5; i++) {
      beds.push({
        hospitalId: hospital.id,
        bedNumber: `ICU-${i.toString().padStart(2, '0')}`,
        bedType: BedType.ICU,
        ward: 'Critical Care',
        floor: 2,
        status: BedStatus.AVAILABLE,
      });
    }

    // Emergency beds (3)
    for (let i = 1; i <= 3; i++) {
      beds.push({
        hospitalId: hospital.id,
        bedNumber: `EMG-${i.toString().padStart(2, '0')}`,
        bedType: BedType.EMERGENCY,
        ward: 'Emergency',
        floor: 1,
        status: BedStatus.AVAILABLE,
      });
    }

    // Private rooms (2)
    for (let i = 1; i <= 2; i++) {
      beds.push({
        hospitalId: hospital.id,
        bedNumber: `PVT-${i.toString().padStart(2, '0')}`,
        bedType: BedType.PRIVATE,
        ward: 'Private Wing',
        floor: 3,
        status: BedStatus.AVAILABLE,
      });
    }

    await prisma.bed.createMany({
      data: beds,
    });

    console.log('Beds created:', beds.length);
  } else {
    console.log('Beds already exist:', existingBeds.length);
  }

  // Mark some beds as occupied for demo
  const allBeds = await prisma.bed.findMany();
  const allPatients = await prisma.patient.findMany();
  
  if (allBeds.length > 0 && allPatients.length > 0) {
    // Check if first bed is already occupied
    const firstBed = await prisma.bed.findUnique({
      where: { id: allBeds[0].id },
    });

    if (firstBed?.status === BedStatus.AVAILABLE) {
      await prisma.bed.update({
        where: { id: allBeds[0].id },
        data: {
          status: BedStatus.OCCUPIED,
          patientId: allPatients[0].id,
        },
      });
    }

    if (allBeds.length > 10) {
      await prisma.bed.update({
        where: { id: allBeds[10].id },
        data: {
          status: BedStatus.CLEANING,
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
