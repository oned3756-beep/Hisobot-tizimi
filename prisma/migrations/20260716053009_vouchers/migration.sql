-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CASHIER';

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('UNUSED', 'USED');

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "cashAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cardAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "transferAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "qrAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'UNUSED',
    "soldById" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_objectId_idx" ON "Voucher"("objectId");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "Voucher"("status");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "BusinessObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_soldById_fkey" FOREIGN KEY ("soldById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
