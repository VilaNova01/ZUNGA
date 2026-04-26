-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "condition" TEXT NOT NULL DEFAULT 'Novo',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "offerPrice" REAL,
    "isOffer" BOOLEAN NOT NULL DEFAULT false,
    "province" TEXT,
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "colors" TEXT NOT NULL DEFAULT '[]',
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "views" INTEGER NOT NULL DEFAULT 0,
    "whatsapp" TEXT,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "city", "condition", "createdAt", "description", "featured", "id", "images", "isOffer", "latitude", "longitude", "offerPrice", "price", "province", "sellerId", "status", "title", "updatedAt", "views", "whatsapp") SELECT "categoryId", "city", "condition", "createdAt", "description", "featured", "id", "images", "isOffer", "latitude", "longitude", "offerPrice", "price", "province", "sellerId", "status", "title", "updatedAt", "views", "whatsapp" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
