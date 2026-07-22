-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "pincode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_pincode_key" ON "ServiceArea"("pincode");

-- CreateIndex
CREATE INDEX "ServiceArea_pincode_idx" ON "ServiceArea"("pincode");
