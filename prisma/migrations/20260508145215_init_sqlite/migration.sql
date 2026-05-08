-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan" TEXT,
    "l0" TEXT,
    "l1" TEXT,
    "l2" TEXT,
    "l3" TEXT,
    "l4" TEXT,
    "g" INTEGER NOT NULL DEFAULT 0,
    "n" INTEGER NOT NULL DEFAULT 0,
    "s" INTEGER NOT NULL DEFAULT 0,
    "p" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "lat" REAL NOT NULL DEFAULT 0,
    "lng" REAL NOT NULL DEFAULT 0,
    "checkList" TEXT,
    "statusNote" TEXT,
    "prevG" INTEGER NOT NULL DEFAULT 0,
    "prevN" INTEGER NOT NULL DEFAULT 0,
    "prevS" INTEGER NOT NULL DEFAULT 0,
    "prevP" INTEGER NOT NULL DEFAULT 0,
    "prevTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Viewer'
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rank" TEXT,
    "name" TEXT,
    "position_normal" TEXT,
    "position_field" TEXT,
    "id_card" TEXT,
    "mil_id" TEXT,
    "unit" TEXT,
    "affiliation" TEXT,
    "line_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "role" TEXT,
    "action" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Casualty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT,
    "name" TEXT,
    "unit" TEXT,
    "cause" TEXT,
    "status" TEXT,
    "picUrl" TEXT,
    "doctorConfirm" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArmyStructure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan" TEXT,
    "level0" TEXT,
    "level1" TEXT,
    "level2" TEXT,
    "level3" TEXT,
    "level4" TEXT,
    "name" TEXT,
    "general" INTEGER NOT NULL DEFAULT 0,
    "colonel" INTEGER NOT NULL DEFAULT 0,
    "major" INTEGER NOT NULL DEFAULT 0,
    "soldier" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "checkList" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
