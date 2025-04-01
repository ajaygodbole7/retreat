-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'BRUNCH', 'LIGHT_SNACKS', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('RETREAT', 'PRANAM', 'TALK', 'EVENING_PROGRAM', 'SCREENING');

-- CreateEnum
CREATE TYPE "EventPhase" AS ENUM ('PRE_RETREAT', 'MAIN_RETREAT', 'POST_RETREAT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "has_onion_garlic" SET DEFAULT false;

-- CreateTable
CREATE TABLE "Event" (
    "event_id" SERIAL NOT NULL,
    "eventName" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL DEFAULT 'RETREAT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "default_attendee_count" INTEGER NOT NULL DEFAULT 0,
    "default_volunteer_count" INTEGER NOT NULL DEFAULT 0,
    "status" "EventStatus" NOT NULL DEFAULT 'PLANNING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "EventDay" (
    "event_day_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "day_number" INTEGER NOT NULL,
    "phase" "EventPhase" NOT NULL DEFAULT 'MAIN_RETREAT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "EventDay_pkey" PRIMARY KEY ("event_day_id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "menu_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "meal_type" "MealType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "MenuRecipe" (
    "menu_recipe_id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY ("menu_recipe_id")
);

-- CreateTable
CREATE TABLE "ScheduledMeal" (
    "scheduled_meal_id" SERIAL NOT NULL,
    "day_id" INTEGER NOT NULL,
    "time" TIME NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "attendee_headcount" INTEGER NOT NULL DEFAULT 0,
    "volunteer_headcount" INTEGER NOT NULL DEFAULT 0,
    "menu_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "ScheduledMeal_pkey" PRIMARY KEY ("scheduled_meal_id")
);

-- CreateTable
CREATE TABLE "ScheduledMealRecipe" (
    "scheduled_meal_recipe_id" SERIAL NOT NULL,
    "scheduled_meal_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledMealRecipe_pkey" PRIMARY KEY ("scheduled_meal_recipe_id")
);

-- CreateTable
CREATE TABLE "EventDayConsumable" (
    "event_day_consumable_id" SERIAL NOT NULL,
    "day_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "estimated_quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "notes" TEXT,
    "purchaseTiming" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "last_updated_by" TEXT,

    CONSTRAINT "EventDayConsumable_pkey" PRIMARY KEY ("event_day_consumable_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventName_key" ON "Event"("eventName");

-- CreateIndex
CREATE INDEX "Event_eventName_idx" ON "Event"("eventName");

-- CreateIndex
CREATE INDEX "Event_start_date_end_date_idx" ON "Event"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "EventDay_event_id_idx" ON "EventDay"("event_id");

-- CreateIndex
CREATE INDEX "EventDay_date_idx" ON "EventDay"("date");

-- CreateIndex
CREATE INDEX "EventDay_phase_idx" ON "EventDay"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "EventDay_event_id_day_number_key" ON "EventDay"("event_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "EventDay_event_id_date_key" ON "EventDay"("event_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_name_key" ON "Menu"("name");

-- CreateIndex
CREATE INDEX "Menu_name_idx" ON "Menu"("name");

-- CreateIndex
CREATE INDEX "Menu_meal_type_idx" ON "Menu"("meal_type");

-- CreateIndex
CREATE INDEX "MenuRecipe_menu_id_idx" ON "MenuRecipe"("menu_id");

-- CreateIndex
CREATE INDEX "MenuRecipe_recipe_id_idx" ON "MenuRecipe"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "MenuRecipe_menu_id_recipe_id_key" ON "MenuRecipe"("menu_id", "recipe_id");

-- CreateIndex
CREATE INDEX "ScheduledMeal_day_id_idx" ON "ScheduledMeal"("day_id");

-- CreateIndex
CREATE INDEX "ScheduledMeal_menu_id_idx" ON "ScheduledMeal"("menu_id");

-- CreateIndex
CREATE INDEX "ScheduledMeal_meal_type_idx" ON "ScheduledMeal"("meal_type");

-- CreateIndex
CREATE INDEX "ScheduledMealRecipe_scheduled_meal_id_idx" ON "ScheduledMealRecipe"("scheduled_meal_id");

-- CreateIndex
CREATE INDEX "ScheduledMealRecipe_recipe_id_idx" ON "ScheduledMealRecipe"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMealRecipe_scheduled_meal_id_recipe_id_key" ON "ScheduledMealRecipe"("scheduled_meal_id", "recipe_id");

-- CreateIndex
CREATE INDEX "EventDayConsumable_day_id_idx" ON "EventDayConsumable"("day_id");

-- CreateIndex
CREATE INDEX "EventDayConsumable_ingredient_id_idx" ON "EventDayConsumable"("ingredient_id");

-- CreateIndex
CREATE INDEX "EventDayConsumable_unit_id_idx" ON "EventDayConsumable"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "EventDayConsumable_day_id_ingredient_id_key" ON "EventDayConsumable"("day_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_uom_base_unit_id_idx" ON "UnitOfMeasure"("uom_base_unit_id");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_uom_equivalent_id_idx" ON "UnitOfMeasure"("uom_equivalent_id");

-- AddForeignKey
ALTER TABLE "EventDay" ADD CONSTRAINT "EventDay_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuRecipe" ADD CONSTRAINT "MenuRecipe_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "EventDay"("event_day_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu"("menu_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMealRecipe" ADD CONSTRAINT "ScheduledMealRecipe_scheduled_meal_id_fkey" FOREIGN KEY ("scheduled_meal_id") REFERENCES "ScheduledMeal"("scheduled_meal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMealRecipe" ADD CONSTRAINT "ScheduledMealRecipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDayConsumable" ADD CONSTRAINT "EventDayConsumable_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "EventDay"("event_day_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDayConsumable" ADD CONSTRAINT "EventDayConsumable_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDayConsumable" ADD CONSTRAINT "EventDayConsumable_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "UnitOfMeasure"("uom_id") ON DELETE RESTRICT ON UPDATE CASCADE;
