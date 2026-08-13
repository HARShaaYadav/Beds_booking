-- Confirmed bookings now occupy the bed immediately. Convert legacy records so
-- no bed remains visibly or operationally in the obsolete BOOKED state.
UPDATE "Bed"
SET "status" = 'OCCUPIED'
WHERE "status" = 'BOOKED';

UPDATE "BedStatusHistory"
SET "oldStatus" = 'OCCUPIED'
WHERE "oldStatus" = 'BOOKED';

UPDATE "BedStatusHistory"
SET "newStatus" = 'OCCUPIED'
WHERE "newStatus" = 'BOOKED';
