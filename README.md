# 🏥 Hospital Bed Booking System

A web-based hospital bed booking system that allows patients to check bed availability and book beds online. Hospital staff and administrators can manage hospitals, rooms, beds, and bookings.

## 🚀 Features

* View available hospital beds
* Search hospitals and rooms
* Book and cancel beds
* Real-time bed availability
* Admin dashboard
* Manage hospitals, rooms, beds, and bookings
* Prevent double booking

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** Node.js, TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma

## ⚙️ Installation

```bash
git clone <repository-url>
cd hospital-bed-booking
npm install
npm run dev
```

Create a `.env` file and add:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```


