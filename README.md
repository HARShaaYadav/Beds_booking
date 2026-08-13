# Hospital Bed & ICU Booking System

A complete real-time hospital bed and ICU booking system built with Next.js, TypeScript, PostgreSQL, Prisma ORM, and Socket.IO. This system prevents double-booking through atomic database operations and provides real-time updates to all connected users.

## Features

- ✅ **Real-Time Updates**: Instant bed availability updates across all connected users via Socket.IO
- 🔒 **Temporary Bed Locking**: 5-minute reservation window while users complete their booking
- 🚫 **Double-Booking Prevention**: Atomic database operations ensure only one user can book a bed
- ⏰ **Automatic Lock Expiration**: Server-side cleanup automatically releases expired locks
- 🏥 **Multiple Bed Types**: General, ICU, Emergency, Private, and Isolation beds
- 📊 **Real-Time Dashboard**: Live statistics showing bed availability across the hospital
- 👥 **Patient Management**: Search existing patients or create new patient records
- 🔐 **Lock Ownership Verification**: Only the user who locked a bed can confirm or cancel it
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-Time**: Socket.IO
- **Validation**: Zod
- **UI Components**: Custom components with Lucide React icons

## Project Architecture

```
Next.js Frontend
↓
Next.js API Routes
↓
Prisma ORM
↓
PostgreSQL Database

Real-Time Updates:
Backend → Socket.IO → Connected Clients
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed and running
- Git (optional, for cloning)

## Installation

### 1. Install PostgreSQL

#### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember your PostgreSQL password during installation
4. Default port is 5432

#### macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create the Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE hospital_db;
```

Alternatively, using command line:

```bash
# Windows (from Command Prompt or PowerShell)
psql -U postgres -c "CREATE DATABASE hospital_db;"

# macOS/Linux
sudo -u postgres psql -c "CREATE DATABASE hospital_db;"
```

### 3. Clone or Setup Project

```bash
# If you have the project files
cd hospital-booking-system

# Install dependencies
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Edit `.env` and update with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hospital_db"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/hospital_db"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

Replace:
- `USER`: Your PostgreSQL username (default: `postgres`)
- `PASSWORD`: Your PostgreSQL password
- `localhost`: Your database host (use `localhost` for local development)
- `5432`: PostgreSQL port (default: `5432`)
- `hospital_db`: Database name

### 5. Run Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

Or run all setup steps at once:

```bash
npm run setup
```

This will create:
- 1 hospital (City General Hospital)
- 2 users (admin and receptionist)
- 3 sample patients
- 10 General beds
- 5 ICU beds
- 3 Emergency beds
- 2 Private rooms

### 6. Start the Application

You need to run TWO servers:

#### Terminal 1 - Next.js Application:
```bash
npm run dev
```

The Next.js app will run on http://localhost:3000

#### Terminal 2 - Socket.IO Server:
```bash
npm run socket
```

The Socket.IO server will run on http://localhost:3001

## Usage

1. **Open the application**: Navigate to http://localhost:3000
2. **View Dashboard**: Click "View Dashboard" to see real-time bed statistics
3. **Browse Beds**: Click "Browse Beds" to see all available beds
4. **Filter Beds**: Use filters to search by bed type, status, or bed number
5. **Book a Bed**: Click "Book Bed" on an available bed
6. **Complete Booking**: 
   - You have 5 minutes to complete the booking
   - Search for an existing patient or create a new one
   - Click "Confirm Booking" to finalize
7. **Cancel Booking**: Click "Cancel" if you want to release the lock

## Testing Double-Booking Prevention

To test that two users cannot book the same bed:

1. Open the application in **two different browser windows** (or use incognito mode)
2. Both users navigate to the same bed listing page (e.g., /beds/icu)
3. Both users see **ICU-01** as **AVAILABLE**
4. **User A** clicks "Book Bed" on ICU-01
5. **User B** immediately sees ICU-01 change to **LOCKED** (real-time update)
6. If **User B** tries to click "Book Bed", they receive an error: "Bed is no longer available"
7. Only **User A** can complete the booking

### Expected Results:
- ✅ Only one user successfully locks the bed
- ✅ The other user sees the bed become unavailable in real-time
- ✅ API returns 409 Conflict for the second user
- ✅ Database maintains consistency (only one lock record exists)

## Database Schema

### Core Models

- **Hospital**: Hospital information
- **User**: System users (Admin, Receptionist, Doctor, Patient roles)
- **Patient**: Patient records
- **Bed**: Hospital beds with status tracking
- **Booking**: Booking records with lock management
- **BedStatusHistory**: Audit trail of all bed status changes

### Bed Statuses

- `AVAILABLE`: Ready for booking
- `LOCKED`: Temporarily reserved (5-minute window)
- `BOOKED`: Confirmed booking
- `OCCUPIED`: Patient admitted
- `CLEANING`: Bed being cleaned
- `MAINTENANCE`: Under maintenance

## API Endpoints

### Beds
- `GET /api/beds` - Get all beds (with optional filters)
- `GET /api/beds/[bedId]` - Get specific bed details
- `POST /api/beds/[bedId]/lock` - Lock a bed (atomic operation)
- `GET /api/beds/statistics` - Get bed statistics

### Bookings
- `GET /api/bookings/[bookingId]` - Get booking details
- `POST /api/bookings/[bookingId]/confirm` - Confirm a booking
- `POST /api/bookings/[bookingId]/cancel` - Cancel a booking

### Patients
- `GET /api/patients?q=search` - Search patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[patientId]` - Get patient details

## Socket.IO Events

### Client Listens To:
- `bed-status-changed`: Bed status update
- `bed-locked`: Bed has been locked
- `bed-unlocked`: Lock has been released
- `bed-booked`: Bed has been booked

## Key Features Explained

### 1. Atomic Bed Locking

The system uses Prisma's `updateMany` with a `where` clause to atomically lock beds:

```typescript
const updatedBed = await tx.bed.updateMany({
  where: {
    id: bedId,
    status: BedStatus.AVAILABLE, // Only update if AVAILABLE
  },
  data: {
    status: BedStatus.LOCKED,
    lockedById: userId,
    lockedUntil: expiresAt,
  },
});

// If count is 0, the bed was not available
if (updatedBed.count === 0) {
  return { success: false, message: 'Bed is no longer available.' };
}
```

### 2. Automatic Lock Expiration

The Socket.IO server checks for expired locks every 30 seconds and automatically releases them:

```javascript
setInterval(releaseExpiredLocks, 30000);
```

### 3. Lock Ownership Verification

Only the user who owns a lock can confirm or cancel it:

```typescript
if (booking.bookedById !== userId) {
  return { success: false, message: 'You do not own this booking.' };
}
```

## Database Commands

```bash
# View database in browser
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npm run prisma:generate
```

## Development

### Project Structure

```
hospital-booking-system/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── beds/            # Bed management APIs
│   │   ├── bookings/        # Booking APIs
│   │   └── patients/        # Patient APIs
│   ├── beds/                # Bed listing pages
│   ├── booking/             # Booking completion pages
│   ├── dashboard/           # Dashboard page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── beds/               # Bed-related components
│   ├── booking/            # Booking components
│   ├── dashboard/          # Dashboard components
│   └── realtime/           # Real-time connection components
├── lib/                    # Utility libraries
│   ├── prisma.ts          # Prisma client
│   ├── socket.ts          # Socket.IO utilities
│   └── utils.ts           # General utilities
├── prisma/                # Prisma ORM
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── services/              # Business logic services
│   ├── bedService.ts      # Bed management
│   ├── bookingService.ts  # Booking logic
│   ├── lockService.ts     # Lock management
│   └── patientService.ts  # Patient operations
├── types/                 # TypeScript type definitions
│   ├── bed.ts
│   ├── booking.ts
│   └── patient.ts
├── server.js              # Socket.IO server
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check your `DATABASE_URL` in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d hospital_db
   ```

### Migration Errors

**Error**: `Migration failed`

**Solution**:
```bash
# Reset database and rerun migrations
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed
```

### Socket Connection Issues

**Error**: `Socket connection failed`

**Solution**:
1. Ensure Socket.IO server is running: `npm run socket`
2. Check `NEXT_PUBLIC_SOCKET_URL` in `.env`
3. Verify port 3001 is not in use

### Lock Not Releasing

**Issue**: Bed stays locked after 5 minutes

**Solution**:
1. Ensure Socket.IO server is running (it handles automatic expiration)
2. Check server logs for errors
3. Manually release locks:
   ```bash
   npm run prisma:studio
   # Update beds table: set status to AVAILABLE where lockedUntil < now
   ```

## Production Deployment

For production deployment:

1. Set up a production PostgreSQL database
2. Update `DATABASE_URL` with production credentials
3. Enable SSL for PostgreSQL connection:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```
4. Set up proper authentication (the current system uses mock user IDs)
5. Deploy Next.js app to Vercel/AWS/other platform
6. Deploy Socket.IO server separately (same infrastructure or separate)
7. Update `NEXT_PUBLIC_SOCKET_URL` to production Socket.IO URL
8. Enable rate limiting and other security measures
9. Set up monitoring and logging

## Security Considerations

⚠️ **Important for Production:**

1. **Authentication**: Implement proper authentication (NextAuth.js, Auth0, etc.)
2. **Authorization**: Add role-based access control
3. **Input Validation**: All API inputs are validated with Zod
4. **SQL Injection**: Prisma ORM prevents SQL injection
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **HTTPS**: Use HTTPS in production
7. **Environment Variables**: Never commit `.env` file
8. **Database Backups**: Regular automated backups
9. **Audit Logs**: All bed status changes are logged in `BedStatusHistory`

## License

ISC

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the code comments
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check Socket.IO documentation: https://socket.io/docs

## Credits

Built with:
- Next.js - https://nextjs.org
- Prisma - https://www.prisma.io
- Socket.IO - https://socket.io
- Tailwind CSS - https://tailwindcss.com
