-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('DRAFT', 'GENERATED', 'PURCHASING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShoppingListItemStatus" AS ENUM ('NEEDED', 'PURCHASED', 'PARTIAL', 'OUT_OF_STOCK', 'SUBSTITUTED', 'NOT_NEEDED');

-- CreateTable
CREATE TABLE "shopping_list" (
    "shopping_list_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "status" "ShoppingListStatus" NOT NULL DEFAULT 'DRAFT',
    "generated_at" TIMESTAMPTZ(3),
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "shopping_list_pkey" PRIMARY KEY ("shopping_list_id")
);

-- CreateTable
CREATE TABLE "shopping_list_item" (
    "shopping_list_item_id" SERIAL NOT NULL,
    "shopping_list_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "unit_abbreviation" TEXT NOT NULL,
    "category_id" INTEGER,
    "category_name" TEXT,
    "calculated_quantity" DOUBLE PRECISION NOT NULL,
    "purchased_quantity" DOUBLE PRECISION,
    "status" "ShoppingListItemStatus" NOT NULL DEFAULT 'NEEDED',
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "shopping_list_item_pkey" PRIMARY KEY ("shopping_list_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_event_id_key" ON "shopping_list"("event_id");

-- CreateIndex
CREATE INDEX "shopping_list_event_id_idx" ON "shopping_list"("event_id");

-- CreateIndex
CREATE INDEX "shopping_list_item_shopping_list_id_idx" ON "shopping_list_item"("shopping_list_id");

-- CreateIndex
CREATE INDEX "shopping_list_item_ingredient_id_idx" ON "shopping_list_item"("ingredient_id");

-- CreateIndex
CREATE INDEX "shopping_list_item_unit_id_idx" ON "shopping_list_item"("unit_id");

-- CreateIndex
CREATE INDEX "shopping_list_item_category_id_idx" ON "shopping_list_item"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_item_shopping_list_id_ingredient_id_unit_id_key" ON "shopping_list_item"("shopping_list_id", "ingredient_id", "unit_id");

-- AddForeignKey
ALTER TABLE "shopping_list" ADD CONSTRAINT "shopping_list_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_list"("shopping_list_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;
