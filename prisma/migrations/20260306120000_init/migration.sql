-- CreateTable
CREATE TABLE "Day" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "phone" TEXT,
    "instagram" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "canUsePhotos" BOOLEAN NOT NULL DEFAULT false,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "referredBy" TEXT,
    "notes" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Day_date_key" ON "Day"("date");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

