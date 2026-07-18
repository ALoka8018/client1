-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_razorpayOrderId_key" ON "Invoice"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_razorpayPaymentId_key" ON "Invoice"("razorpayPaymentId");
