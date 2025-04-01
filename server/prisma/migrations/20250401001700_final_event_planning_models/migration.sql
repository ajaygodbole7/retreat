/*
  Warnings:

  - You are about to drop the column `estimated_quantity` on the `EventDayConsumable` table. All the data in the column will be lost.
  - Added the required column `base_serving_quantity` to the `EventDayConsumable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventDay" ADD COLUMN     "attendee_headcount_for_day" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "volunteer_headcount_for_day" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EventDayConsumable" DROP COLUMN "estimated_quantity",
ADD COLUMN     "base_serving_quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "base_serving_size" INTEGER NOT NULL DEFAULT 8;
