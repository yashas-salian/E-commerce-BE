-- CreateTable
CREATE TABLE "Orders" (
    "ID" SERIAL NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "ID" SERIAL NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Products" (
    "ID" SERIAL NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Payment" (
    "ID" SERIAL NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Notification" (
    "ID" SERIAL NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("ID")
);
