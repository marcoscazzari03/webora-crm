-- CreateTable
CREATE TABLE "SpesaOperativa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "importo" REAL NOT NULL,
    "valuta" TEXT NOT NULL DEFAULT 'EUR',
    "frequenza" TEXT NOT NULL,
    "prossimoRinnovo" DATETIME,
    "rinnovoAuto" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
