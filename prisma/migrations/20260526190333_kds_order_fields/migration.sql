-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "kitchenNotes" TEXT,
ADD COLUMN     "preparationStartedAt" TIMESTAMP(3),
ADD COLUMN     "priority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readyAt" TIMESTAMP(3),
ADD COLUMN     "servedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_priority_idx" ON "Order"("priority");
