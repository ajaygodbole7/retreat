/*
  Warnings:

  - Added the required column `updated_at` to the `IngredientAllergen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `IngredientDensity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `IngredientDietaryFlag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `IngredientSubstitute` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('MAIN_COURSE', 'SIDE_DISH', 'APPETIZER', 'DESSERT', 'BEVERAGE', 'BREAKFAST', 'SNACK');

-- CreateEnum
CREATE TYPE "CookingMethod" AS ENUM ('STOVETOP', 'PRESSURE_COOKER', 'OVEN', 'NO_COOK', 'SLOW_COOK', 'STEAM');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT;

-- AlterTable
ALTER TABLE "IngredientAllergen" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IngredientDensity" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IngredientDietaryFlag" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IngredientSubcategory" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT;

-- AlterTable
ALTER TABLE "IngredientSubstitute" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UnitOfMeasure" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_updated_by" TEXT;

-- CreateTable
CREATE TABLE "Recipe" (
    "recipe_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serving_size" INTEGER NOT NULL DEFAULT 8,
    "preparation_time_minutes" INTEGER,
    "cooking_time_minutes" INTEGER,
    "total_time_minutes" INTEGER,
    "notes" TEXT,
    "cooking_method" "CookingMethod",
    "cooking_equipment" TEXT,
    "has_onion_garlic" BOOLEAN NOT NULL DEFAULT true,
    "is_gluten_free" BOOLEAN NOT NULL DEFAULT false,
    "is_vegan" BOOLEAN NOT NULL DEFAULT false,
    "course_type" "CourseType" NOT NULL DEFAULT 'MAIN_COURSE',
    "tags" TEXT,
    "submitted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "recipe_step_id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "step_number" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "estimated_time_minutes" INTEGER,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("recipe_step_id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "recipe_ingredient_id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "preparation" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "scaling_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "alternate_ingredient_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("recipe_ingredient_id")
);

-- CreateIndex
CREATE INDEX "Recipe_name_idx" ON "Recipe"("name");

-- CreateIndex
CREATE INDEX "Recipe_course_type_idx" ON "Recipe"("course_type");

-- CreateIndex
CREATE INDEX "Recipe_has_onion_garlic_idx" ON "Recipe"("has_onion_garlic");

-- CreateIndex
CREATE INDEX "Recipe_is_vegan_idx" ON "Recipe"("is_vegan");

-- CreateIndex
CREATE INDEX "Recipe_is_gluten_free_idx" ON "Recipe"("is_gluten_free");

-- CreateIndex
CREATE INDEX "RecipeStep_recipe_id_step_number_idx" ON "RecipeStep"("recipe_id", "step_number");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipe_id_idx" ON "RecipeIngredient"("recipe_id");

-- CreateIndex
CREATE INDEX "RecipeIngredient_ingredient_id_idx" ON "RecipeIngredient"("ingredient_id");

-- CreateIndex
CREATE INDEX "RecipeIngredient_alternate_ingredient_id_idx" ON "RecipeIngredient"("alternate_ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipe_id_ingredient_id_unit_id_preparatio_key" ON "RecipeIngredient"("recipe_id", "ingredient_id", "unit_id", "preparation");

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_alternate_ingredient_id_fkey" FOREIGN KEY ("alternate_ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE SET NULL ON UPDATE CASCADE;
