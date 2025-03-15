-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN', 'DRY_STORAGE', 'COOL_DARK');

-- CreateEnum
CREATE TYPE "MeasurementSystem" AS ENUM ('METRIC', 'US');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('VOLUME', 'WEIGHT', 'COUNT', 'LENGTH', 'TEMPERATURE');

-- CreateTable
CREATE TABLE "Ingredient" (
    "ingredient_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,
    "default_unit_id" INTEGER NOT NULL,
    "is_perishable" BOOLEAN NOT NULL DEFAULT false,
    "storage_type" "StorageType" NOT NULL DEFAULT 'ROOM_TEMPERATURE',
    "shelf_life_days" INTEGER,
    "storage_instructions" TEXT,
    "supplier_instructions" TEXT,
    "supplier_notes" TEXT,
    "preferred_supplier" TEXT,
    "order_lead_time_days" INTEGER,
    "cost_per_unit_dollars" DOUBLE PRECISION,
    "package_size" DOUBLE PRECISION,
    "package_unit_id" INTEGER,
    "is_local" BOOLEAN NOT NULL DEFAULT false,
    "is_organic" BOOLEAN NOT NULL DEFAULT false,
    "is_seasonal_item" BOOLEAN NOT NULL DEFAULT false,
    "has_variable_price" BOOLEAN NOT NULL DEFAULT false,
    "is_common_allergen" BOOLEAN NOT NULL DEFAULT false,
    "is_special_order" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("ingredient_id")
);

-- CreateTable
CREATE TABLE "IngredientCategory" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "store_section" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "IngredientSubcategory" (
    "subcategory_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientSubcategory_pkey" PRIMARY KEY ("subcategory_id")
);

-- CreateTable
CREATE TABLE "IngredientAllergen" (
    "allergen_id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "allergen_name" TEXT NOT NULL,

    CONSTRAINT "IngredientAllergen_pkey" PRIMARY KEY ("allergen_id")
);

-- CreateTable
CREATE TABLE "IngredientDietaryFlag" (
    "dietary_flag_id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "flag" TEXT NOT NULL,

    CONSTRAINT "IngredientDietaryFlag_pkey" PRIMARY KEY ("dietary_flag_id")
);

-- CreateTable
CREATE TABLE "IngredientSubstitute" (
    "substitute_id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "substitute_ingredient_id" INTEGER NOT NULL,
    "conversion_ratio" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "IngredientSubstitute_pkey" PRIMARY KEY ("substitute_id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "uom_id" SERIAL NOT NULL,
    "uom_name" TEXT NOT NULL,
    "uom_abbreviation" TEXT NOT NULL,
    "uom_system" "MeasurementSystem" NOT NULL,
    "uom_type" "UnitType" NOT NULL,
    "uom_base_unit_id" INTEGER,
    "uom_conversion_factor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "uom_equivalent_id" INTEGER,
    "uom_equivalent_factor" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("uom_id")
);

-- CreateTable
CREATE TABLE "IngredientDensity" (
    "density_id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "volume_unit_id" INTEGER NOT NULL,
    "weight_unit_id" INTEGER NOT NULL,
    "conversion_factor" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "IngredientDensity_pkey" PRIMARY KEY ("density_id")
);

-- CreateIndex
CREATE INDEX "Ingredient_category_id_idx" ON "Ingredient"("category_id");

-- CreateIndex
CREATE INDEX "Ingredient_subcategory_id_idx" ON "Ingredient"("subcategory_id");

-- CreateIndex
CREATE INDEX "Ingredient_name_idx" ON "Ingredient"("name");

-- CreateIndex
CREATE INDEX "Ingredient_is_perishable_idx" ON "Ingredient"("is_perishable");

-- CreateIndex
CREATE INDEX "Ingredient_storage_type_idx" ON "Ingredient"("storage_type");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCategory_name_key" ON "IngredientCategory"("name");

-- CreateIndex
CREATE INDEX "IngredientSubcategory_category_id_idx" ON "IngredientSubcategory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSubcategory_name_category_id_key" ON "IngredientSubcategory"("name", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientAllergen_ingredient_id_allergen_name_key" ON "IngredientAllergen"("ingredient_id", "allergen_name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientDietaryFlag_ingredient_id_flag_key" ON "IngredientDietaryFlag"("ingredient_id", "flag");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSubstitute_ingredient_id_substitute_ingredient_id_key" ON "IngredientSubstitute"("ingredient_id", "substitute_ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_uom_name_key" ON "UnitOfMeasure"("uom_name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_uom_abbreviation_key" ON "UnitOfMeasure"("uom_abbreviation");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_uom_system_idx" ON "UnitOfMeasure"("uom_system");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_uom_type_idx" ON "UnitOfMeasure"("uom_type");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientDensity_ingredient_id_volume_unit_id_weight_unit__key" ON "IngredientDensity"("ingredient_id", "volume_unit_id", "weight_unit_id");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "IngredientCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "IngredientSubcategory"("subcategory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_default_unit_id_fkey" FOREIGN KEY ("default_unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_package_unit_id_fkey" FOREIGN KEY ("package_unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSubcategory" ADD CONSTRAINT "IngredientSubcategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "IngredientCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientAllergen" ADD CONSTRAINT "IngredientAllergen_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientDietaryFlag" ADD CONSTRAINT "IngredientDietaryFlag_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSubstitute" ADD CONSTRAINT "IngredientSubstitute_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSubstitute" ADD CONSTRAINT "IngredientSubstitute_substitute_ingredient_id_fkey" FOREIGN KEY ("substitute_ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitOfMeasure" ADD CONSTRAINT "UnitOfMeasure_uom_base_unit_id_fkey" FOREIGN KEY ("uom_base_unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitOfMeasure" ADD CONSTRAINT "UnitOfMeasure_uom_equivalent_id_fkey" FOREIGN KEY ("uom_equivalent_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientDensity" ADD CONSTRAINT "IngredientDensity_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientDensity" ADD CONSTRAINT "IngredientDensity_volume_unit_id_fkey" FOREIGN KEY ("volume_unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientDensity" ADD CONSTRAINT "IngredientDensity_weight_unit_id_fkey" FOREIGN KEY ("weight_unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;
