--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Postgres.app)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: recipe
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO recipe;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: recipe
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CookingMethod; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."CookingMethod" AS ENUM (
    'STOVETOP',
    'PRESSURE_COOKER',
    'OVEN',
    'NO_COOK',
    'SLOW_COOK',
    'STEAM'
);


ALTER TYPE public."CookingMethod" OWNER TO recipe;

--
-- Name: CourseType; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."CourseType" AS ENUM (
    'MAIN_COURSE',
    'SIDE_DISH',
    'APPETIZER',
    'DESSERT',
    'BEVERAGE',
    'BREAKFAST',
    'SNACK'
);


ALTER TYPE public."CourseType" OWNER TO recipe;

--
-- Name: EventPhase; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."EventPhase" AS ENUM (
    'PRE_RETREAT',
    'MAIN_RETREAT',
    'POST_RETREAT'
);


ALTER TYPE public."EventPhase" OWNER TO recipe;

--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."EventStatus" AS ENUM (
    'PLANNING',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."EventStatus" OWNER TO recipe;

--
-- Name: EventType; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."EventType" AS ENUM (
    'RETREAT',
    'PRANAM',
    'TALK',
    'EVENING_PROGRAM',
    'SCREENING'
);


ALTER TYPE public."EventType" OWNER TO recipe;

--
-- Name: MealType; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."MealType" AS ENUM (
    'BREAKFAST',
    'MORNING_SNACK',
    'LUNCH',
    'AFTERNOON_SNACK',
    'DINNER',
    'BRUNCH',
    'LIGHT_SNACKS',
    'REGISTRATION'
);


ALTER TYPE public."MealType" OWNER TO recipe;

--
-- Name: MeasurementSystem; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."MeasurementSystem" AS ENUM (
    'METRIC',
    'US'
);


ALTER TYPE public."MeasurementSystem" OWNER TO recipe;

--
-- Name: ShoppingListItemStatus; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."ShoppingListItemStatus" AS ENUM (
    'NEEDED',
    'PURCHASED',
    'PARTIAL',
    'OUT_OF_STOCK',
    'SUBSTITUTED',
    'NOT_NEEDED'
);


ALTER TYPE public."ShoppingListItemStatus" OWNER TO recipe;

--
-- Name: ShoppingListStatus; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."ShoppingListStatus" AS ENUM (
    'DRAFT',
    'GENERATED',
    'PURCHASING',
    'COMPLETED',
    'ARCHIVED'
);


ALTER TYPE public."ShoppingListStatus" OWNER TO recipe;

--
-- Name: StorageType; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."StorageType" AS ENUM (
    'ROOM_TEMPERATURE',
    'REFRIGERATED',
    'FROZEN',
    'DRY_STORAGE',
    'COOL_DARK'
);


ALTER TYPE public."StorageType" OWNER TO recipe;

--
-- Name: UnitType; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."UnitType" AS ENUM (
    'VOLUME',
    'WEIGHT',
    'COUNT',
    'LENGTH',
    'TEMPERATURE'
);


ALTER TYPE public."UnitType" OWNER TO recipe;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: recipe
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);


ALTER TYPE public."UserStatus" OWNER TO recipe;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."Event" (
    event_id integer NOT NULL,
    "eventName" text NOT NULL,
    description text,
    "eventType" public."EventType" DEFAULT 'RETREAT'::public."EventType" NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    location text,
    default_attendee_count integer DEFAULT 0 NOT NULL,
    default_volunteer_count integer DEFAULT 0 NOT NULL,
    status public."EventStatus" DEFAULT 'PLANNING'::public."EventStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."Event" OWNER TO recipe;

--
-- Name: EventDay; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."EventDay" (
    event_day_id integer NOT NULL,
    event_id integer NOT NULL,
    date date NOT NULL,
    day_number integer NOT NULL,
    phase public."EventPhase" DEFAULT 'MAIN_RETREAT'::public."EventPhase" NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text,
    attendee_headcount_for_day integer DEFAULT 0 NOT NULL,
    volunteer_headcount_for_day integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."EventDay" OWNER TO recipe;

--
-- Name: EventDayConsumable; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."EventDayConsumable" (
    event_day_consumable_id integer NOT NULL,
    day_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    unit_id integer NOT NULL,
    notes text,
    "purchaseTiming" text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text,
    base_serving_quantity double precision NOT NULL,
    base_serving_size integer DEFAULT 8 NOT NULL
);


ALTER TABLE public."EventDayConsumable" OWNER TO recipe;

--
-- Name: EventDayConsumable_event_day_consumable_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."EventDayConsumable_event_day_consumable_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventDayConsumable_event_day_consumable_id_seq" OWNER TO recipe;

--
-- Name: EventDayConsumable_event_day_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."EventDayConsumable_event_day_consumable_id_seq" OWNED BY public."EventDayConsumable".event_day_consumable_id;


--
-- Name: EventDay_event_day_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."EventDay_event_day_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventDay_event_day_id_seq" OWNER TO recipe;

--
-- Name: EventDay_event_day_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."EventDay_event_day_id_seq" OWNED BY public."EventDay".event_day_id;


--
-- Name: Event_event_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."Event_event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_event_id_seq" OWNER TO recipe;

--
-- Name: Event_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."Event_event_id_seq" OWNED BY public."Event".event_id;


--
-- Name: Ingredient; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."Ingredient" (
    ingredient_id integer NOT NULL,
    name text NOT NULL,
    description text,
    category_id integer NOT NULL,
    subcategory_id integer,
    default_unit_id integer NOT NULL,
    is_perishable boolean DEFAULT false NOT NULL,
    storage_type public."StorageType" DEFAULT 'ROOM_TEMPERATURE'::public."StorageType" NOT NULL,
    shelf_life_days integer,
    storage_instructions text,
    supplier_instructions text,
    supplier_notes text,
    preferred_supplier text,
    order_lead_time_days integer,
    cost_per_unit_dollars double precision,
    package_size double precision,
    package_unit_id integer,
    is_local boolean DEFAULT false NOT NULL,
    is_organic boolean DEFAULT false NOT NULL,
    is_seasonal_item boolean DEFAULT false NOT NULL,
    has_variable_price boolean DEFAULT false NOT NULL,
    is_common_allergen boolean DEFAULT false NOT NULL,
    is_special_order boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."Ingredient" OWNER TO recipe;

--
-- Name: IngredientAllergen; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientAllergen" (
    allergen_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    allergen_name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text,
    last_updated_by text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IngredientAllergen" OWNER TO recipe;

--
-- Name: IngredientAllergen_allergen_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientAllergen_allergen_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientAllergen_allergen_id_seq" OWNER TO recipe;

--
-- Name: IngredientAllergen_allergen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientAllergen_allergen_id_seq" OWNED BY public."IngredientAllergen".allergen_id;


--
-- Name: IngredientCategory; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientCategory" (
    category_id integer NOT NULL,
    name text NOT NULL,
    description text,
    store_section text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IngredientCategory" OWNER TO recipe;

--
-- Name: IngredientCategory_category_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientCategory_category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientCategory_category_id_seq" OWNER TO recipe;

--
-- Name: IngredientCategory_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientCategory_category_id_seq" OWNED BY public."IngredientCategory".category_id;


--
-- Name: IngredientDensity; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientDensity" (
    density_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    volume_unit_id integer NOT NULL,
    weight_unit_id integer NOT NULL,
    conversion_factor double precision NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text,
    last_updated_by text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IngredientDensity" OWNER TO recipe;

--
-- Name: IngredientDensity_density_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientDensity_density_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientDensity_density_id_seq" OWNER TO recipe;

--
-- Name: IngredientDensity_density_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientDensity_density_id_seq" OWNED BY public."IngredientDensity".density_id;


--
-- Name: IngredientDietaryFlag; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientDietaryFlag" (
    dietary_flag_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    flag text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text,
    last_updated_by text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IngredientDietaryFlag" OWNER TO recipe;

--
-- Name: IngredientDietaryFlag_dietary_flag_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientDietaryFlag_dietary_flag_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientDietaryFlag_dietary_flag_id_seq" OWNER TO recipe;

--
-- Name: IngredientDietaryFlag_dietary_flag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientDietaryFlag_dietary_flag_id_seq" OWNED BY public."IngredientDietaryFlag".dietary_flag_id;


--
-- Name: IngredientSubcategory; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientSubcategory" (
    subcategory_id integer NOT NULL,
    name text NOT NULL,
    description text,
    category_id integer NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."IngredientSubcategory" OWNER TO recipe;

--
-- Name: IngredientSubcategory_subcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientSubcategory_subcategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientSubcategory_subcategory_id_seq" OWNER TO recipe;

--
-- Name: IngredientSubcategory_subcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientSubcategory_subcategory_id_seq" OWNED BY public."IngredientSubcategory".subcategory_id;


--
-- Name: IngredientSubstitute; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."IngredientSubstitute" (
    substitute_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    substitute_ingredient_id integer NOT NULL,
    conversion_ratio double precision DEFAULT 1 NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text,
    last_updated_by text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IngredientSubstitute" OWNER TO recipe;

--
-- Name: IngredientSubstitute_substitute_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."IngredientSubstitute_substitute_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientSubstitute_substitute_id_seq" OWNER TO recipe;

--
-- Name: IngredientSubstitute_substitute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."IngredientSubstitute_substitute_id_seq" OWNED BY public."IngredientSubstitute".substitute_id;


--
-- Name: Ingredient_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."Ingredient_ingredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Ingredient_ingredient_id_seq" OWNER TO recipe;

--
-- Name: Ingredient_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."Ingredient_ingredient_id_seq" OWNED BY public."Ingredient".ingredient_id;


--
-- Name: Menu; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."Menu" (
    menu_id integer NOT NULL,
    name text NOT NULL,
    description text,
    meal_type public."MealType",
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."Menu" OWNER TO recipe;

--
-- Name: MenuRecipe; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."MenuRecipe" (
    menu_recipe_id integer NOT NULL,
    menu_id integer NOT NULL,
    recipe_id integer NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MenuRecipe" OWNER TO recipe;

--
-- Name: MenuRecipe_menu_recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."MenuRecipe_menu_recipe_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuRecipe_menu_recipe_id_seq" OWNER TO recipe;

--
-- Name: MenuRecipe_menu_recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."MenuRecipe_menu_recipe_id_seq" OWNED BY public."MenuRecipe".menu_recipe_id;


--
-- Name: Menu_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."Menu_menu_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Menu_menu_id_seq" OWNER TO recipe;

--
-- Name: Menu_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."Menu_menu_id_seq" OWNED BY public."Menu".menu_id;


--
-- Name: Recipe; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."Recipe" (
    recipe_id integer NOT NULL,
    name text NOT NULL,
    description text,
    serving_size integer DEFAULT 8 NOT NULL,
    preparation_time_minutes integer,
    cooking_time_minutes integer,
    total_time_minutes integer,
    notes text,
    cooking_method public."CookingMethod",
    cooking_equipment text,
    has_onion_garlic boolean DEFAULT false NOT NULL,
    is_gluten_free boolean DEFAULT false NOT NULL,
    is_vegan boolean DEFAULT false NOT NULL,
    course_type public."CourseType" DEFAULT 'MAIN_COURSE'::public."CourseType" NOT NULL,
    tags text,
    submitted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."Recipe" OWNER TO recipe;

--
-- Name: RecipeIngredient; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."RecipeIngredient" (
    recipe_ingredient_id integer NOT NULL,
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantity double precision NOT NULL,
    unit_id integer NOT NULL,
    preparation text,
    is_optional boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    notes text,
    scaling_factor double precision DEFAULT 1.0 NOT NULL,
    alternate_ingredient_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."RecipeIngredient" OWNER TO recipe;

--
-- Name: RecipeIngredient_recipe_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."RecipeIngredient_recipe_ingredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RecipeIngredient_recipe_ingredient_id_seq" OWNER TO recipe;

--
-- Name: RecipeIngredient_recipe_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."RecipeIngredient_recipe_ingredient_id_seq" OWNED BY public."RecipeIngredient".recipe_ingredient_id;


--
-- Name: RecipeStep; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."RecipeStep" (
    recipe_step_id integer NOT NULL,
    recipe_id integer NOT NULL,
    step_number integer NOT NULL,
    instruction text NOT NULL,
    estimated_time_minutes integer,
    is_optional boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."RecipeStep" OWNER TO recipe;

--
-- Name: RecipeStep_recipe_step_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."RecipeStep_recipe_step_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RecipeStep_recipe_step_id_seq" OWNER TO recipe;

--
-- Name: RecipeStep_recipe_step_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."RecipeStep_recipe_step_id_seq" OWNED BY public."RecipeStep".recipe_step_id;


--
-- Name: Recipe_recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."Recipe_recipe_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Recipe_recipe_id_seq" OWNER TO recipe;

--
-- Name: Recipe_recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."Recipe_recipe_id_seq" OWNED BY public."Recipe".recipe_id;


--
-- Name: ScheduledMeal; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."ScheduledMeal" (
    scheduled_meal_id integer NOT NULL,
    day_id integer NOT NULL,
    "time" time without time zone NOT NULL,
    meal_type public."MealType" NOT NULL,
    attendee_headcount integer DEFAULT 0 NOT NULL,
    volunteer_headcount integer DEFAULT 0 NOT NULL,
    menu_id integer,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."ScheduledMeal" OWNER TO recipe;

--
-- Name: ScheduledMealRecipe; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."ScheduledMealRecipe" (
    scheduled_meal_recipe_id integer NOT NULL,
    scheduled_meal_id integer NOT NULL,
    recipe_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ScheduledMealRecipe" OWNER TO recipe;

--
-- Name: ScheduledMealRecipe_scheduled_meal_recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."ScheduledMealRecipe_scheduled_meal_recipe_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ScheduledMealRecipe_scheduled_meal_recipe_id_seq" OWNER TO recipe;

--
-- Name: ScheduledMealRecipe_scheduled_meal_recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."ScheduledMealRecipe_scheduled_meal_recipe_id_seq" OWNED BY public."ScheduledMealRecipe".scheduled_meal_recipe_id;


--
-- Name: ScheduledMeal_scheduled_meal_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."ScheduledMeal_scheduled_meal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ScheduledMeal_scheduled_meal_id_seq" OWNER TO recipe;

--
-- Name: ScheduledMeal_scheduled_meal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."ScheduledMeal_scheduled_meal_id_seq" OWNED BY public."ScheduledMeal".scheduled_meal_id;


--
-- Name: UnitOfMeasure; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."UnitOfMeasure" (
    uom_id integer NOT NULL,
    uom_name text NOT NULL,
    uom_abbreviation text NOT NULL,
    uom_system public."MeasurementSystem" NOT NULL,
    uom_type public."UnitType" NOT NULL,
    uom_base_unit_id integer,
    uom_conversion_factor double precision DEFAULT 1 NOT NULL,
    uom_equivalent_id integer,
    uom_equivalent_factor double precision,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    last_updated_by text
);


ALTER TABLE public."UnitOfMeasure" OWNER TO recipe;

--
-- Name: UnitOfMeasure_uom_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public."UnitOfMeasure_uom_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UnitOfMeasure_uom_id_seq" OWNER TO recipe;

--
-- Name: UnitOfMeasure_uom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public."UnitOfMeasure_uom_id_seq" OWNED BY public."UnitOfMeasure".uom_id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO recipe;

--
-- Name: password_reset_token; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public.password_reset_token (
    reset_token_id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) with time zone NOT NULL,
    used_at timestamp(3) with time zone,
    created_by text,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_by text,
    updated_at timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.password_reset_token OWNER TO recipe;

--
-- Name: password_reset_token_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public.password_reset_token_reset_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_token_reset_token_id_seq OWNER TO recipe;

--
-- Name: password_reset_token_reset_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public.password_reset_token_reset_token_id_seq OWNED BY public.password_reset_token.reset_token_id;


--
-- Name: shopping_list; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public.shopping_list (
    shopping_list_id integer NOT NULL,
    event_id integer NOT NULL,
    status public."ShoppingListStatus" DEFAULT 'DRAFT'::public."ShoppingListStatus" NOT NULL,
    generated_at timestamp(3) with time zone,
    notes text,
    created_by text,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_by text,
    updated_at timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.shopping_list OWNER TO recipe;

--
-- Name: shopping_list_item; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public.shopping_list_item (
    shopping_list_item_id integer NOT NULL,
    shopping_list_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    unit_id integer NOT NULL,
    ingredient_name text NOT NULL,
    unit_abbreviation text NOT NULL,
    category_id integer,
    category_name text,
    calculated_quantity double precision NOT NULL,
    purchased_quantity double precision,
    status public."ShoppingListItemStatus" DEFAULT 'NEEDED'::public."ShoppingListItemStatus" NOT NULL,
    notes text,
    created_by text,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_by text,
    updated_at timestamp(3) with time zone NOT NULL,
    "orderPickupDate" date,
    "orderedFrom" text
);


ALTER TABLE public.shopping_list_item OWNER TO recipe;

--
-- Name: shopping_list_item_shopping_list_item_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public.shopping_list_item_shopping_list_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_list_item_shopping_list_item_id_seq OWNER TO recipe;

--
-- Name: shopping_list_item_shopping_list_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public.shopping_list_item_shopping_list_item_id_seq OWNED BY public.shopping_list_item.shopping_list_item_id;


--
-- Name: shopping_list_shopping_list_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public.shopping_list_shopping_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_list_shopping_list_id_seq OWNER TO recipe;

--
-- Name: shopping_list_shopping_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public.shopping_list_shopping_list_id_seq OWNED BY public.shopping_list.shopping_list_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: recipe
--

CREATE TABLE public."user" (
    user_id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    status public."UserStatus" DEFAULT 'PENDING_VERIFICATION'::public."UserStatus" NOT NULL,
    last_login_at timestamp(3) with time zone,
    created_by text,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_by text,
    updated_at timestamp(3) with time zone NOT NULL
);


ALTER TABLE public."user" OWNER TO recipe;

--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: recipe
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_user_id_seq OWNER TO recipe;

--
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: recipe
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;


--
-- Name: Event event_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Event" ALTER COLUMN event_id SET DEFAULT nextval('public."Event_event_id_seq"'::regclass);


--
-- Name: EventDay event_day_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDay" ALTER COLUMN event_day_id SET DEFAULT nextval('public."EventDay_event_day_id_seq"'::regclass);


--
-- Name: EventDayConsumable event_day_consumable_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDayConsumable" ALTER COLUMN event_day_consumable_id SET DEFAULT nextval('public."EventDayConsumable_event_day_consumable_id_seq"'::regclass);


--
-- Name: Ingredient ingredient_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient" ALTER COLUMN ingredient_id SET DEFAULT nextval('public."Ingredient_ingredient_id_seq"'::regclass);


--
-- Name: IngredientAllergen allergen_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientAllergen" ALTER COLUMN allergen_id SET DEFAULT nextval('public."IngredientAllergen_allergen_id_seq"'::regclass);


--
-- Name: IngredientCategory category_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientCategory" ALTER COLUMN category_id SET DEFAULT nextval('public."IngredientCategory_category_id_seq"'::regclass);


--
-- Name: IngredientDensity density_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDensity" ALTER COLUMN density_id SET DEFAULT nextval('public."IngredientDensity_density_id_seq"'::regclass);


--
-- Name: IngredientDietaryFlag dietary_flag_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDietaryFlag" ALTER COLUMN dietary_flag_id SET DEFAULT nextval('public."IngredientDietaryFlag_dietary_flag_id_seq"'::regclass);


--
-- Name: IngredientSubcategory subcategory_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubcategory" ALTER COLUMN subcategory_id SET DEFAULT nextval('public."IngredientSubcategory_subcategory_id_seq"'::regclass);


--
-- Name: IngredientSubstitute substitute_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubstitute" ALTER COLUMN substitute_id SET DEFAULT nextval('public."IngredientSubstitute_substitute_id_seq"'::regclass);


--
-- Name: Menu menu_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Menu" ALTER COLUMN menu_id SET DEFAULT nextval('public."Menu_menu_id_seq"'::regclass);


--
-- Name: MenuRecipe menu_recipe_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."MenuRecipe" ALTER COLUMN menu_recipe_id SET DEFAULT nextval('public."MenuRecipe_menu_recipe_id_seq"'::regclass);


--
-- Name: Recipe recipe_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Recipe" ALTER COLUMN recipe_id SET DEFAULT nextval('public."Recipe_recipe_id_seq"'::regclass);


--
-- Name: RecipeIngredient recipe_ingredient_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient" ALTER COLUMN recipe_ingredient_id SET DEFAULT nextval('public."RecipeIngredient_recipe_ingredient_id_seq"'::regclass);


--
-- Name: RecipeStep recipe_step_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeStep" ALTER COLUMN recipe_step_id SET DEFAULT nextval('public."RecipeStep_recipe_step_id_seq"'::regclass);


--
-- Name: ScheduledMeal scheduled_meal_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMeal" ALTER COLUMN scheduled_meal_id SET DEFAULT nextval('public."ScheduledMeal_scheduled_meal_id_seq"'::regclass);


--
-- Name: ScheduledMealRecipe scheduled_meal_recipe_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMealRecipe" ALTER COLUMN scheduled_meal_recipe_id SET DEFAULT nextval('public."ScheduledMealRecipe_scheduled_meal_recipe_id_seq"'::regclass);


--
-- Name: UnitOfMeasure uom_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."UnitOfMeasure" ALTER COLUMN uom_id SET DEFAULT nextval('public."UnitOfMeasure_uom_id_seq"'::regclass);


--
-- Name: password_reset_token reset_token_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.password_reset_token ALTER COLUMN reset_token_id SET DEFAULT nextval('public.password_reset_token_reset_token_id_seq'::regclass);


--
-- Name: shopping_list shopping_list_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list ALTER COLUMN shopping_list_id SET DEFAULT nextval('public.shopping_list_shopping_list_id_seq'::regclass);


--
-- Name: shopping_list_item shopping_list_item_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list_item ALTER COLUMN shopping_list_item_id SET DEFAULT nextval('public.shopping_list_item_shopping_list_item_id_seq'::regclass);


--
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."Event" (event_id, "eventName", description, "eventType", start_date, end_date, location, default_attendee_count, default_volunteer_count, status, created_at, updated_at, created_by, last_updated_by) FROM stdin;
5	2024 Fall - Kriya Yoga - 1		RETREAT	2024-10-24 07:00:00	2024-10-26 07:00:00	Graham, TX	100	40	PLANNING	2025-04-05 15:14:01.792	2025-04-05 15:55:12.906	system	system
\.


--
-- Data for Name: EventDay; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."EventDay" (event_day_id, event_id, date, day_number, phase, notes, created_at, updated_at, created_by, last_updated_by, attendee_headcount_for_day, volunteer_headcount_for_day) FROM stdin;
7	5	2024-10-24	1	MAIN_RETREAT		2025-04-05 15:15:43.586	2025-04-05 15:15:43.586	system	system	100	40
\.


--
-- Data for Name: EventDayConsumable; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."EventDayConsumable" (event_day_consumable_id, day_id, ingredient_id, unit_id, notes, "purchaseTiming", created_at, updated_at, created_by, last_updated_by, base_serving_quantity, base_serving_size) FROM stdin;
4	7	176	34		\N	2025-04-22 04:37:56.392	2025-04-22 04:37:56.392	system	system	20	8
\.


--
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."Ingredient" (ingredient_id, name, description, category_id, subcategory_id, default_unit_id, is_perishable, storage_type, shelf_life_days, storage_instructions, supplier_instructions, supplier_notes, preferred_supplier, order_lead_time_days, cost_per_unit_dollars, package_size, package_unit_id, is_local, is_organic, is_seasonal_item, has_variable_price, is_common_allergen, is_special_order, created_at, updated_at, created_by, last_updated_by) FROM stdin;
3	Almonds		1	2	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.				\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.235	2025-03-16 22:49:30.165	\N	\N
1	Fresh Spinach	Fresh leafy green vegetable - Ajay update 11:32	4	15	20	t	REFRIGERATED	7	Keep refrigerated in high humidity drawer				\N	\N	\N	\N	t	t	t	t	f	f	2025-03-16 15:52:59.647	2025-03-16 18:32:39.164	\N	\N
4	Bamboo shoots, canned	10oz can	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.247	2025-03-16 22:47:04.247	\N	\N
5	Basmati Rice	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.25	2025-03-16 22:47:04.25	\N	\N
6	Ambe Mor Rice	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.254	2025-03-16 22:47:04.254	\N	\N
7	Besan	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.256	2025-03-16 22:47:04.256	\N	\N
8	Black Beans	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.26	2025-03-16 22:47:04.26	\N	\N
9	Black Chana	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.263	2025-03-16 22:47:04.263	\N	\N
10	Black urad split dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.265	2025-03-16 22:47:04.265	\N	\N
11	Cannellini beans	dry, not canned	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.268	2025-03-16 22:47:04.268	\N	\N
12	Cashews	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.27	2025-03-16 22:47:04.27	\N	\N
13	Chana dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.272	2025-03-16 22:47:04.272	\N	\N
14	Chickpea can	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.274	2025-03-16 22:47:04.274	\N	\N
15	Chickpeas	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.277	2025-03-16 22:47:04.277	\N	\N
17	Cream of rice	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.283	2025-03-16 22:47:04.283	\N	\N
18	Crushed tomatoes	canned	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.285	2025-03-16 22:47:04.285	\N	\N
19	Fire Roasted Tomatoes	https://www.samsclub.com/p/hunts-fire-roasted-diced-tomatoes-8-pk/prod25810858	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.287	2025-03-16 22:47:04.287	\N	\N
20	Dry coconut slices	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.289	2025-03-16 22:47:04.289	\N	\N
21	Green Mung dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.292	2025-03-16 22:47:04.292	\N	\N
22	Idli Rava	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.294	2025-03-16 22:47:04.294	\N	\N
23	Jasmine Rice	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.296	2025-03-16 22:47:04.296	\N	\N
24	Kerala Matta Rice	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.299	2025-03-16 22:47:04.299	\N	\N
25	Marinara sauce	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.302	2025-03-16 22:47:04.302	\N	\N
26	Masoor dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.304	2025-03-16 22:47:04.304	\N	\N
27	Moth (Matki)	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.307	2025-03-16 22:47:04.307	\N	\N
28	Mung Dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.31	2025-03-16 22:47:04.31	\N	\N
29	Olives (pitted)	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.312	2025-03-16 22:47:04.312	\N	\N
30	Orecchiette pasta	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.315	2025-03-16 22:47:04.315	\N	\N
31	Pecans	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.317	2025-03-16 22:47:04.317	\N	\N
32	Quinoa	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.319	2025-03-16 22:47:04.319	\N	\N
33	Raisins	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.321	2025-03-16 22:47:04.321	\N	\N
34	Rajma	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.323	2025-03-16 22:47:04.323	\N	\N
35	Roasted daliya	https://www.amazon.com/Dalia-Split-Roasted-Chick-Peas/dp/B004YKSM8Y	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.326	2025-03-16 22:47:04.326	\N	\N
36	Rolled Oats	Organic please (or glyphosate free).  https://www.webstaurantstore.com/bobs-red-mill-25-lb-organic-gluten-free-whole-grain-rolled-oats/1041992B25.html	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.328	2025-03-16 22:47:04.328	\N	\N
37	Sona Masoori Rice	hand pounded rice	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.33	2025-03-16 22:47:04.33	\N	\N
38	Sunflower seeds	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.332	2025-03-16 22:47:04.332	\N	\N
39	Thick Poha	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.335	2025-03-16 22:47:04.335	\N	\N
40	Tomato paste	canned	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.34	2025-03-16 22:47:04.34	\N	\N
41	Toor Dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.343	2025-03-16 22:47:04.343	\N	\N
42	Urad dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.347	2025-03-16 22:47:04.347	\N	\N
43	Vermicelli	https://www.amazon.com/Bambino-Vermicelli-800-Grams-gm/dp/B002EDX2N8	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.351	2025-03-16 22:47:04.351	\N	\N
44	Whole black Urad Dal	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.353	2025-03-16 22:47:04.353	\N	\N
45	Whole Green Mung	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.356	2025-03-16 22:47:04.356	\N	\N
46	Whole wheat flour	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.358	2025-03-16 22:47:04.358	\N	\N
47	Sooji	\N	1	\N	24	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.36	2025-03-16 22:47:04.36	\N	\N
16	Coconut milk	13.5floz or 400ml cans.  If you get larger cans, reduce the quantity appropriately.  Large quantity available at https://www.webstaurantstore.com/chaokoh-unsweetened-coconut-milk-10-can-case/115CHAOKBULK.html	1	6	19	f	DRY_STORAGE	365	Store in a cool, dry place in airtight containers.				\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 22:47:04.281	2025-03-16 23:25:05.047	\N	\N
49	Sunflower Oil	\N	2	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 23:38:59.287	2025-03-16 23:38:59.287	\N	\N
50	Olive oil	\N	2	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 23:38:59.29	2025-03-16 23:38:59.29	\N	\N
51	Sesame (Gingelly) Oil	\N	2	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 23:38:59.293	2025-03-16 23:38:59.293	\N	\N
52	Mustard Oil	\N	2	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 23:38:59.296	2025-03-16 23:38:59.296	\N	\N
48	Coconut Oil		2	7	15	f	DRY_STORAGE	365	Store in a cool, dark place.				\N	\N	\N	\N	f	f	f	t	f	f	2025-03-16 23:38:59.278	2025-03-16 23:40:11.417	\N	\N
53	Amchur	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.256	2025-03-17 00:13:21.256	\N	\N
54	Bisibhele Bhaat Masala	MTR brand	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.264	2025-03-17 00:13:21.264	\N	\N
55	Bay Leaf	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.268	2025-03-17 00:13:21.268	\N	\N
57	Bouillon	https://www.amazon.com/Better-Than-Bouillon-Seasoned-Vegetable/dp/B0B59D5VH8/ref=sr_1_1?crid=HJHQ7M2WF7Z4&keywords=better+than+bouillon+vegetable&qid=1707545716&sprefix=better+than+b%2Caps%2C247&sr=8-1	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.274	2025-03-17 00:13:21.274	\N	\N
58	Cardamom	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.277	2025-03-17 00:13:21.277	\N	\N
59	Chana masala	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.279	2025-03-17 00:13:21.279	\N	\N
60	Chutney podi	MTR brand	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.282	2025-03-17 00:13:21.282	\N	\N
61	Cinnamon	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.284	2025-03-17 00:13:21.284	\N	\N
62	Cloves	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.287	2025-03-17 00:13:21.287	\N	\N
63	Coriander Powder	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.289	2025-03-17 00:13:21.289	\N	\N
64	Coriander Seeds	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.291	2025-03-17 00:13:21.291	\N	\N
65	Dry Ginger powder	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.293	2025-03-17 00:13:21.293	\N	\N
66	Fennel	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.296	2025-03-17 00:13:21.296	\N	\N
67	Fiesta Fajita seasoning	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.298	2025-03-17 00:13:21.298	\N	\N
68	Garam masala	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.3	2025-03-17 00:13:21.3	\N	\N
69	Goda masala	anita get from india	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.303	2025-03-17 00:13:21.303	\N	\N
70	Green curry paste	\N	3	\N	24	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.305	2025-03-17 00:13:21.305	\N	\N
71	Hing	get gluten free if possible	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.308	2025-03-17 00:13:21.308	\N	\N
72	Nutmeg (whole)	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.31	2025-03-17 00:13:21.31	\N	\N
73	Jaggery	jaggery powder please	3	\N	24	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.312	2025-03-17 00:13:21.312	\N	\N
74	Jeera	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.314	2025-03-17 00:13:21.314	\N	\N
75	Jeera powder	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.316	2025-03-17 00:13:21.316	\N	\N
76	Kasuri Methi	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.319	2025-03-17 00:13:21.319	\N	\N
77	Lemon Juice Concentrate	\N	3	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.322	2025-03-17 00:13:21.322	\N	\N
78	Loose leaf tea	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.325	2025-03-17 00:13:21.325	\N	\N
79	Methi seeds	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.327	2025-03-17 00:13:21.327	\N	\N
80	Metkut	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.333	2025-03-17 00:13:21.333	\N	\N
81	Mexican dried oregano	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.335	2025-03-17 00:13:21.335	\N	\N
82	Mustard seeds	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.337	2025-03-17 00:13:21.337	\N	\N
83	Oregano	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.339	2025-03-17 00:13:21.339	\N	\N
84	Lemongrass	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.341	2025-03-17 00:13:21.341	\N	\N
85	Red Chillies	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.343	2025-03-17 00:13:21.343	\N	\N
86	Red Chilly Powder	Kashmiri red chilly powder plz	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.345	2025-03-17 00:13:21.345	\N	\N
87	Red curry paste	\N	3	\N	24	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.347	2025-03-17 00:13:21.347	\N	\N
88	Saffron	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.349	2025-03-17 00:13:21.349	\N	\N
90	Sambar powder	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.356	2025-03-17 00:13:21.356	\N	\N
91	Sesame seeds	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.359	2025-03-17 00:13:21.359	\N	\N
92	Star Anise	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.361	2025-03-17 00:13:21.361	\N	\N
93	Sugar	\N	3	14	24	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.363	2025-03-17 00:13:21.363	\N	\N
94	Tamari	\N	3	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.366	2025-03-17 00:13:21.366	\N	\N
95	Tamarind	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.368	2025-03-17 00:13:21.368	\N	\N
96	Chai Masala	anita get from india	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.37	2025-03-17 00:13:21.37	\N	\N
97	Tone's Cilantro Lime	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.372	2025-03-17 00:13:21.372	\N	\N
98	Turmeric Powder	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.374	2025-03-17 00:13:21.374	\N	\N
99	Soy Sauce	\N	3	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.376	2025-03-17 00:13:21.376	\N	\N
89	Salt	sea salt please	3	13	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.351	2025-03-17 00:13:21.351	\N	\N
100	Rice Vinegar	\N	3	\N	15	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.378	2025-03-17 00:13:21.378	\N	\N
101	Smoked paprika	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.38	2025-03-17 00:13:21.38	\N	\N
103	Fried Onion	\N	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.385	2025-03-17 00:13:21.385	\N	\N
104	Tindora	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.666	2025-03-17 00:32:36.666	\N	\N
105	Avocado medium	\N	4	\N	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.671	2025-03-17 00:32:36.671	\N	\N
106	Baby spinach	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.674	2025-03-17 00:32:36.674	\N	\N
107	Bhindi	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.678	2025-03-17 00:32:36.678	\N	\N
108	Bottle gourd	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.68	2025-03-17 00:32:36.68	\N	\N
109	Broccoli	\N	4	17	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.683	2025-03-17 00:32:36.683	\N	\N
110	Butternut squash	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.686	2025-03-17 00:32:36.686	\N	\N
111	Cabbage	\N	4	17	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.689	2025-03-17 00:32:36.689	\N	\N
112	Carrots	\N	4	16	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.692	2025-03-17 00:32:36.692	\N	\N
113	Cauliflower	\N	4	17	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.695	2025-03-17 00:32:36.695	\N	\N
114	Celery	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.697	2025-03-17 00:32:36.697	\N	\N
115	Chayote Squash	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.699	2025-03-17 00:32:36.699	\N	\N
116	Cilantro	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.701	2025-03-17 00:32:36.701	\N	\N
117	Cucumber	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.703	2025-03-17 00:32:36.703	\N	\N
118	Curry Leaves	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.705	2025-03-17 00:32:36.705	\N	\N
119	Drumstick	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.708	2025-03-17 00:32:36.708	\N	\N
120	Eggplant	small round indian	4	20	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.71	2025-03-17 00:32:36.71	\N	\N
121	French Green Beans	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.712	2025-03-17 00:32:36.712	\N	\N
122	Garlic	\N	4	18	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.714	2025-03-17 00:32:36.714	\N	\N
123	Ginger	\N	4	\N	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.716	2025-03-17 00:32:36.716	\N	\N
124	Gongura leaves	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.718	2025-03-17 00:32:36.718	\N	\N
125	Green Beans	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.72	2025-03-17 00:32:36.72	\N	\N
126	Green bell pepper	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.723	2025-03-17 00:32:36.723	\N	\N
127	Green chillies	indian kind, not thai chillies	4	\N	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.726	2025-03-17 00:32:36.726	\N	\N
128	Green Papaya	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.728	2025-03-17 00:32:36.728	\N	\N
129	Italian Basil	fresh	4	\N	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.73	2025-03-17 00:32:36.73	\N	\N
130	Jalapeno	\N	4	\N	3	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.732	2025-03-17 00:32:36.732	\N	\N
131	Long beans	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.734	2025-03-17 00:32:36.734	\N	\N
132	Mint	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.737	2025-03-17 00:32:36.737	\N	\N
133	Onion	\N	4	18	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.739	2025-03-17 00:32:36.739	\N	\N
134	Potato	Yukon gold potatoes please	4	16	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.741	2025-03-17 00:32:36.741	\N	\N
135	Purple Cabbage	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.747	2025-03-17 00:32:36.747	\N	\N
136	Radish	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.749	2025-03-17 00:32:36.749	\N	\N
137	Red bell pepper	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.751	2025-03-17 00:32:36.751	\N	\N
138	Red pumpkin	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.754	2025-03-17 00:32:36.754	\N	\N
139	Romaine lettuce	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.756	2025-03-17 00:32:36.756	\N	\N
140	Snake gourd	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.759	2025-03-17 00:32:36.759	\N	\N
141	Spinach	\N	4	15	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.762	2025-03-17 00:32:36.762	\N	\N
142	Spring Mix	\N	4	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.764	2025-03-17 00:32:36.764	\N	\N
143	Thai basil	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.766	2025-03-17 00:32:36.766	\N	\N
144	Tomatoes	\N	4	20	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.768	2025-03-17 00:32:36.768	\N	\N
145	Zucchini	\N	4	19	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.77	2025-03-17 00:32:36.77	\N	\N
146	Spring Onion	\N	4	\N	29	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:32:36.772	2025-03-17 00:32:36.772	\N	\N
147	Yogurt	\N	5	31	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:51:30.118	2025-03-17 00:51:30.118	\N	\N
148	Milk	\N	5	29	15	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:51:30.123	2025-03-17 00:51:30.123	\N	\N
149	Tofu - extra firm	\N	5	\N	33	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:51:30.127	2025-03-17 00:51:30.127	\N	\N
150	Mexican blend cheese	\N	5	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:51:30.13	2025-03-17 00:51:30.13	\N	\N
151	Greek Yogurt	\N	5	\N	24	t	REFRIGERATED	7	Store in the refrigerator	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 00:51:30.133	2025-03-17 00:51:30.133	\N	\N
153	Peas	\N	6	\N	24	t	FROZEN	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:03:37.447	2025-03-17 01:03:37.447	\N	\N
154	Charred Corn	regular frozen corn ok	6	\N	24	t	FROZEN	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:03:37.45	2025-03-17 01:03:37.45	\N	\N
102	Achaar masala	make pickles spicy	3	\N	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.		abcd mike testing		\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.383	2025-03-23 15:05:45.914	\N	\N
152	Frozen coconut	340 gram packet	6	\N	3	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:03:37.441	2025-03-17 01:03:37.441	\N	\N
158	Dhokla	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.918	2025-03-17 01:18:53.918	\N	\N
159	Pickle	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.923	2025-03-17 01:18:53.923	\N	\N
160	Ghee	anita to order from Sunrise Natural Foods	7	\N	15	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.927	2025-03-17 01:18:53.927	\N	\N
161	Whole grain bread	\N	7	\N	35	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.931	2025-03-17 01:18:53.931	\N	\N
162	Gluten-free bread	\N	7	\N	35	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.934	2025-03-17 01:18:53.934	\N	\N
163	Regular cereal	bring variety	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.936	2025-03-17 01:18:53.936	\N	\N
164	Gluten-free cereal	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.939	2025-03-17 01:18:53.939	\N	\N
165	Peanut butter	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.942	2025-03-17 01:18:53.942	\N	\N
166	Jelly	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.944	2025-03-17 01:18:53.944	\N	\N
167	Butter	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.947	2025-03-17 01:18:53.947	\N	\N
168	Potato chips	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.949	2025-03-17 01:18:53.949	\N	\N
169	Nachos	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.951	2025-03-17 01:18:53.951	\N	\N
172	Instant decaf coffee	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.958	2025-03-17 01:18:53.958	\N	\N
173	Bru	instant coffee please	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.96	2025-03-17 01:18:53.96	\N	\N
174	Tea packets	(black, green, non-caffeinated)	7	\N	37	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.963	2025-03-17 01:18:53.963	\N	\N
176	Biscuits	\N	7	\N	34	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.967	2025-03-17 01:18:53.967	\N	\N
177	Dates	\N	7	\N	24	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.969	2025-03-17 01:18:53.969	\N	\N
183	Mexican hot sauce	spicy salsa or hot sauce	7	\N	15	t	DRY_STORAGE	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.981	2025-03-17 01:18:53.981	\N	\N
170	Shredded Parmesan	\N	7	\N	3	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.953	2025-03-17 01:18:53.953	\N	\N
171	Rotis	\N	7	\N	34	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.955	2025-03-17 01:18:53.955	\N	\N
178	Kaju Katli	\N	7	\N	34	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.97	2025-03-17 01:18:53.97	\N	\N
179	Motichoor Laddu	\N	7	\N	34	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.972	2025-03-17 01:18:53.972	\N	\N
180	Balsamic glaze	https://www.webstaurantstore.com/colavita-32-oz-original-balsamic-glace/999COLAV336.html	7	\N	15	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.974	2025-03-17 01:18:53.974	\N	\N
181	Maple syrup	\N	7	\N	15	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.977	2025-03-17 01:18:53.977	\N	\N
182	Salad dressing (vegan)	balsamic or italian dressing	7	\N	15	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.979	2025-03-17 01:18:53.979	\N	\N
184	Corn Tortilla	https://www.costcobusinessdelivery.com/guerrero-6-corn-tortillas%2C-100-ct.product.11334407.html	7	\N	34	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.983	2025-03-17 01:18:53.983	\N	\N
185	Naan	frozen from indian store or costco	7	\N	34	t	REFRIGERATED	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.985	2025-03-17 01:18:53.985	\N	\N
187	Oranges	\N	8	24	24	t	FROZEN	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:35:53.882	2025-03-17 01:35:53.882	\N	\N
188	Fuji Apple	\N	8	\N	24	t	FROZEN	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:35:53.886	2025-03-17 01:35:53.886	\N	\N
189	Avocado	medium; if large take 75%	8	\N	34	t	FROZEN	30	Store in the freezer	\N	\N	\N	\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:35:53.889	2025-03-17 01:35:53.889	\N	\N
56	Black pepper		3	10	3	f	DRY_STORAGE	365	Store in a cool, dark place, away from direct sunlight.				\N	\N	\N	\N	f	f	f	t	f	f	2025-03-17 00:13:21.271	2025-03-18 15:43:36.473	\N	\N
175	Almond milk	Made from almonds	7	\N	15	t	REFRIGERATED	30	Store in the freezer				\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:18:53.965	2025-03-22 23:00:08.739	\N	\N
190	Water	Auto-created from recipe seed	16	\N	20	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-27 04:17:21.545	2025-03-27 04:17:21.545	\N	\N
191	Khakra	Auto-created from recipe seed	16	\N	34	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-27 04:17:21.596	2025-03-27 04:17:21.596	\N	\N
198	black salt	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 16:38:29.267	2025-03-29 16:38:29.267	\N	\N
199	plantain	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 16:38:29.392	2025-03-29 16:38:29.392	\N	\N
200	winter melon	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 16:38:29.395	2025-03-29 16:38:29.395	\N	\N
201	suran	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 16:38:29.401	2025-03-29 16:38:29.401	\N	\N
202	bamboo shoots	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 16:38:29.419	2025-03-29 16:38:29.419	\N	\N
203	salt to taste	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.32	2025-03-29 17:40:06.32	\N	\N
204	black cardamom	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.329	2025-03-29 17:40:06.329	\N	\N
205	baking soda	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.333	2025-03-29 17:40:06.333	\N	\N
206	chole masala	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.347	2025-03-29 17:40:06.347	\N	\N
207	tomato and onion gravy	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.359	2025-03-29 17:40:06.359	\N	\N
208	for gravy	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.362	2025-03-29 17:40:06.362	\N	\N
209	paneer	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.365	2025-03-29 17:40:06.365	\N	\N
210	ajwain	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.38	2025-03-29 17:40:06.38	\N	\N
211	tamarind water	Auto-created from CSV import	16	\N	18	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.386	2025-03-29 17:40:06.386	\N	\N
212	green grapes	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-03-29 17:40:06.399	2025-03-29 17:40:06.399	\N	\N
213	alphonso mango pulp	Auto-created from CSV import	16	\N	20	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.05	2025-04-22 23:35:04.05	\N	\N
214	chia seeds	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.057	2025-04-22 23:35:04.057	\N	\N
215	shredded coconut	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.06	2025-04-22 23:35:04.06	\N	\N
216	blueberries	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.065	2025-04-22 23:35:04.065	\N	\N
217	arbi / taro root	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.284	2025-04-22 23:35:04.284	\N	\N
218	vegetables	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.319	2025-04-22 23:35:04.319	\N	\N
219	strawberries	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.335	2025-04-22 23:35:04.335	\N	\N
220	served alongside:	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.34	2025-04-22 23:35:04.34	\N	\N
221	steps to prepare	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.346	2025-04-22 23:35:04.346	\N	\N
228	to boil chickpeas	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.363	2025-04-22 23:35:04.363	\N	\N
229	spices mixed with a little bit of water:	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.372	2025-04-22 23:35:04.372	\N	\N
230	salad dressing	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.38	2025-04-22 23:35:04.38	\N	\N
231	red radish	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.393	2025-04-22 23:35:04.393	\N	\N
232	dressing:	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.406	2025-04-22 23:35:04.406	\N	\N
233	for tempering	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.411	2025-04-22 23:35:04.411	\N	\N
235	tomatillos	Auto-created from CSV import	16	\N	2	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.428	2025-04-22 23:35:04.428	\N	\N
236	beetroot	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.431	2025-04-22 23:35:04.431	\N	\N
237	nigella seeds	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.536	2025-04-22 23:35:04.536	\N	\N
238	sweet potato	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.551	2025-04-22 23:35:04.551	\N	\N
239	panch phoran	Auto-created from CSV import	16	\N	3	f	ROOM_TEMPERATURE	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	2025-04-22 23:35:04.562	2025-04-22 23:35:04.562	\N	\N
186	Bananas		8	25	24	t	FROZEN	30	Store in the freezer				\N	\N	\N	\N	t	t	f	t	f	f	2025-03-17 01:35:53.871	2025-05-04 00:26:40.197	\N	\N
\.


--
-- Data for Name: IngredientAllergen; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientAllergen" (allergen_id, ingredient_id, allergen_name, created_at, created_by, last_updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: IngredientCategory; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientCategory" (category_id, name, description, store_section, display_order, created_at, updated_at) FROM stdin;
1	Grains & Dry Goods	Rice, beans, flours, and other dry goods	Dry Goods Aisle	1	2025-03-16 15:52:59.505	2025-03-16 15:52:59.505
2	Oil	Cooking oils and plant-based fats	Oil & Vinegar Aisle	2	2025-03-16 15:52:59.509	2025-03-16 15:52:59.509
3	Spices (Dry)	Herbs, spices, and seasonings in Powdered form	Spice Aisle	3	2025-03-16 15:52:59.511	2025-03-16 15:52:59.511
4	Vegetables	Fresh vegetables	Produce Section	4	2025-03-16 15:52:59.512	2025-03-16 15:52:59.512
6	Frozen Vegetables	Frozen vegetables	Produce Section	6	2025-03-16 15:52:59.515	2025-03-16 15:52:59.515
7	Ready to Eat	Items that require no cooking, ready for immediate consumption	Various Sections	7	2025-03-16 15:52:59.516	2025-03-16 15:52:59.516
8	Fruits	Fresh and dried fruits	Produce Section	8	2025-03-16 15:52:59.518	2025-03-16 15:52:59.518
9	Condiments	Sauces, spreads, and condiments	Condiments Aisle	9	2025-03-16 15:52:59.52	2025-03-16 15:52:59.52
10	Beverages	Coffee, tea, drinks and beverage ingredients	Beverage Aisle	10	2025-03-16 15:52:59.522	2025-03-16 15:52:59.522
11	Snacks & Desserts	Vegetarian snacks, sweets, and dessert ingredients	Snack Aisle	11	2025-03-16 15:52:59.523	2025-03-16 15:52:59.523
12	Herbs	Fresh and dried herbs	Produce Section	12	2025-03-16 15:52:59.525	2025-03-16 15:52:59.525
13	Nuts & Seeds	Various nuts and seeds	Dry Goods Aisle	13	2025-03-16 15:52:59.527	2025-03-16 15:52:59.527
5	Dairy	Dairy products and plant-based alternatives	Refrigerated Section	5	2025-03-16 15:52:59.513	2025-03-16 15:52:59.513
16	Uncategorized	\N	\N	999	2025-03-27 00:43:11.59	2025-03-27 00:43:11.59
\.


--
-- Data for Name: IngredientDensity; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientDensity" (density_id, ingredient_id, volume_unit_id, weight_unit_id, conversion_factor, notes, created_at, created_by, last_updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: IngredientDietaryFlag; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientDietaryFlag" (dietary_flag_id, ingredient_id, flag, created_at, created_by, last_updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: IngredientSubcategory; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientSubcategory" (subcategory_id, name, description, category_id, display_order, created_at, updated_at, created_by, last_updated_by) FROM stdin;
1	Rice	Different varieties of rice	1	1	2025-03-16 15:52:59.529	2025-03-16 15:52:59.529	\N	\N
2	Beans & Legumes	Beans, lentils, and other legumes	1	2	2025-03-16 15:52:59.531	2025-03-16 15:52:59.531	\N	\N
3	Flour	Different types of flour	1	3	2025-03-16 15:52:59.532	2025-03-16 15:52:59.532	\N	\N
4	Pasta	Pasta and noodles	1	4	2025-03-16 15:52:59.534	2025-03-16 15:52:59.534	\N	\N
5	Breakfast Cereals	Ready-to-eat cereals	1	7	2025-03-16 15:52:59.535	2025-03-16 15:52:59.535	\N	\N
6	Baking Ingredients	Ingredients used for baking	1	8	2025-03-16 15:52:59.537	2025-03-16 15:52:59.537	\N	\N
7	Vegetable Oils	Oils from plant sources	2	1	2025-03-16 15:52:59.538	2025-03-16 15:52:59.538	\N	\N
8	Nut & Seed Oils	Specialty oils from nuts and seeds	2	2	2025-03-16 15:52:59.539	2025-03-16 15:52:59.539	\N	\N
9	Plant-Based Butters	Vegan butter alternatives	2	3	2025-03-16 15:52:59.541	2025-03-16 15:52:59.541	\N	\N
10	Whole Spices	Unground spices	3	1	2025-03-16 15:52:59.542	2025-03-16 15:52:59.542	\N	\N
11	Ground Spices	Ground spice powders	3	2	2025-03-16 15:52:59.543	2025-03-16 15:52:59.543	\N	\N
12	Spice Blends	Pre-mixed spice combinations	3	4	2025-03-16 15:52:59.545	2025-03-16 15:52:59.545	\N	\N
13	Salt & Pepper	Various salts and peppers	3	5	2025-03-16 15:52:59.546	2025-03-16 15:52:59.546	\N	\N
14	Sweeteners	Sugar and other sweeteners	3	6	2025-03-16 15:52:59.548	2025-03-16 15:52:59.548	\N	\N
15	Leafy Greens	Spinach, kale, lettuce, etc.	4	1	2025-03-16 15:52:59.549	2025-03-16 15:52:59.549	\N	\N
16	Root Vegetables	Potatoes, carrots, beets, etc.	4	2	2025-03-16 15:52:59.551	2025-03-16 15:52:59.551	\N	\N
17	Cruciferous	Broccoli, cauliflower, cabbage, etc.	4	3	2025-03-16 15:52:59.552	2025-03-16 15:52:59.552	\N	\N
18	Alliums	Onions, garlic, leeks, etc.	4	4	2025-03-16 15:52:59.553	2025-03-16 15:52:59.553	\N	\N
19	Squash & Gourds	Pumpkins, zucchini, etc.	4	5	2025-03-16 15:52:59.555	2025-03-16 15:52:59.555	\N	\N
20	Nightshades	Tomatoes, peppers, eggplant, etc.	4	6	2025-03-16 15:52:59.556	2025-03-16 15:52:59.556	\N	\N
21	Canned Vegetables	Preserved vegetables	4	7	2025-03-16 15:52:59.558	2025-03-16 15:52:59.558	\N	\N
22	Mushrooms	All varieties of edible fungi	4	8	2025-03-16 15:52:59.559	2025-03-16 15:52:59.559	\N	\N
23	Berries	Strawberries, blueberries, etc.	8	1	2025-03-16 15:52:59.56	2025-03-16 15:52:59.56	\N	\N
24	Citrus	Oranges, lemons, limes, etc.	8	2	2025-03-16 15:52:59.562	2025-03-16 15:52:59.562	\N	\N
25	Tropical	Bananas, mangoes, pineapples, etc.	8	3	2025-03-16 15:52:59.563	2025-03-16 15:52:59.563	\N	\N
26	Stone Fruits	Peaches, plums, cherries, etc.	8	4	2025-03-16 15:52:59.564	2025-03-16 15:52:59.564	\N	\N
27	Pome Fruits	Apples, pears, etc.	8	5	2025-03-16 15:52:59.566	2025-03-16 15:52:59.566	\N	\N
28	Melons	Watermelon, cantaloupe, etc.	8	6	2025-03-16 15:52:59.567	2025-03-16 15:52:59.567	\N	\N
29	Milk & Plant Milks	Dairy milk and plant-based alternatives	5	1	2025-03-16 15:52:59.568	2025-03-16 15:52:59.568	\N	\N
30	Cheese & Vegan Cheese	Dairy cheese and plant-based alternatives	5	2	2025-03-16 15:52:59.57	2025-03-16 15:52:59.57	\N	\N
31	Yogurt & Fermented	Yogurt and fermented dairy/alternatives	5	3	2025-03-16 15:52:59.571	2025-03-16 15:52:59.571	\N	\N
32	Butter & Alternatives	Butter, ghee, and plant-based alternatives	5	4	2025-03-16 15:52:59.572	2025-03-16 15:52:59.572	\N	\N
33	Eggs & Substitutes	Eggs and egg replacers	5	5	2025-03-16 15:52:59.574	2025-03-16 15:52:59.574	\N	\N
34	Sauces	Various cooking and table sauces	9	1	2025-03-16 15:52:59.576	2025-03-16 15:52:59.576	\N	\N
35	Vinegars	Different types of vinegar	9	2	2025-03-16 15:52:59.577	2025-03-16 15:52:59.577	\N	\N
36	Spreads	Nut butters, jams, etc.	9	3	2025-03-16 15:52:59.579	2025-03-16 15:52:59.579	\N	\N
37	Pickles & Ferments	Pickled and fermented foods	9	4	2025-03-16 15:52:59.58	2025-03-16 15:52:59.58	\N	\N
38	Dressings	Salad dressings and marinades	9	5	2025-03-16 15:52:59.581	2025-03-16 15:52:59.581	\N	\N
39	Coffee	Coffee beans and ground coffee	10	1	2025-03-16 15:52:59.583	2025-03-16 15:52:59.583	\N	\N
40	Tea	Different types of tea	10	2	2025-03-16 15:52:59.584	2025-03-16 15:52:59.584	\N	\N
41	Juices	Fruit and vegetable juices	10	3	2025-03-16 15:52:59.585	2025-03-16 15:52:59.585	\N	\N
42	Plant Milks	Shelf-stable plant-based milks	10	4	2025-03-16 15:52:59.587	2025-03-16 15:52:59.587	\N	\N
43	Other Beverages	Other drink ingredients	10	5	2025-03-16 15:52:59.588	2025-03-16 15:52:59.588	\N	\N
44	Cookies & Crackers	Sweet and savory baked snacks	11	1	2025-03-16 15:52:59.59	2025-03-16 15:52:59.59	\N	\N
45	Chips & Crisps	Potato chips and similar snacks	11	2	2025-03-16 15:52:59.592	2025-03-16 15:52:59.592	\N	\N
46	Nuts & Trail Mixes	Mixed nuts and trail mixes	11	3	2025-03-16 15:52:59.594	2025-03-16 15:52:59.594	\N	\N
47	Energy Bars	Granola and protein bars	11	4	2025-03-16 15:52:59.595	2025-03-16 15:52:59.595	\N	\N
48	Sweets	Vegetarian candies and confections	11	5	2025-03-16 15:52:59.596	2025-03-16 15:52:59.596	\N	\N
49	Dessert Ingredients	Specialty ingredients for desserts	11	6	2025-03-16 15:52:59.598	2025-03-16 15:52:59.598	\N	\N
50	Fresh Fruits	Whole fruits ready for consumption	7	1	2025-03-16 15:52:59.599	2025-03-16 15:52:59.599	\N	\N
51	Cut Vegetables	Pre-cut vegetables and crudités	7	2	2025-03-16 15:52:59.601	2025-03-16 15:52:59.601	\N	\N
52	Dips & Spreads	Ready-to-eat dips and spreads	7	3	2025-03-16 15:52:59.602	2025-03-16 15:52:59.602	\N	\N
53	Packaged Snacks	Pre-packaged snack items	7	4	2025-03-16 15:52:59.603	2025-03-16 15:52:59.603	\N	\N
54	Bread & Crackers	Ready-to-eat bread products	7	5	2025-03-16 15:52:59.605	2025-03-16 15:52:59.605	\N	\N
55	Desserts	Ready-to-eat desserts and sweets	7	6	2025-03-16 15:52:59.606	2025-03-16 15:52:59.606	\N	\N
56	Beverages	Ready-to-drink beverages	7	7	2025-03-16 15:52:59.607	2025-03-16 15:52:59.607	\N	\N
57	Fresh Herbs	Fresh culinary herbs	12	1	2025-03-16 15:52:59.609	2025-03-16 15:52:59.609	\N	\N
58	Dried Herbs	Dried culinary herbs	12	2	2025-03-16 15:52:59.61	2025-03-16 15:52:59.61	\N	\N
59	Tree Nuts	Various tree nuts	13	1	2025-03-16 15:52:59.611	2025-03-16 15:52:59.611	\N	\N
60	Seeds	Edible seeds	13	2	2025-03-16 15:52:59.613	2025-03-16 15:52:59.613	\N	\N
61	Nut & Seed Butters	Spreads made from nuts and seeds	13	3	2025-03-16 15:52:59.614	2025-03-16 15:52:59.614	\N	\N
\.


--
-- Data for Name: IngredientSubstitute; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."IngredientSubstitute" (substitute_id, ingredient_id, substitute_ingredient_id, conversion_ratio, notes, created_at, created_by, last_updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."Menu" (menu_id, name, description, meal_type, created_at, updated_at, created_by, last_updated_by) FROM stdin;
\.


--
-- Data for Name: MenuRecipe; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."MenuRecipe" (menu_recipe_id, menu_id, recipe_id, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."Recipe" (recipe_id, name, description, serving_size, preparation_time_minutes, cooking_time_minutes, total_time_minutes, notes, cooking_method, cooking_equipment, has_onion_garlic, is_gluten_free, is_vegan, course_type, tags, submitted_by, created_at, updated_at, created_by, last_updated_by) FROM stdin;
48	Chole Masala	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	csv	csv
50	Langar wali dal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	csv	csv
51	Cucumber Raita	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	csv	csv
52	Kada Prasad	NA	8	\N	\N	\N	https://ranveerbrar.com/recipes/kada-prasad/	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	csv	csv
53	Aloo french beans sabzi	NA	8	\N	\N	\N	https://www.youtube.com/watch?v=chSO4P_UBV8	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	csv	csv
55	Black Beans	NA	8	\N	\N	\N	https://rainbowplantlife.com/mexican-black-beans/#wprm-recipe-container-26498	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	csv	csv
56	Charred Corn and Tomato Salsa	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	csv	csv
58	Red Onion Sambar	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	csv	csv
59	Purple Cabbage Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	csv	csv
60	Avial	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	csv	csv
61	Mung Dal Payasam	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	csv	csv
62	Thai Green Curry  with Vegetables and Tofu	NA	8	\N	\N	\N	https://hot-thai-kitchen.com/green-curry-new-2/	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	csv	csv
63	Green papaya salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	csv	csv
37	Chai	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.882	2025-03-29 16:05:14.452	csv	csv
38	Rice (Basmati)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.896	2025-03-29 16:05:14.458	csv	csv
39	Jeera Rice	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.9	2025-03-29 16:05:14.461	csv	csv
40	Rice (Ambe Mor)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.904	2025-03-29 16:05:14.464	csv	csv
77	Cucumber Carrot Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	csv	csv
78	Amritsari Chole	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	csv	csv
79	Dal Makhni	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	csv	csv
80	Matar Paneer	NA	8	\N	\N	\N	https://hebbarskitchen.com/matar-paneer-recipe-mutter-dhaba-style/#Recipe_card_for_Matar_Paneer	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	csv	csv
68	Mixed Green Salad with Cilantro Lime dressing	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:40:06.437	2025-03-29 17:52:40.595	csv	csv
81	Black Chana Masala Curry	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	csv	csv
82	Gujarati Dal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	csv	csv
83	Potato Dry Subzi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	csv	csv
84	Cabbage Sambharo (Salad)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	csv	csv
86	Mix Veg Sambar	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	csv	csv
87	Long Beans Thoran	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	csv	csv
41	Rice (Kerala Matta)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.908	2025-03-29 16:05:14.468	csv	csv
42	Rice (Sona  Masoori)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.912	2025-03-29 16:05:14.472	csv	csv
43	Oatmeal with Toppings	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.916	2025-03-29 16:05:14.476	csv	csv
44	Sprouted Moong with Khakra	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.92	2025-03-29 16:05:14.479	csv	csv
45	Jasmine Rice	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 15:28:19.924	2025-03-29 16:05:14.482	csv	csv
57	Guacamole	NA	8	\N	\N	\N		\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.345	2025-04-23 16:57:46.652	csv	csv
88	Green Cabbage Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.676	2025-04-23 16:57:46.66	csv	csv
85	Radish Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 17:52:40.622	2025-04-23 16:57:46.228	csv	csv
49	Carrot Mung Dal Salad	NA	8	\N	\N	\N		\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.304	2025-04-23 16:57:46.356	csv	csv
54	Mexican Rice	NA	8	\N	\N	\N	https://rainbowplantlife.com/mexican-black-beans/#wprm-recipe-container-26498	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-03-29 16:38:29.33	2025-04-23 16:57:46.553	csv	csv
129	Overnight Oats:  Tropical Sunrise (Mango, Coconut & Cashew)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	csv	csv
130	Rajma	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	csv	csv
131	Green Salad with Sesame Ginger Dressing	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	csv	csv
132	Cauliflower potato sabzi (dry)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	csv	csv
133	Panchratna Dal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	csv	csv
134	Dal Tadka	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	csv	csv
135	Aloo, matar, tamatar dry subzi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	csv	csv
136	Yellow Mung Dal Khichdi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	csv	csv
97	Gujarati kadhi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-22 23:35:04.211	2025-04-23 16:57:46.236	csv	csv
137	Cucumber Tomato Carrot Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	csv	csv
138	Drumstick, Plantain & Arbi sambar	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	csv	csv
139	Cabbage Poriyal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	csv	csv
140	Vegetable Pulav	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	csv	csv
141	Cucumber tomato onion raita	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	csv	csv
142	Pink Paradise:  Overnight Oats	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	csv	csv
143	Black chana curry	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	csv	csv
144	Cucumber Tomato Onion Raita	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	csv	csv
145	Aloo Gobi Mutter Sabzi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	csv	csv
146	Mixed dal tadka	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	csv	csv
147	Green salad w/ sesame dressing	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	csv	csv
148	Long beans potato sabzi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	csv	csv
149	Thai Red Curry  with Vegetables and Tofu	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	csv	csv
150	Green cabbage salad (thai)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	csv	csv
151	Parippu (simple toor dal)	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	csv	csv
152	Raw Plantain Poriyal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	csv	csv
153	Chow Chow Raita Recipe	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	csv	csv
154	Tomato Salsa	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	csv	csv
155	Beetroot Thoran	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	csv	csv
156	Plain Mung Dal Khichdi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	csv	csv
157	Leftover Veggies into stir-fry or salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.666	2025-04-23 16:57:46.666	csv	csv
158	Aloo Tamatar Sabzi	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	csv	csv
159	Masoor Dal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	csv	csv
160	Mixed Vegetable	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	csv	csv
161	Tomato Cucumber Romaine Salad	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	csv	csv
162	Coconut Milk Basmati Rice	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	csv	csv
163	Veg Kurma	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	csv	csv
164	Black Channa Sundal	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	csv	csv
165	Sliced Carrots and Cucumber	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	csv	csv
166	Vermicelli Payasam	NA	8	\N	\N	\N	\N	\N	\N	f	f	f	MAIN_COURSE	\N	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	csv	csv
\.


--
-- Data for Name: RecipeIngredient; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."RecipeIngredient" (recipe_ingredient_id, recipe_id, ingredient_id, quantity, unit_id, preparation, is_optional, display_order, notes, scaling_factor, alternate_ingredient_id, created_at, updated_at, created_by, last_updated_by) FROM stdin;
701	77	117	750	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
702	77	112	750	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
703	77	116	0.5	29	\N	f	3	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
704	77	77	2	18	\N	f	4	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
705	77	56	5	3	\N	f	5	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
706	77	123	5	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
707	77	127	5	3	\N	f	7	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
708	77	75	5	3	\N	f	8	\N	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
709	77	203	0	2	\N	f	9	to taste	1	\N	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
710	78	15	3	20	\N	f	1	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
711	78	78	5	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
327	48	15	2.5	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
328	48	13	0.5	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
329	48	144	250	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
330	48	123	25	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
331	48	89	0	3	\N	f	5	to taste	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
332	48	71	0.3	2	\N	f	6	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
333	48	65	0.5	2	\N	f	7	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
334	48	49	1	18	\N	f	8	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
335	48	55	1	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
336	48	74	1	2	\N	f	10	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
337	48	59	3	2	\N	f	11	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
338	48	63	1	2	\N	f	12	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
339	48	68	0.5	2	\N	f	13	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
340	48	76	0.25	2	\N	f	14	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
341	48	77	3	2	\N	f	15	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
342	48	116	0.25	29	\N	f	16	\N	1	\N	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
343	49	112	500	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
344	49	28	0.75	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
345	49	152	68	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
346	49	77	2.5	18	\N	f	4	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
347	49	82	1	2	\N	f	5	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
348	49	42	2	2	\N	f	6	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
349	49	127	5	3	\N	f	7	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
350	49	71	0.25	2	\N	f	8	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
351	49	118	0.5	33	\N	f	9	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
352	49	116	0.5	29	\N	f	10	\N	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
353	49	89	0	3	\N	f	11	to taste	1	\N	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
354	50	44	1.5	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
355	50	13	1	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
356	50	98	1	2	\N	f	3	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
357	50	190	7.5	20	\N	f	4	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
358	50	89	0	3	\N	f	5	to taste	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
359	50	160	3	18	\N	f	6	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
360	50	49	0.5	18	\N	f	7	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
361	50	74	2	2	\N	f	8	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
362	50	71	0.5	2	\N	f	9	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
363	50	98	1	2	\N	f	10	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
364	50	86	1	2	\N	f	11	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
365	50	55	5	3	\N	f	12	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
366	50	123	15	3	\N	f	13	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
367	50	122	10	3	\N	f	14	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
368	50	127	5	3	\N	f	15	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
369	50	133	350	3	\N	f	16	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
370	50	144	150	3	\N	f	17	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
371	50	63	2	2	\N	f	18	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
372	50	116	0.25	29	\N	f	19	\N	1	\N	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
373	51	117	600	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
374	51	147	2	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
375	51	74	2	2	\N	f	3	\N	1	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
376	51	116	0.5	29	\N	f	4	\N	1	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
377	51	89	0	3	\N	f	5	to taste	1	\N	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
378	52	46	1.5	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
379	52	160	1.5	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
380	52	93	1.5	20	\N	f	3	\N	1	\N	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
381	52	190	1.5	20	\N	f	4	\N	1	\N	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
382	53	121	800	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
383	53	134	400	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
384	53	127	5	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
385	53	122	10	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
386	53	123	10	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
387	53	52	4	18	\N	f	6	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
388	53	82	1	2	\N	f	7	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
389	53	74	1	2	\N	f	8	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
390	53	85	1	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
391	53	71	0.5	2	\N	f	10	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
392	53	118	0.1	33	\N	f	11	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
393	53	89	0	3	\N	f	12	to taste	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
394	53	198	1	3	\N	f	13	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
395	53	56	1	2	\N	f	14	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
396	53	98	1	2	\N	f	15	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
251	37	190	5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
252	37	148	2	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
253	37	123	10.7	3	\N	f	3	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
254	37	58	1.6	3	\N	f	4	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
255	37	78	14.9	3	\N	f	5	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
256	37	96	1.6	3	\N	f	6	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
257	37	132	0.01	29	\N	f	7	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
258	37	84	1.6	3	\N	f	8	\N	1	\N	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
259	38	5	2.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
260	38	190	5	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
261	38	89	0	3	\N	f	3	to taste	1	\N	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
262	39	5	2.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
263	39	190	5	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
264	39	49	2	18	\N	f	3	\N	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
265	39	89	0	3	\N	f	4	to taste	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
266	39	74	3	18	\N	f	5	\N	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
267	39	55	5	3	\N	f	6	\N	1	\N	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
268	40	6	2.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
269	40	49	1	2	\N	f	2	\N	1	\N	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
270	40	190	5	20	\N	f	3	\N	1	\N	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
271	40	89	0	3	\N	f	4	to taste	1	\N	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
272	41	24	3.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
273	41	190	8.8	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
274	41	49	1	2	\N	f	3	\N	1	\N	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
275	41	89	0	3	\N	f	4	to taste	1	\N	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
276	42	37	2.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
277	42	190	7.5	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
278	42	89	0	3	\N	f	3	to taste	1	\N	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
712	78	85	5	3	\N	f	3	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
713	78	61	2	3	\N	f	4	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
714	78	204	2	3	\N	f	5	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
715	78	55	2	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
279	43	36	1.5	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
280	43	190	4.5	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
281	43	3	50	3	\N	f	3	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
716	78	205	0.1	3	\N	f	7	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
717	78	52	3	18	\N	f	8	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
718	78	49	3	18	\N	f	9	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
719	78	204	5	3	\N	f	10	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
720	78	85	5	3	\N	f	11	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
721	78	55	5	3	\N	f	12	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
722	78	74	2	2	\N	f	13	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
282	43	31	50	3	\N	f	4	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
283	43	33	50	3	\N	f	5	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
284	43	181	25	1	\N	f	6	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
285	43	160	2	18	\N	f	7	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
286	43	60	20	3	\N	f	8	\N	1	\N	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
287	44	45	2	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
288	44	98	1	2	\N	f	2	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
289	44	48	1	18	\N	f	3	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
290	44	160	2	18	\N	f	4	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
291	44	82	1	2	\N	f	5	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
292	44	74	1	2	\N	f	6	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
293	44	71	0.25	2	\N	f	7	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
294	44	86	0.5	2	\N	f	8	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
295	44	63	1	2	\N	f	9	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
296	44	77	2	18	\N	f	10	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
297	44	116	0.25	29	\N	f	11	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
298	44	191	8	34	\N	f	12	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
299	44	89	0	3	\N	f	13	to taste	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
300	44	190	6	20	\N	f	14	\N	1	\N	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
301	45	23	4	20	\N	f	1	\N	1	\N	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
302	45	190	5.32	20	\N	f	2	\N	1	\N	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
303	45	49	1	2	\N	f	3	\N	1	\N	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
304	45	89	0	3	\N	f	4	to taste	1	\N	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
397	53	68	1	2	\N	f	16	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
398	53	77	2	2	\N	f	17	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
399	53	116	0.5	29	\N	f	18	\N	1	\N	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
400	54	5	2.5	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
401	54	49	3	18	\N	f	2	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
402	54	122	20	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
403	54	133	200	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
404	54	40	6	2	\N	f	5	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
405	54	57	10	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
406	54	153	1	20	\N	f	7	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
407	54	130	10	3	\N	f	8	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
408	54	116	0.1	29	\N	f	9	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
409	54	97	8	3	\N	f	10	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
410	54	190	5	20	\N	f	11	\N	1	\N	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
411	55	8	400	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
412	55	50	5	18	\N	f	2	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
413	55	133	200	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
414	55	122	25	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
415	55	130	10	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
416	55	75	1	2	\N	f	6	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
417	55	81	2.5	2	\N	f	7	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
418	55	101	2	2	\N	f	8	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
419	55	89	0	3	\N	f	9	to taste	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
420	55	56	5	3	\N	f	10	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
421	55	18	500	3	\N	f	11	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
422	55	77	2	18	\N	f	12	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
423	55	116	0.5	29	\N	f	13	\N	1	\N	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
424	56	144	450	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
425	56	130	5	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
426	56	133	100	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
427	56	77	3	18	\N	f	4	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
428	56	89	0	3	\N	f	5	to taste	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
429	56	154	300	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
430	56	50	2	18	\N	f	7	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
431	56	122	1	18	\N	f	8	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
432	56	116	0.5	29	\N	f	9	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
433	56	56	1	2	\N	f	10	\N	1	\N	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
434	57	189	6	34	\N	f	1	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
435	57	133	100	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
436	57	144	200	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
437	57	116	0.25	29	\N	f	4	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
438	57	127	5	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
439	57	122	5	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
440	57	77	3	18	\N	f	7	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
441	57	139	200	3	\N	f	8	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
442	57	106	100	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
443	57	89	0	3	\N	f	10	to taste	1	\N	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
444	58	41	1.75	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
445	58	95	25	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
446	58	98	1	2	\N	f	3	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
447	58	90	3	18	\N	f	4	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
448	58	133	300	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
449	58	144	100	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
450	58	116	0.5	29	\N	f	7	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
451	58	51	2	18	\N	f	8	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
452	58	79	0.5	2	\N	f	9	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
453	58	82	1	2	\N	f	10	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
454	58	74	1	2	\N	f	11	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
455	58	71	0.25	2	\N	f	12	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
456	58	85	5	3	\N	f	13	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
457	58	118	0.5	33	\N	f	14	\N	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
458	58	89	0	3	\N	f	15	to taste	1	\N	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
459	59	135	400	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
460	59	152	65	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
461	59	77	2	18	\N	f	3	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
462	59	82	1	2	\N	f	4	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
463	59	42	2	2	\N	f	5	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
464	59	71	0.25	2	\N	f	6	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
465	59	118	0.5	33	\N	f	7	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
466	59	116	1	29	\N	f	8	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
467	59	123	10	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
468	59	127	1	3	\N	f	10	\N	1	\N	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
469	60	131	200	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
470	60	119	200	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
471	60	199	200	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
472	60	200	200	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
473	60	134	200	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
474	60	201	200	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
475	60	152	120	3	\N	f	7	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
476	60	74	2.5	2	\N	f	8	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
477	60	127	5	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
478	60	190	0	20	\N	f	10	to taste	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
479	60	48	3	18	\N	f	11	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
480	60	82	1	2	\N	f	12	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
481	60	71	0.3	2	\N	f	13	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
482	60	118	0.25	33	\N	f	14	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
483	60	147	2	18	\N	f	15	\N	1	\N	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
484	61	28	1.3	20	\N	f	1	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
485	61	190	5.85	20	\N	f	2	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
486	61	48	4	2	\N	f	3	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
487	61	73	1.43	20	\N	f	4	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
488	61	16	0.52	2	\N	f	5	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
489	61	20	0.2	20	\N	f	6	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
490	61	58	3	2	\N	f	7	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
491	61	12	40	3	\N	f	8	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
492	61	33	40	3	\N	f	9	\N	1	\N	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
493	62	70	5	4	\N	f	1	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
494	62	16	1.5	2	\N	f	2	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
495	62	149	1.5	33	\N	f	3	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
496	62	202	0.5	2	\N	f	4	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
497	62	137	250	3	\N	f	5	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
498	62	109	350	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
499	62	113	400	3	\N	f	7	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
500	62	93	1	18	\N	f	8	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
501	62	116	0.3	29	\N	f	9	\N	1	\N	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
502	63	128	300	3	\N	f	1	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
503	63	125	50	3	\N	f	2	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
504	63	112	25	3	\N	f	3	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
505	63	111	25	3	\N	f	4	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
506	63	94	2	18	\N	f	5	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
507	63	144	25	3	\N	f	6	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
508	63	122	5	3	\N	f	7	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
509	63	127	1	3	\N	f	8	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
510	63	77	1	18	\N	f	9	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
511	63	93	1	18	\N	f	10	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
512	63	89	0	3	\N	f	11	to taste	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
513	63	139	100	3	\N	f	12	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
514	63	91	20	3	\N	f	13	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
515	63	132	0.5	29	\N	f	14	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
516	63	116	0.5	29	\N	f	15	\N	1	\N	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
723	78	123	25	3	\N	f	14	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
724	78	122	20	3	\N	f	15	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
725	78	133	350	3	\N	f	16	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
726	78	98	3	2	\N	f	17	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
727	78	63	6	2	\N	f	18	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
728	78	86	2	2	\N	f	19	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
729	78	144	400	3	\N	f	20	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
730	78	206	3	2	\N	f	21	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
731	78	116	0.5	29	\N	f	22	\N	1	\N	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
732	79	44	1.25	20	\N	f	1	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
733	79	34	0.4	20	\N	f	2	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
734	79	13	0.4	20	\N	f	3	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
735	79	122	5	3	\N	f	4	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
736	79	123	5	3	\N	f	5	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
737	79	127	5	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
738	79	49	2	18	\N	f	7	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
739	79	122	1	2	\N	f	8	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
740	79	74	1	2	\N	f	9	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
741	79	71	0.25	2	\N	f	10	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
742	79	79	0.5	2	\N	f	11	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
743	79	40	1	18	\N	f	12	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
744	79	16	0.15	41	\N	f	13	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
745	79	86	0.5	2	\N	f	14	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
746	79	68	2.5	2	\N	f	15	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
747	79	116	0.5	29	\N	f	16	\N	1	\N	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
748	80	207	1	2	\N	f	1	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
749	80	144	1	24	\N	f	2	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
750	80	133	450	3	\N	f	3	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
751	80	122	5	3	\N	f	4	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
752	80	123	7	3	\N	f	5	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
753	80	12	50	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
754	80	208	1	2	\N	f	7	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
755	80	209	350	3	\N	f	8	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
756	80	49	3	18	\N	f	9	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
757	80	74	1.5	18	\N	f	10	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
758	80	98	1	2	\N	f	11	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
759	80	63	2	2	\N	f	12	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
760	80	86	1	2	\N	f	13	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
761	80	68	1	18	\N	f	14	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
762	80	75	5	2	\N	f	15	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
763	80	153	2.5	20	\N	f	16	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
764	80	76	2	2	\N	f	17	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
765	80	116	0.5	29	\N	f	18	\N	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
766	80	89	0	3	\N	f	19	to taste	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
767	80	190	0	20	\N	f	20	to taste	1	\N	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
768	81	9	350	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
769	81	210	2.5	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
770	81	7	3	18	\N	f	3	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
771	81	71	0.25	2	\N	f	4	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
772	81	98	1	2	\N	f	5	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
773	81	127	4	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
774	81	85	1	2	\N	f	7	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
775	81	75	0.75	2	\N	f	8	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
776	81	63	0.75	2	\N	f	9	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
777	81	73	2	18	\N	f	10	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
778	81	116	1	29	\N	f	11	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
779	81	49	2	18	\N	f	12	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
780	81	118	0.5	33	\N	f	13	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
781	81	211	4	18	\N	f	14	\N	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
782	81	89	0	3	\N	f	15	to taste	1	\N	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
783	82	41	1.5	20	\N	f	1	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
784	82	49	3	18	\N	f	2	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
785	82	74	2	2	\N	f	3	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
786	82	71	0.5	2	\N	f	4	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
787	82	79	1	2	\N	f	5	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
788	82	82	2	2	\N	f	6	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
789	82	98	1.5	2	\N	f	7	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
584	68	139	200	3	\N	f	1	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
585	68	142	200	3	\N	f	2	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
586	68	117	250	3	\N	f	3	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
587	68	38	25	3	\N	f	4	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
588	68	50	2	18	\N	f	5	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
589	68	77	2	18	\N	f	6	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
590	68	181	1	2	\N	f	7	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
591	68	122	5	3	\N	f	8	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
592	68	116	1	29	\N	f	9	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
593	68	75	0.5	2	\N	f	10	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
594	68	56	0.5	2	\N	f	11	\N	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
595	68	89	0	3	\N	f	12	to taste	1	\N	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
790	82	86	1	2	\N	f	8	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
791	82	85	2	3	\N	f	9	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
792	82	61	1	3	\N	f	10	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
793	82	62	1	3	\N	f	11	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
794	82	63	1	18	\N	f	12	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
795	82	75	1	18	\N	f	13	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
796	82	68	1	2	\N	f	14	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
797	82	102	1	2	\N	f	15	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
798	82	144	150	3	\N	f	16	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
799	82	116	0.25	29	\N	f	17	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
800	82	95	5	3	\N	f	18	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
801	82	127	3	3	\N	f	19	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
802	82	123	25	3	\N	f	20	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
803	82	118	0.25	33	\N	f	21	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
804	82	73	0.5	2	\N	f	22	\N	1	\N	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
805	83	134	1	24	\N	f	1	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
806	83	123	75	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
807	83	127	7	3	\N	f	3	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
808	83	116	0.5	29	\N	f	4	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
809	83	118	0.25	33	\N	f	5	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
810	83	49	4	18	\N	f	6	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
811	83	74	2	2	\N	f	7	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
812	83	82	2	2	\N	f	8	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
813	83	71	1	2	\N	f	9	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
814	83	77	1	18	\N	f	10	\N	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
815	83	89	0	3	\N	f	11	to taste	1	\N	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
816	84	111	600	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
817	84	112	100	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
818	84	126	100	3	\N	f	3	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
819	84	77	2	18	\N	f	4	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
820	84	82	1	2	\N	f	5	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
821	84	71	0.25	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
822	84	118	0.5	33	\N	f	7	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
823	84	116	1	29	\N	f	8	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
824	84	144	200	3	\N	f	9	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
825	84	98	1	2	\N	f	10	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
826	84	63	1	2	\N	f	11	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
827	84	68	1	2	\N	f	12	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
828	84	93	1	2	\N	f	13	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
829	84	127	6	3	\N	f	14	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
830	84	212	75	3	\N	f	15	\N	1	\N	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
831	85	136	500	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
832	85	77	6	2	\N	f	2	\N	1	\N	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
833	85	89	0	3	\N	f	3	to taste	1	\N	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
834	85	116	0.5	29	\N	f	4	\N	1	\N	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
835	86	41	1.75	20	\N	f	1	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
836	86	95	25	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
837	86	90	3	18	\N	f	3	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
838	86	98	1	2	\N	f	4	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
839	86	116	0.5	29	\N	f	5	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
840	86	119	150	3	\N	f	6	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
841	86	144	50	3	\N	f	7	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
842	86	133	150	3	\N	f	8	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
843	86	126	150	3	\N	f	9	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
844	86	200	100	3	\N	f	10	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
845	86	51	2	18	\N	f	11	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
846	86	79	0.5	2	\N	f	12	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
847	86	82	1	2	\N	f	13	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
848	86	74	1	2	\N	f	14	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
849	86	71	0.25	2	\N	f	15	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
850	86	85	5	3	\N	f	16	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
851	86	118	0.5	33	\N	f	17	\N	1	\N	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
852	87	131	1000	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
853	87	152	100	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
854	87	82	1.5	2	\N	f	3	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
855	87	42	2	2	\N	f	4	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
856	87	48	2	18	\N	f	5	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
1637	129	36	2	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1638	129	3	80	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1639	129	190	3	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1640	129	213	1	20	\N	f	4	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1641	129	214	35	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1642	129	215	20	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1643	129	58	0.5	2	\N	f	7	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1644	129	12	20	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1645	129	216	200	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1646	129	181	25	1	\N	f	10	\N	1	\N	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1647	130	34	2	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1648	130	74	2	2	\N	f	2	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1649	130	49	2	18	\N	f	3	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1650	130	123	10	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1651	130	122	10	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1652	130	133	450	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1653	130	144	500	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1654	130	98	2	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1655	130	86	1	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1656	130	63	2	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1657	130	68	2	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1658	130	116	0.25	29	\N	f	12	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1659	130	123	10	3	\N	f	13	\N	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1660	130	203	0	2	\N	f	14	to taste	1	\N	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1661	131	144	100	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1662	131	117	100	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1663	131	126	100	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
857	87	74	2	2	\N	f	6	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
858	87	85	10	3	\N	f	7	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
859	87	71	0.5	2	\N	f	8	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
860	87	118	0.25	33	\N	f	9	\N	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
861	87	89	0	3	\N	f	10	to taste	1	\N	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
862	88	111	450	3	\N	f	1	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
863	88	133	100	3	\N	f	2	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
864	88	116	0.25	29	\N	f	3	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
865	88	152	35	3	\N	f	4	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
866	88	82	1	2	\N	f	5	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
867	88	74	1	2	\N	f	6	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
868	88	71	0.5	2	\N	f	7	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
869	88	89	0	3	\N	f	8	to taste	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
870	88	77	1	18	\N	f	9	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
871	88	56	5	3	\N	f	10	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
872	88	48	1	18	\N	f	11	\N	1	\N	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
1664	131	38	50	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1665	131	139	200	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1666	131	142	200	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1667	131	135	100	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1668	131	91	5	18	\N	f	8	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1669	131	100	4	18	\N	f	9	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1670	131	94	2	18	\N	f	10	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1671	131	123	10	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1672	131	181	2	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1673	131	56	1	18	\N	f	13	\N	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1674	131	203	0	2	\N	f	14	to taste	1	\N	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1675	132	113	1	24	\N	f	1	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1676	132	134	500	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1677	132	144	300	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1678	132	127	7	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1679	132	123	25	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1680	132	116	0.5	29	\N	f	6	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1681	132	133	200	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1682	132	49	75	1	\N	f	8	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1683	132	74	2	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1684	132	86	0.5	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1685	132	98	1	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1686	132	63	3	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1687	132	75	3	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1688	132	68	2	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1689	132	203	0	2	\N	f	15	to taste	1	\N	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1690	133	28	1	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1691	133	41	1	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1692	133	42	0.2	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1693	133	13	0.2	20	\N	f	4	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1694	133	26	0.6	20	\N	f	5	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1695	133	133	250	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1696	133	144	300	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1697	133	123	2	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1698	133	127	10	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1699	133	85	5	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1700	133	74	1	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1701	133	55	1	3	\N	f	12	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1702	133	86	1	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1703	133	98	1	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1704	133	68	0.5	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1705	133	49	4	18	\N	f	16	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1706	133	68	1	2	\N	f	17	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1707	133	77	2	2	\N	f	18	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1708	133	117	300	3	\N	f	19	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1709	133	112	300	3	\N	f	20	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1710	133	56	5	3	\N	f	21	\N	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1711	133	203	0	2	\N	f	22	to taste	1	\N	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1712	134	41	2.5	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1713	134	49	1	18	\N	f	2	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1714	134	160	2	18	\N	f	3	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1715	134	74	2	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1716	134	71	0.5	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1717	134	98	1.5	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1718	134	85	2	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1719	134	116	0.25	29	\N	f	8	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1720	134	77	1	18	\N	f	9	\N	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1721	134	203	0	2	\N	f	10	to taste	1	\N	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1722	135	49	4	18	\N	f	1	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1723	135	71	0.5	2	\N	f	2	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1724	135	74	1.5	2	\N	f	3	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1725	135	127	2	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1726	135	134	1.2	24	\N	f	5	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1727	135	89	0	3	\N	f	6	to taste	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1728	135	63	1	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1729	135	86	0.5	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1730	135	153	1	20	\N	f	9	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1731	135	144	100	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1732	135	75	0.5	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1733	136	6	1.5	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1734	136	28	1.5	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1735	136	190	12	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1736	136	123	8	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1737	136	127	2	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1738	136	62	4	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1739	136	61	4	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1740	136	82	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1741	136	74	2	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1742	136	71	1	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1743	136	85	2	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1744	136	98	1	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1745	136	86	1	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1746	136	63	2	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1747	136	75	1	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1748	136	49	2	18	\N	f	16	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1749	136	77	2	18	\N	f	17	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1750	136	141	0.5	29	\N	f	18	\N	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1751	136	89	0	3	\N	f	19	to taste	1	\N	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1752	137	117	300	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1753	137	144	200	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1754	137	112	200	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1755	137	133	55	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1756	137	116	0.25	29	\N	f	5	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1757	137	75	1	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1758	137	89	0	3	\N	f	7	to taste	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1759	137	77	2	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1760	138	41	1.75	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1761	138	95	40	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1762	138	90	3	18	\N	f	3	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1763	138	98	1	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1764	138	86	1	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1765	138	116	0.5	29	\N	f	6	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1766	138	119	225	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1767	138	199	225	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1768	138	217	75	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1769	138	144	75	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1770	138	51	2	18	\N	f	11	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1771	138	79	0.5	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1772	138	82	1	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1773	138	42	1	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1774	138	74	1	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1775	138	71	0.25	2	\N	f	16	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1776	138	85	5	3	\N	f	17	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1777	138	118	0.5	33	\N	f	18	\N	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1778	138	89	0	3	\N	f	19	to taste	1	\N	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
988	97	147	3	20	\N	f	1	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
989	97	7	0.5	20	\N	f	2	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
990	97	123	20	3	\N	f	3	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
991	97	116	0.5	29	\N	f	4	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
992	97	127	3	3	\N	f	5	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
993	97	160	55	1	\N	f	6	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
994	97	74	2	2	\N	f	7	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
995	97	71	0.5	2	\N	f	8	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
996	97	79	1	2	\N	f	9	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
997	97	61	3	3	\N	f	10	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
998	97	62	1	3	\N	f	11	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
999	97	118	0.5	33	\N	f	12	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1000	97	85	3	3	\N	f	13	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1001	97	89	0	3	\N	f	14	to taste	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1002	97	93	3	2	\N	f	15	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1003	97	190	9	20	\N	f	16	\N	1	\N	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1779	139	111	750	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1780	139	48	4	2	\N	f	2	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1781	139	82	1.5	2	\N	f	3	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1782	139	42	2	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1783	139	13	2	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1784	139	118	0.3	33	\N	f	6	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1785	139	71	0.25	2	\N	f	7	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1786	139	98	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1787	139	89	0	3	\N	f	9	to taste	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1788	139	77	1	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1789	139	152	100	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1790	139	85	5	3	\N	f	12	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1791	139	74	2	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1792	140	5	4	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1793	140	190	4	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1794	140	89	0	3	\N	f	3	to taste	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1795	140	88	1	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1796	140	49	6	18	\N	f	5	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1797	140	16	2	41	\N	f	6	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1798	140	61	3	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1799	140	55	6	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1800	140	58	6	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1801	140	62	3	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1802	140	127	6	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1803	140	218	1	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1804	140	123	25	3	\N	f	13	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1805	140	122	25	3	\N	f	14	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1806	140	113	150	3	\N	f	15	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1807	140	153	0.75	20	\N	f	16	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1808	140	121	100	3	\N	f	17	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1809	140	133	200	3	\N	f	18	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1810	140	144	100	3	\N	f	19	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1811	140	116	1	29	\N	f	20	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1812	140	132	1	29	\N	f	21	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1813	140	76	1	18	\N	f	22	\N	1	\N	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1814	141	117	250	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1815	141	144	250	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1816	141	133	50	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1817	141	116	0.2	29	\N	f	4	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1818	141	75	1	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1819	141	89	0	3	\N	f	6	to taste	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1820	141	147	2	20	\N	f	7	\N	1	\N	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1821	142	36	2	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1822	142	3	100	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1823	142	190	4	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1824	142	219	150	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1825	142	214	15	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1826	142	181	4	18	\N	f	6	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1827	142	220	1	2	\N	f	7	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1828	142	216	200	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1829	142	181	25	1	\N	f	9	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1830	142	12	50	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1831	142	221	1	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.37	2025-04-23 16:57:46.37	\N	\N
1838	143	228	1	2	\N	f	1	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1839	143	9	400	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1840	143	133	100	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1841	143	122	5	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1842	143	123	5	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1843	143	127	3	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1844	143	144	250	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1845	143	98	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1846	143	86	2	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1847	143	75	2	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1848	143	63	2	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1849	143	190	1	20	\N	f	12	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1850	143	160	2	18	\N	f	13	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1851	143	71	0.25	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1852	143	68	1	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1853	143	76	2	2	\N	f	16	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1854	143	116	0.5	29	\N	f	17	\N	1	\N	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1855	144	117	250	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1856	144	144	250	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1857	144	133	50	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1858	144	116	0.2	29	\N	f	4	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1859	144	75	1	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1860	144	89	0	3	\N	f	6	to taste	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1861	144	147	2	20	\N	f	7	\N	1	\N	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1862	145	113	0.75	24	\N	f	1	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1863	145	134	400	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1864	145	144	150	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1865	145	153	1	20	\N	f	4	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1866	145	127	5	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1867	145	123	15	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1868	145	122	10	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1869	145	116	0.5	29	\N	f	8	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1870	145	77	2	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1871	145	49	75	1	\N	f	10	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1872	145	74	2	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1873	145	89	0	3	\N	f	12	to taste	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1874	145	229	1	2	\N	f	13	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1875	145	98	2	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1876	145	86	2	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1877	145	71	0.5	2	\N	f	16	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1878	145	75	2	2	\N	f	17	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1879	145	63	4	18	\N	f	18	\N	1	\N	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1880	146	28	1	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1881	146	41	1	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1882	146	42	0.2	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1883	146	13	0.2	20	\N	f	4	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1884	146	26	0.6	20	\N	f	5	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1885	146	133	200	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1886	146	144	250	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1887	146	123	2	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1888	146	122	10	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1889	146	127	10	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1890	146	85	5	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1891	146	74	1	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1892	146	55	1	3	\N	f	13	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1893	146	86	1	2	\N	f	14	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1894	146	98	1	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1895	146	68	0.5	2	\N	f	16	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1896	146	49	4	18	\N	f	17	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1897	146	63	4	2	\N	f	18	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1898	146	76	2	2	\N	f	19	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1899	146	77	2	2	\N	f	20	\N	1	\N	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1900	147	135	100	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1901	147	142	200	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1902	147	139	200	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1903	147	112	100	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1904	147	117	100	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1905	147	230	1	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1906	147	123	2	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1907	147	188	50	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1908	147	99	1.5	18	\N	f	9	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1909	147	100	1.5	18	\N	f	10	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1910	147	93	1	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1911	147	91	25	3	\N	f	12	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1912	147	50	2	18	\N	f	13	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1913	147	56	5	3	\N	f	14	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1914	147	89	0	3	\N	f	15	to taste	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1915	147	41	2.5	20	\N	f	16	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1916	147	49	3	18	\N	f	17	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1917	147	74	2	2	\N	f	18	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1918	147	71	0.5	2	\N	f	19	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1919	147	79	1	2	\N	f	20	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1920	147	82	2	2	\N	f	21	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1921	147	98	1.5	2	\N	f	22	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1922	147	86	1	2	\N	f	23	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1923	147	85	2	3	\N	f	24	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1924	147	61	1	3	\N	f	25	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1925	147	62	1	3	\N	f	26	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1926	147	63	1	18	\N	f	27	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1927	147	75	1	18	\N	f	28	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1928	147	68	1	2	\N	f	29	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1929	147	102	1	2	\N	f	30	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1930	147	144	150	3	\N	f	31	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1931	147	116	0.25	29	\N	f	32	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1932	147	95	5	3	\N	f	33	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1933	147	127	1	18	\N	f	34	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1934	147	123	2	18	\N	f	35	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1935	147	118	0.25	33	\N	f	36	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1936	147	73	1	2	\N	f	37	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1937	147	117	400	3	\N	f	38	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1938	147	231	400	3	\N	f	39	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1939	147	56	2	2	\N	f	40	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1940	147	77	2	2	\N	f	41	\N	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1941	147	89	0	3	\N	f	42	to taste	1	\N	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1942	148	131	1000	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1943	148	134	250	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1944	148	49	3	18	\N	f	3	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1945	148	82	1	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1946	148	71	0.5	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1947	148	98	1	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1948	148	86	1	2	\N	f	7	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1949	148	63	4	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1950	148	75	1	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1951	148	116	0.25	29	\N	f	10	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1952	148	77	2	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1953	148	89	0	3	\N	f	12	to taste	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1954	148	190	150	1	\N	f	13	\N	1	\N	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1955	149	87	4	4	\N	f	1	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1956	149	16	1.5	41	\N	f	2	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1957	149	149	1.5	33	\N	f	3	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1958	149	4	0.5	41	\N	f	4	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1959	149	137	250	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1960	149	109	350	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1961	149	113	400	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1962	149	93	1	18	\N	f	8	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1963	149	116	0.25	29	\N	f	9	\N	1	\N	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1964	150	111	350	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1965	150	139	125	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1966	150	132	0.5	29	\N	f	3	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1967	150	116	0.5	29	\N	f	4	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1968	150	91	20	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1969	150	232	1	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1970	150	94	2	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1971	150	122	5	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1972	150	127	1	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1973	150	77	1	18	\N	f	10	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1974	150	93	1	18	\N	f	11	\N	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1975	150	89	0	3	\N	f	12	to taste	1	\N	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1976	151	41	2	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1977	151	98	2	2	\N	f	2	\N	1	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1978	151	71	0.5	2	\N	f	3	\N	1	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1979	151	77	4	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1980	151	89	0	3	\N	f	5	to taste	1	\N	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1981	152	199	750	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1982	152	152	100	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1983	152	133	100	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1984	152	127	5	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1985	152	48	2	18	\N	f	5	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1986	152	13	1	18	\N	f	6	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1987	152	42	1	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1988	152	82	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1989	152	74	1	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1990	152	71	0.5	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1991	152	85	2	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1992	152	77	1	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1993	152	118	0.3	33	\N	f	13	\N	1	\N	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1994	153	115	500	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1995	153	147	2	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1996	153	127	2	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1997	153	89	0	3	\N	f	4	to taste	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1998	153	116	0.25	29	\N	f	5	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1999	153	233	1	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2000	153	49	1	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2001	153	42	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2002	153	82	0.5	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2003	153	74	0.5	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2004	153	71	0.25	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2005	153	118	0.2	33	\N	f	12	\N	1	\N	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
2006	154	144	450	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2007	154	130	5	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2008	154	133	100	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2009	154	77	3	18	\N	f	4	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2010	154	89	0	3	\N	f	5	to taste	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2011	154	122	0.5	18	\N	f	6	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2012	154	116	0.2	29	\N	f	7	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2013	154	56	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2014	154	81	1	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
2015	155	236	1000	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2016	155	133	100	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2017	155	152	100	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2018	155	127	5	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2019	155	118	0.3	33	\N	f	5	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2020	155	74	2	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2021	155	48	2	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2022	155	82	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2023	155	98	0.5	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2024	155	89	0	3	\N	f	10	to taste	1	\N	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
2025	156	6	1.5	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2026	156	28	1.5	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2027	156	190	9	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2028	156	98	1	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2029	156	56	1	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2030	156	89	0	3	\N	f	6	to taste	1	\N	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
2031	159	52	3	18	\N	f	1	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2032	159	237	1	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2033	159	85	2	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2034	159	127	1	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2035	159	55	1	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2036	159	98	0.5	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2037	159	26	2	20	\N	f	7	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2038	159	89	0	3	\N	f	8	to taste	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2039	159	190	10	20	\N	f	9	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2040	159	116	0.5	29	\N	f	10	\N	1	\N	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
2041	160	134	225	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2042	160	238	100	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2043	160	138	225	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2044	160	113	225	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2045	160	131	100	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2046	160	111	150	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2047	160	120	100	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2048	160	52	3	18	\N	f	8	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2049	160	85	0.5	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2050	160	55	0.25	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2051	160	127	0.5	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2052	160	98	0.5	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2053	160	93	1	18	\N	f	13	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2054	160	239	10	3	\N	f	14	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2055	160	68	2	2	\N	f	15	\N	1	\N	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
2056	161	139	750	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2057	161	117	700	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2058	161	144	500	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2059	161	116	0.5	29	\N	f	4	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2060	161	56	2	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2061	161	77	4	18	\N	f	6	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2062	161	50	3	18	\N	f	7	\N	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2063	161	89	0	3	\N	f	8	to taste	1	\N	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
2064	162	49	4	18	\N	f	1	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2065	162	56	4	2	\N	f	2	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2066	162	58	1	2	\N	f	3	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2067	162	62	2	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2068	162	55	0.25	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2069	162	66	4	2	\N	f	6	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2070	162	61	5	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2071	162	127	5	3	\N	f	8	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2072	162	123	2	2	\N	f	9	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2073	162	122	2	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2074	162	133	750	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2075	162	112	300	3	\N	f	12	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2076	162	153	1	20	\N	f	13	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2077	162	132	0.25	29	\N	f	14	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2078	162	16	2	41	\N	f	15	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2079	162	5	4	20	\N	f	16	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2080	162	116	0.5	29	\N	f	17	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2081	162	89	0	3	\N	f	18	to taste	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2082	162	190	1	20	\N	f	19	\N	1	\N	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
2083	163	152	100	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2084	163	12	25	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2085	163	66	10	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2086	163	127	5	3	\N	f	4	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2087	163	55	0.25	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2088	163	74	5	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2089	163	58	1	2	\N	f	7	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2090	163	62	1	2	\N	f	8	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2091	163	49	2	18	\N	f	9	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2092	163	133	100	3	\N	f	10	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2093	163	123	5	3	\N	f	11	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2094	163	122	5	3	\N	f	12	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2095	163	144	300	3	\N	f	13	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2096	163	112	250	3	\N	f	14	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2097	163	134	200	3	\N	f	15	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2098	163	113	250	3	\N	f	16	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2099	163	153	1.5	20	\N	f	17	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2100	163	116	0.5	29	\N	f	18	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2101	163	89	0	3	\N	f	19	to taste	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2102	163	190	1	20	\N	f	20	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2103	163	98	1	2	\N	f	21	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2104	163	86	1	2	\N	f	22	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2105	163	68	2	2	\N	f	23	\N	1	\N	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
2106	164	9	400	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2107	164	152	175	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2108	164	82	5	3	\N	f	3	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2109	164	42	1	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2110	164	74	5	3	\N	f	5	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2111	164	118	0.25	33	\N	f	6	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2112	164	116	0.5	29	\N	f	7	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2113	164	49	2	18	\N	f	8	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2114	164	127	5	3	\N	f	9	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2115	164	75	2	2	\N	f	10	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2116	164	63	2	2	\N	f	11	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2117	164	71	0.5	2	\N	f	12	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2118	164	190	6	20	\N	f	13	\N	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2119	164	89	0	3	\N	f	14	to taste	1	\N	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
2120	165	112	500	3	\N	f	1	\N	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2121	165	117	500	3	\N	f	2	\N	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2122	165	77	2	18	\N	f	3	\N	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2123	165	56	2	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2124	165	116	0.25	29	\N	f	5	\N	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2125	165	89	0	3	\N	f	6	to taste	1	\N	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
2126	166	43	1.2	20	\N	f	1	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2127	166	148	6.5	20	\N	f	2	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2128	166	93	0.5	20	\N	f	3	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2129	166	160	2	2	\N	f	4	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2130	166	58	2	2	\N	f	5	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2131	166	12	20	3	\N	f	6	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
2132	166	88	0.25	3	\N	f	7	\N	1	\N	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
\.


--
-- Data for Name: RecipeStep; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."RecipeStep" (recipe_step_id, recipe_id, step_number, instruction, estimated_time_minutes, is_optional, created_at, updated_at, created_by, last_updated_by) FROM stdin;
563	77	1	Dice carrots and cucumbers into inch cubes	\N	f	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
564	77	2	Chop cilantro finely	\N	f	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
565	77	3	Mix carrots, cucumbers, cilantro,  and mix well.	\N	f	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
566	77	4	Add lime juice, salt, black pepper, jeera powder just before serving	\N	f	2025-03-29 17:52:40.559	2025-03-29 17:52:40.559	\N	\N
567	78	1	Important prep:  Rinse the chickpeas.  Add enough water and a little bit of baking soda.  Let it soak for at least 8-9 hours	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
568	78	2	Rinse the chikpeas before starting to cook.  Add fresh water to the chickpeas in a pot and salt to taste	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
569	78	3	Make a potli of tea leaves, red chillies, cinnamon stick, cardamom and bay leaves and add it to the chickpeas and start to cook the chickpeas	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
340	49	1	Remove the frozen grated coconut from the freezer and let it thaw completely	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
341	49	2	Soak the mung dal for 1 hr and then drain the excess water keep aside in a large mixing bowl	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
342	49	3	Grate the carrots in the food processor and mix with the soaked dal	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
343	49	4	Squeeze the lemon juice and keep aside	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
344	49	5	Clean and finely chop cilantro.  Finely chop green chillies and curry leaves and keep aside	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
345	49	6	Heat oil add mustard seeds once they sputter add urad dal hing .  When ulad dal is golden add curry leaves and green chillies	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
346	49	7	Add the coconut salt lemon juice cilantro.   Toss and mix evenly and serve	\N	f	2025-03-29 16:38:29.304	2025-03-29 16:38:29.304	\N	\N
347	50	1	Important prep:  Wash and soak urad dal and chana dal for 4 hours preferably overnight	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
348	50	2	Boil : Add soaked urad and chana dal water turmeric salt to taste and cook in a large pot until soft	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
349	50	3	Alternatively you can pressure cook the dal - once cooker is at pressure let it cook for 20 minutes on low flame	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
350	50	4	Mash the dal with the back of a spatulla or ladle	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
351	50	5	Grate the onions in the food processor; make a puree of the tomatoes in the food processor	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
352	50	6	Grind ginger garlic and green chillies into a coarse paste.  Finely chop the cilantro	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
353	50	7	Regular Tempering:  For 90% of the dal make the following tempering with ghee	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
354	50	8	Heat ghee in a pot and when hot add bay leaves cumin and let sizzle.  Add hing	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
355	50	9	Add ginger garlic and chilli and saute a few mins till fragrant	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
356	50	10	Add onion and saute till golden brown. Add turmeric red chilly powder coriander powder and saute for a few seconds	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
357	50	11	Add tomateos and saute till the ghee begins to separate.	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
358	50	12	Transfer the tempering into the cooked dal mix boil for 10 mins garnish with chopped cilantro	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
359	50	13	Vegan Tempering:  make the same tempering as the regular version but use oil instead of ghee (for about 10% of the dal)	\N	f	2025-03-29 16:38:29.309	2025-03-29 16:38:29.309	\N	\N
360	51	1	Wash the cucumbers and pat dry.  Grate the cucumbers in the food processor with thick blade.  No need to peel them if we get persian cucumbers	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
361	51	2	These persian cucumbers have thin skins so no need to peel.  Once grated leave them aside - dont mix with yogurt	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
362	51	3	Roast the cumin and lightly powder it	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
363	51	4	For vegans please keep about 20% of the grated cucumbers aside.  just before serving add salt and roasted cumin powder and a dash of olive oil and mix	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
364	51	5	For the regular portion:  Whisk the yogurt and add roasted cumin powder and salt and keep aside.	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
365	51	6	Just before serving add the cucumber to the yogurt and mix well.	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
366	51	7	Garnish with cilantro and serve	\N	f	2025-03-29 16:38:29.315	2025-03-29 16:38:29.315	\N	\N
367	52	1	Melt the ghee in a kadai/wok.  Note that ghee and sugar are 1-1 and flour and water are 1-1 in volume but not in weight.	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
368	52	2	Please follow the weights as listed in the recipe above	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
369	52	3	Add wheat flour and cook till dark golden and aromatic on low flame.  Add water and mix well and keep stirring so lumps arent formed	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
370	52	4	Remember that since you will cook a large quantity add the water before reaching the final desired color as the residual heat will continue	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
371	52	5	Add sugar and mix properly.  Cook till everything comes together and Prasad starts leaving ghee	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
372	52	6	to bring additional color.  Watch the recipe below..	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
373	52	7	Serve warm	\N	f	2025-03-29 16:38:29.319	2025-03-29 16:38:29.319	\N	\N
374	53	1	Wash the beans & pat them dry then cut the tops and the bottom slightly & chop them into 1-2 cm pieces	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
375	53	2	Cut the peeled potatoes into small cubes.  Make a coarse past of ginger garlic & green chillies (okay to skip garlic if you'd like)	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
376	53	3	Set a pot over high flame add the mustard oil.  Let it heat up until it reaches its smoking point.  Then lower the flame & let the oil cool down slightly.	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
377	53	4	Add mustard & cumin seeds red chilli asafoetida curry leaves & the ginger garlic paste stir well & cook briefly	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
378	53	5	Next add the diced potatoes stir well & cook over high flame for 1-2 minutes then cover & cook over low flame until the potatoes get 85% cooked	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
379	53	6	Take the lid off & stir the potatoes at intervals for about 6-8 minutes	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
380	53	7	Once the potatoes are 90% cooked add the beans along with salt black salt black pepper & turmeric powder	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
381	53	8	Stir well then cover & cook over low flame for 5-6 minutes or until the beans get cooked.  Dont overcook the beans - the texture of the beans should be slightly crunchy	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
382	53	9	Give it a stir 2-3 times while cooking just to ensure that the potatoes don’t stick to the bottom.	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
244	37	1	Take one  big vessel for the above mentioned quantities. If not, divide it into two small pots.	\N	f	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
245	37	2	Boil water with ginger, chai masala and mint leaves. Let it boil for good 10 minutes. Then add chai patti and let it boil for 5 minutes.	\N	f	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
246	37	3	Add Milk and just before it comes to boil add lemongrass, cardamom powder. Let it all boil together for 10 minutes and it’s ready to serve.	\N	f	2025-03-29 15:28:19.882	2025-03-29 15:28:19.882	\N	\N
247	38	0	Rice cooker  (can make 5kg raw rice in one go)	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
248	38	1	Wash the rice 3-4 times and soak it in measured fresh water for 1 hour in the rice cooker	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
249	38	2	Set the rice cooker to cook 1.5 hours before you need to serve the rice	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
250	38	3	takes approx 1 hour to cook the rice, so time according to when it needs to be served	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
251	38	4	Open pot cooking (for the remaining quantity)	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
252	38	5	Plan this 2.5 hours before meal time	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
253	38	6	Soak rice in a pot for an hour with the measured quantity of water (usually 2x)	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
254	38	7	Start cooking the rice approx 1.5 hours before you need to serve it	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
255	38	8	let the rice cook uncovered.  Once most of the water is absorbed, close the lid and lower the flame	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
256	38	9	Cook exactly for 15 minutes (set a timer).  At the end of 15 minutes switch off the flame.  Do not open the lid	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
257	38	10	Let it sit for 30 min before you open and turn the rice for serving	\N	f	2025-03-29 15:28:19.896	2025-03-29 15:28:19.896	\N	\N
258	39	1	Open Pot Method	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
259	39	2	Wash the basmati rice and drain.  Do not let it sit for long as the grain will break when you saute it.	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
260	39	3	Heat oil in a pot.  Add jeera and bay leaf and saute.  Add the washed basmati rice to it and salt.  Mix properly and saute for 4-5 minutes	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
261	39	4	Add 2x water and mix.  Bring the mixture to a boil.  Lower the heat and let it cook on medium-low heat until the surface water is absorbed	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
262	39	5	Cover the pot with a lid, reduce heat to low and let it cook for 15 minutes (Set a timer).  Switch off the flame and let it sit for another 15 minutes.	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
263	39	6	Open when ready to serve.  Overall this will take about 1.5 hours to cook	\N	f	2025-03-29 15:28:19.9	2025-03-29 15:28:19.9	\N	\N
264	40	1	in Rice cooker (can make 5kg rice in one go)	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
265	40	2	Plan this 2.5 hours before meal time	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
266	40	3	Soak rice in a pot for an hour with the measured quantity of water (usually 2x)	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
267	40	4	Add salt and oil to the soaked rice and start cooking the rice approx 1.5 hours before you need to serve it	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
268	40	5	let the rice cook uncovered.  Once most of the water is absorbed, close the lid and lower the flame	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
269	40	6	Cook exactly for 15 minutes (set a timer).  At the end of 15 minutes switch off the flame.  Do not open the lid	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
270	40	7	Let it sit for 30 min before you open and turn the rice for serving	\N	f	2025-03-29 15:28:19.904	2025-03-29 15:28:19.904	\N	\N
271	41	1	assume we need 2.5x water to rice.  please check to see if we need to add a bit more water depending on age of rice	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
570	78	4	Cook until the chole are nice and soft.  Okay to pressure cook or open pot if the quantity is large	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
571	78	5	For the gravy:	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
572	78	6	Finely chop the onions; puree the tomatoes and crush the ginger and garlic	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
573	78	7	In a pot heat the two oils and when hot add black cardamom, red chillies, bay leaves.  Add jeera and let it splutter	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
574	78	8	Add the ginger garlic paste and the chopped onions.  Saute until the onions are golden brown	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
575	78	9	Add turmeric powder, coriander powder and red chilly powder.  Add salt to taste and mix well	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
576	78	10	add tomato puree and cook until they turn soft and oil starts to separate	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
383	53	10	Once cooked add garam masala lemon juice & fresh cilantro and mix everything properly	\N	f	2025-03-29 16:38:29.323	2025-03-29 16:38:29.323	\N	\N
384	54	1	Rinse the rice 2-3 times until the water runs clear. Set aside.	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
385	54	2	In a large saucepan over medium-high heat add the oil. Once hot add the rice and stir to combine	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
386	54	3	Cook over medium heat stirring frequently until the rice is lightly roasted all over (about 10 minutes).	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
387	54	4	Add tomato paste garlic and diced onion to the pan and saute for 3-4 minutes.   Add bouillion salt peas jalapeno and Tone's cilantro lime mix	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
388	54	5	Add water (1.25x of the rice).  Bring to a boil then cover reduce heat to low and cook for about 20 minutes or until the water is completely absorbed.	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
389	54	6	Remove from heat and allow to rest for 5 minutes before fluffing with a fork.	\N	f	2025-03-29 16:38:29.33	2025-03-29 16:38:29.33	\N	\N
390	55	1	Soak black beans overnight and add a bit of salt and baking soda to the soaking solution.  Drain in the morning and wash once	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
391	55	2	Pressure cook the beans with bay leaves.  Once the pressure cook has its first whistle lower the flame to minimum and cook the beans for 45 minutes	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
392	55	3	Let the pressure drop normally.  Open the cooker and discard the bay leaves and take out extra liquid and store on the side	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
393	55	4	Heat a large sauté pan over medium heat with half the oil.  Once hot add the onion with a pinch of salt and cook until the onion has softened and is golden	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
394	55	5	Add the garlic jalapeño cumin powder mexican oregano and paprika.  Cook for 1 to 2 minutes stirring frequently.	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
395	55	6	Add the tomatoes and let it cook until the tomatoes are cooked properly and the liquid evaporates.  Add black pepper at this stage.	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
577	78	11	Add cooked chickpeas and let the mixture come to a boil	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
272	41	2	Rice cooker  (can make 4kg Red Rice in one go)	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
273	41	3	Wash the rice 3-4 times and soak it in measured fresh water for 3.5 hours in the rice cooker	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
274	41	4	Add 2 tbspp oil and set the rice cooker to cook 1.5 hours before you need to serve it	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
275	41	5	takes approx 1 hour to cook the rice, so time according to when it needs to be served	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
276	41	6	Open pot cooking (for the remaining quantity)	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
277	41	7	Plan this 4 hours before meal time.  Soak rice in a pot for 3.5 hours with the measured quantity of water	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
278	41	8	Start cooking the rice approx 2 hours before you need to serve it.  Add 2 tbspp oil while cooking	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
279	41	9	let the rice cook uncovered.  Once most of the water is absorbed, close the lid and lower the flame.  Cook for 15 minutes and switch off the flame	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
280	41	10	Let it sit for 30 min before you open and turn the rice for serving	\N	f	2025-03-29 15:28:19.908	2025-03-29 15:28:19.908	\N	\N
281	42	1	Rice cooker  (can make 5 kg raw rice in one go)	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
282	42	2	Wash the rice 3-4 times and soak it in measured fresh water for 1 hour in the rice cooker	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
283	42	3	Set the rice cooker to cook 1.5 hours before you need to serve the rice	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
284	42	4	takes approx 1 hour to cook the rice, so time according to when it needs to be served	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
329	48	1	Important prep:  Wash rinse and soak chole (chickpeas) and the chana dal for at least 8 hours	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
330	48	2	Boil chole with salt hing and ginger powder	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
331	48	3	Heat oil in pan add bay leaf and cumin seeds.  Add ginger paste	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
332	48	4	Add chopped tomato (alternatively blend tomatoes in Vitamix and add)	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
333	48	5	Cook till the tomato dries up	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
334	48	6	Add chana masala and coriander powder to tomato and saute well for a few mins	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
335	48	7	Add masala to chole and cook on high flame for about 10 minutes till it thickens slightly. Keep stirring while it cooks	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
336	48	8	Add half the chopped cilantro while it is still cooking	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
337	48	9	Mash some chana to give it thicker consistency and also add boiled water if necessary (consistency of final dish should be semi thick)	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
338	48	10	Add garam masala kasuri methi and first taste. Then add lemon juice based on the taste.	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
339	48	11	Garnish with the remaining chopped cilantro	\N	f	2025-03-29 16:38:29.293	2025-03-29 16:38:29.293	\N	\N
285	42	7	Open pot cooking (for the remaining quantity)	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
286	42	8	Plan this 2.5 hours before meal time	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
287	42	9	Soak rice in a pot for an hour with the measured quantity of water (usually 2x)	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
288	42	10	Start cooking the rice approx 1.5 hours before you need to serve it	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
289	42	11	let the rice cook uncovered.  Once most of the water is absorbed, close the lid and lower the flame	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
290	42	12	Cook exactly for 15 minutes (set a timer).  At the end of 15 minutes switch off the flame.  Do not open the lid	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
291	42	13	Let it sit for 30 min before you open and turn the rice for serving	\N	f	2025-03-29 15:28:19.912	2025-03-29 15:28:19.912	\N	\N
292	43	1	Bring a water to a rolling boil.  Important step to ensure that the oatmeal doesnt have a gooey texture	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
293	43	2	Add Oats and let the oats cook on medium heat	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
294	43	3	Add a dash of salt and turn to a simmer until cooked through.  Add more water if the oatmeal is too thick	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
295	43	3	Serve with toppings on the side that people can help themselves with	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
296	43	4	Sweet toppings include bananas, almonds, pecans, maple syrup	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
297	43	5	savory toppings include chutney podi, ghee and gingelly oil	\N	f	2025-03-29 15:28:19.916	2025-03-29 15:28:19.916	\N	\N
298	44	1	Important Prep:  Wash and soak the moong for about 8 hours.  Drain the water, cover it with a piece of cloth to let them sprout	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
299	44	2	Take a large pot and transfer the sprouted moong and about 2x the amount of water.  Add salt and turmeric and let it cook partially covered	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
300	44	3	Once the moong has cooked, remove about 20% of it aside to make a tadka with coconut oil.  Rest will have seasoning with ghee	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
301	44	4	Vegan:  In a pan heat up coconut oil.  When hot add mustard seeds, jeera, hing, little turmeric, coriander powder, some cilantro	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
302	44	5	Switch off the flame, add red chilly powder and mix.  Add the seasoning to the vegan portion of the cooked moong	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
303	44	6	For the regular seasoning make it the same style as vegan, except use ghee instead of coconut oil	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
304	44	7	Add lemon juice and cilantro and mix well.  Adjust for salt and the moong are ready to serve	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
305	44	8	Serve with khakra on the side - this type of breakfast is consumed in rajasthan / kutch region of india	\N	f	2025-03-29 15:28:19.92	2025-03-29 15:28:19.92	\N	\N
306	45	1	Rice cooker  (can make 7 kg raw rice in one go)	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
307	45	2	Wash the rice 3-4 times and add measured fresh water	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
308	45	3	Add 2 tbspp oil and set the rice cooker to cook 1.5 hours before you need to serve it	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
309	45	4	takes approx 1 hour to cook the rice, so time according to when it needs to be served	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
310	45	5	Open pot cooking (for the remaining quantity)	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
311	45	6	Wash the rice 3-4 times and add measured fresh water	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
312	45	7	Start cooking the rice approx 1.5 hours before you need to serve it.  Add 2 tbspp oil while cooking	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
313	45	8	let the rice cook uncovered on medium heat.  Once most of the water is absorbed, close the lid and lower the flame	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
314	45	9	Cook exactly for 15 minutes (set a timer).  At the end of 15 minutes switch off the flame.  Do not open the lid	\N	f	2025-03-29 15:28:19.924	2025-03-29 15:28:19.924	\N	\N
396	55	7	Add the black beans with some of liquid  and bring to a simmer until thickened and saucy. If it gets too thick add the reserve water from the pressure cooker	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
397	55	8	Stir in the remaining olive oil a squeeze of lime juice and cilantro. Taste and add salt/pepper or more lime juice to taste.	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
398	55	9	Final texture of the beans should be saucy not dry separate beans	\N	f	2025-03-29 16:38:29.335	2025-03-29 16:38:29.335	\N	\N
399	56	1	Thaw the frozen charred corn and bring to room temperature	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
400	56	2	Chop the onions in a food processor.  Lightly pulse the tomatoes in the food processor separately.	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
401	56	3	Mince garlic and jalapenos into a coarse paste.  Finely chop the cilantro	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
402	56	4	Mix everything together in a bowl.  Add olive oil salt pepper lemon juice and mix	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
403	56	5	Add cilantro garlic and jalapenos and mix	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
404	56	6	Let it marinate for 20-30 minutes before serving	\N	f	2025-03-29 16:38:29.341	2025-03-29 16:38:29.341	\N	\N
405	57	1	Slice the avocados in half remove the pit and scoop into a mixing bowl.	\N	f	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
406	57	2	Mash the avocado with a potato masher and make it as chunky or smooth as you'd like. Chop the onions and tomatoes into small cubes	\N	f	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
407	57	3	Finely chop the onions and cut the tomatoes into small cubes	\N	f	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
408	57	4	Add the remaining ingredients and stir together. Give it a taste test and add a pinch more salt or lime juice if needed.	\N	f	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
409	57	5	Serve separately on the side:  Wash the lettuce and pat dry.  Cut into bite sized pieces and serve the lettuce and baby spinach mixed with the meal.	\N	f	2025-03-29 16:38:29.345	2025-03-29 16:38:29.345	\N	\N
410	58	1	Rinse the toor dal 2-3 times in water and soak it with 3x water and some hing and a few drops of oil for 1-2 hours	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
411	58	2	Pressure cook it:  once the pot is at full pressure reduce the heat and let it cookfor 15 minutes	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
412	58	3	Switch off the flame and let the pressure drop naturally	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
413	58	4	Once the pressure drops open the lid and whisk the cooked dal together until its smooth	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
414	58	5	Cut onions and tomatoes into 3/4 cubes	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
415	58	6	Soak the tamarind in hot water for an hour.  Squeeze it with your hands and remove the pulp and set aside	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
416	58	7	Heat the oil in a pot.  Once hot add mustard seeds jeera methi hing turmeric dry red chillies and curry leaves	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
417	58	8	Add the diced onion and saute until translucent. Add the tomato and salt to taste	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
418	58	9	Saute until the tomato is cooked well.  Add the green pepper and saute	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
419	58	10	Add the sambar powder and salt and saute for 1-2 minutes	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
420	58	11	Add the tamarind water and let it cook on a low flame for 10 minutes	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
421	58	12	Add the cooked dal and mix.  Adjust salt and sambar powder if needed	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
422	58	13	Finely chop the cilantro and garnish just before serving	\N	f	2025-03-29 16:38:29.439	2025-03-29 16:38:29.439	\N	\N
423	59	1	Shred the cabbage into thin long pieces.  Thaw the coconut to room temperature.  Finely chop the cilantro	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
424	59	2	Mix together cabbage onion coconut cilantro lemon juice salt and pepper	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
425	59	3	Cut green chilies about 1 inch in size	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
426	59	4	Heat up coconut oil in a pan.  Once hot add mustard seeds jeera hing ginger chillies and curry leaves and add the tempering to the salad	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
427	59	5	Mix it all up.  Garnish with some cilantro before serving	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
428	59	6	Adjust salt and lemon juice based on taste	\N	f	2025-03-29 16:38:29.444	2025-03-29 16:38:29.444	\N	\N
429	60	1	Peel and cut Veggies into 1.5 length and 1/2 thick	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
430	60	2	Keep cut plantain eggplant in a bowl with water so that it doesn't change color	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
431	60	3	Beat the yougurt and keep aside	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
432	60	4	Half cook the vegetables that take longer to cook first like carrots.	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
433	60	5	Then add rest of the veggies that cook faster. If drumstick is frozen add it at the end when all veggies are 90% cooked	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
434	60	6	Grind thawed coconut green chillies and jeera into a coarse paste	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
435	60	7	Add the ground mixture to the almost cooked veggies and let it cook for 3-5 mins.	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
436	60	8	Once the mixture is cooked allow it to cool and then add the yogurt and mix well.	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
437	60	9	Heat coconut oil and add mustard seeds curry leaves hing and add it to the avial	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
438	60	10	Garnish with a bit of fresh coconut oil to enhance flavor	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
439	60	11	For vegans:  separate some quantity aside before mixing yogurt.  Add lemon juice and mix	\N	f	2025-03-29 16:38:29.448	2025-03-29 16:38:29.448	\N	\N
440	61	1	Roast moong dal (unwashed) until it is aromatic.  Wash the moong dal add the water and let it cook until it turns soft.  Add water if needed as it cooks	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
441	61	2	In another pot take the jaggery and add a bit of water and stir until jaggery dissolves completely	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
442	61	3	Add the cooked mung dal to the jaggery mixture mix well and simmer for 3-5 minutes	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
443	61	4	Heat some coconut oil and on low flame and saute the cashews until golden brown.  Then saute the coconut slices.  Finally saute the raisins until they puff up	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
444	61	5	Add coconut milk to the mung dal and jaggery mixture and adjust consistency as needed with water	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
445	61	6	Turn off the flame and add cardamom powder and mix.  Add roasted coconut raisins and cashews and serve	\N	f	2025-03-29 16:38:29.453	2025-03-29 16:38:29.453	\N	\N
446	62	1	Note that this curry paste is quite spicy so add 75% of the quantity first and then add more if need be towards the end of the dish	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
447	62	2	Chop the vegetables and tofu into bite sized pieces (Broccoli + cauliflower 1 inch florets red bell pepper into 1 inch squares tofu into 1 inch cubes)	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
448	62	3	To a large pot add the creamy part of half of the coconut milk and reduce the cocount milk until it starts to release oil	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
449	62	4	Add the curry paste and saute for a few minutes until fragrant.  Add broccoli and cauliflower and mix.	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
450	62	5	Once a bit tender bamboo shoots and tofu.  Once cauliflower is about 70% done add the red bell pepper.	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
451	62	6	Add remaining coconut milk.  Simmer for a few minutes taking care that the red pepper is still crunchy to eat.	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
452	62	7	All vegetables should be cooked with a slight crunch and not mushy.  Switch off flame and add cilantro	\N	f	2025-03-29 16:38:29.458	2025-03-29 16:38:29.458	\N	\N
453	63	1	Shred the cabbage into thin long pieces in the food processor.  Shred the lettuce into long thin strips	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
454	63	2	Peel the green papaya and grate it in the food processor (thick blade).  Also grate the carrot through the same blade	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
455	63	3	Cut the tomatoes into 1/2 inch pieces.  Cut the beans into 1 inch long pieces	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
456	63	4	Chop the cilantro and mint	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
457	63	5	Combine tamari garlic chillies lemon sugar and salt and then toss well to create the dressing	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
458	63	6	In a bowl mix all the ingredients garnish with sesame seeds cilantro and mint	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
459	63	7	Let it sit for about 20-30 minutes before serving	\N	f	2025-03-29 16:38:29.462	2025-03-29 16:38:29.462	\N	\N
578	78	12	Add chole masala and cook on medium high flame until the gravy thickens and stir occasionally	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
579	78	13	Garnish with cilantro just before serving	\N	f	2025-03-29 17:52:40.576	2025-03-29 17:52:40.576	\N	\N
580	79	1	Wash all the lentils 3-4 times (urad, rajma and channa dal) and soak overnight	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
581	79	2	Chop the garlic, ginger and green chillies finely	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
582	79	3	Boil/pressure cook all of the lentils with the ginger, garlic, green chillies & enough water	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
583	79	4	Use approx 3.5 times as much water as the soaked dal (or have 3 inches of water above the dal)	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
584	79	5	Simmer for 50 minutes or until lentils are well cooked	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
585	79	6	Mash the lentils lightly with the back of a ladle and add water as needed	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
586	79	7	Tempering the dal:	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
587	79	8	Heat the oil in a heavy pan, add the cumin seeds and methi seeds	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
588	79	9	Add the garlic, and hing and tomato paste and stir for a minute.	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
589	79	10	Add red chilly powder and then add the tempering to the boiled dal and bring it to a boil again	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
590	79	11	Add salt, coconut milk and simmer gently for 30 minutes	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
591	79	12	Add garam masala and switch off the stove; garnish with chopped cilantro	\N	f	2025-03-29 17:52:40.583	2025-03-29 17:52:40.583	\N	\N
592	80	1	Heat the pan and add a tbspp of oil and roughly cut onions, garlic and ginger. When onion turns translucent, add tomatoes and cashews and fry until cooked.	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
593	80	2	Set the mixture to cool completely and grind it into a smooth paste.	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
594	80	3	For gravy, heat the oil in a very low flame,  add jeera, turmeric powder, red chilli powder, jeera powder, garam masala, coriander powder and mix well in the oil until aromatic	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
595	80	4	Add the ground paste and cook well until oil seprates from the gravy	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
596	80	5	Add water, peas and salt to desirable consistency and let the gravy boil well.	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
597	80	6	In a seperate pan, heat oil/ghee and fry the paneer for 1-2 mins until the paneer turn slightly brown and keep it aside	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
598	80	7	When the gravy is fully cooked, seperate some for vegans	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
599	80	8	In the remaining gravy, add the paneer, crushed kasuri methi and cilantro and cook for 1-2 mins.	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
600	80	9	For Vegans:	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
601	80	10	Remove some gravy before adding paneer	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
602	80	11	Add extra firm tofu and let it cook for 2-3 mins	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
603	80	12	Garnish with cilantro and crushed kasuri methi	\N	f	2025-03-29 17:52:40.589	2025-03-29 17:52:40.589	\N	\N
604	81	1	Rinse and wash the black chana well. Soak in enough water overnight. Next morning pressure cook for about 6-7 whistles on medium heat, until they are tender. They shouldn't be mushy.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
605	81	2	Heat oil add ajwain seeds, Once they splutter, add besan (if there are too many lumps in the besan, sift and use ) and sauté another 30 secs on medium-low heat or until the besan turns brown in color.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
606	81	3	Make a paste of 1/2 cup boiled chana by adding water and add it to the tadaka	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
607	81	4	Add in the rest of the chana and mix well.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
608	81	5	Add red chilli, turmeric, cumin-coriander powders, jaggery and tamarind water. Mix it well and sauté for another minute.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
609	81	6	Add 1 & 1/2 cups of water, mix it well and let it cook for 8-10 minutes until the curry thickens, stirring occasionally. Adjust the consistency as per your requirement. The curry has a tendency to thicken when it gets cold.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
610	81	7	You can add some water and reheat it to adjust the consistency.	\N	f	2025-03-29 17:52:40.601	2025-03-29 17:52:40.601	\N	\N
611	82	1	Wash Toor dal and soak for 1-2 hours	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
612	82	2	Pressure Cook dal with turmeric and a little salt (1:3 water ratio) and then whisk it into a paste and keep it aside.	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
613	82	3	Heat oil – add mustard seeds, cumin seeds,  cloves, cinnamon, methi seeds, dried red chillies, hing	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
614	82	4	Add curry leaves, ginger paste, green chilli paste and saute well	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
615	82	5	Then add tomatoes, turmeric powder, coriander cumin powder, red chilli powder and cook till the tomatoes turn mushy	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
501	68	1	Make the salad dressing by blending all the ingredients above in the vitamix.  Adjust the consistency with water as needed	\N	f	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
502	68	2	Chill the dressing for an hour or so before serving	\N	f	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
503	68	3	Roughly Chop Romaine lettuce, chop Cucumber and tomato into bite sized pieces	\N	f	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
504	68	4	Mix all the ingredients	\N	f	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
505	68	5	Serve with dressing on the side	\N	f	2025-03-29 17:40:06.437	2025-03-29 17:40:06.437	\N	\N
616	82	6	Add jaggery and tamarind paste.  Add cooked dal to this tempering	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
617	82	7	Add 4 cups of water and adjust the dal consistency as required. Add garam masala and aachar masala.	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
618	82	8	Boil it for sometime and garnish it with chopped cilantro	\N	f	2025-03-29 17:52:40.606	2025-03-29 17:52:40.606	\N	\N
619	83	1	Boil the potatoes.  Once cooked and cooled remove the skin.  Cut into 1 inch square pieces (not very small)	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
620	83	2	Finely chop (or run through food processor) ginger, green chillies and curry leaves	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
621	83	3	Heat up oil in a pot.  Once hot add mustard seeds and let them splutter.  Add cumin seeds, hing, turmeric.	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
622	83	4	Add ginger, green chillies, curry leaves, and about 25% of the chopped cilantro.  Add salt to taste.  Saute for a minute or so	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
623	83	5	Add the potatoes and mix properly.   Lower the flame to medium low	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
624	83	6	Saute it for 7-10 minutes until the potatoes start to get browned at the bottom of the pot	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
625	83	7	Add lemon juice and mix.  Garnish with cilantro and serve	\N	f	2025-03-29 17:52:40.612	2025-03-29 17:52:40.612	\N	\N
626	84	1	Shred the cabbage into thin, long pieces,Add salt and let it sit to remove excess water. Squeeze out the water and set aside.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
627	84	2	Finely chop the cilantro	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
628	84	3	Thinly slice the carrot and bell pepper.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
629	84	4	Cube the tomatoes.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
630	84	4	Cut green chilies into 1-inch pieces.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
631	84	5	Heat up oil in a pan. Once hot add mustard seeds, hing, green chillies and curry leaves , then add tomatoes carrot and bell Pepper.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
632	84	6	Cook until half done, Then add all the spices ( turmeric, coriander power, garam masala, Lemon juice and sugar)	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
633	84	6	Turn off the heat and mix the cooked mixture with the shredded cabbage.	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
634	84	7	Adjust salt and lemon juice based on taste	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
635	84	8	Garnish with chopped cilantro and Green grapes	\N	f	2025-03-29 17:52:40.617	2025-03-29 17:52:40.617	\N	\N
636	85	1	Discard the top and bottom tip of the radishes and wash well	\N	f	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
637	85	2	Peel their skins and grate them through a food processor (thicker shred)	\N	f	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
638	85	3	Mix the grated radishes with salt, lime juice, and cilantro.  Serve	\N	f	2025-03-29 17:52:40.622	2025-03-29 17:52:40.622	\N	\N
639	86	1	Rinse the toor dal 2-3 times in water and soak it with 3x water and some hing and a few drops of oil for 1-2 hours	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
640	86	2	Pressure cook it:  once the pot is at full pressure reduce the heat and let it cookfor 15 minutes	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
641	86	3	Switch off the flame and let the pressure drop naturally	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
642	86	4	Once the pressure drops, open the lid and whisk the cooked dal together until its smooth	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
643	86	5	Dice the onions, bell pepper, chayote into 2 inch cubes.  Chop the tomatoes into bite sized pieces. Slightly peel and chop drumsticks into 2 inch pieces.	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
644	86	6	Soak the tamarind in hot water for an hour.  Squeeze it with your hands and remove the pulp and set aside	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
645	86	7	Heat oil and add mustard. When it splutters, add urad dhal, methi, jeera, hing. Then add red chillies and curry leaves	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
646	86	8	Add diced onions and fry until translucent. Add the tomatoes and fry until cooked.	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
647	86	9	Add the veg with water, tumeric powder and salt. Keep it covered at medium flame	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
648	86	10	When it is half-cooked, add tamarind and half of sambar powder.	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
649	86	11	Once the veg are soft, add the dhal, remaining sambar powder and salt.	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
650	86	12	When it starts boiling, reduce heat and cover for 5 mins	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
651	86	13	Garnish with some fresh tempering and cilantro	\N	f	2025-03-29 17:52:40.667	2025-03-29 17:52:40.667	\N	\N
652	87	1	Rinse and dry the beans. Trim the ends off and cut into 1 inch pieces	\N	f	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
653	87	2	Tempering: Heat oil, add mustard seeds and when it splutters, add urad dhal, jeera, hing, dry red chillies and curry leaves	\N	f	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
654	87	3	Add the beans to the pan and salt. Mix well and reduce heat to low.	\N	f	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
655	87	4	Then cover with a lid and cook on low heat for 15-20 mins until beans is cooked. Add little water if necessary to cook the beans. Stir well.	\N	f	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
656	87	5	Add thawed frozen coconut and mix well.	\N	f	2025-03-29 17:52:40.672	2025-03-29 17:52:40.672	\N	\N
657	88	1	Shred the cabbage into thin long pieces, and finely chop the onion.  Thaw the coconut to room temperature.  Finely chop the cilantro	\N	f	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
658	88	2	Mix together cabbage, onion, coconut, cilantro, lemon juice, salt and pepper	\N	f	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
659	88	3	Heat up coconut oil in a pan.  Once hot add mustard seeds, jeera, hing and curry leaves and add the tempering to the salad	\N	f	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
660	88	4	Mix it all up.  Garnish with some cilantro before serving	\N	f	2025-03-29 17:52:40.676	2025-03-29 17:52:40.676	\N	\N
1071	129	1	Blend water and almonds together to a smooth milky consistency.  This is used in place of store brought almond milk	\N	f	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1072	129	2	Then add 90% of the mango pulp and blend it all together.  Reserve the remaining mango pulp to drizzle on top before serving	\N	f	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1073	129	3	Mix it with the oats and chia seeds to it and refrigerate overnight.  The liquid should be about twice the volume as the oats	\N	f	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1074	129	4	in the morning the oats should have soaked the liquid and you should have a porridge consistency	\N	f	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1075	129	5	Garnish with cashews, shredded coconut and mango pulp drizzle.  Serve with a side of blueberries and maple syrup	\N	f	2025-04-23 16:57:46.184	2025-04-23 16:57:46.184	\N	\N
1076	130	1	Soak: Rajma overnight.  Prep:  Chop onions.  Coarsely grind tomatoes.  Grind ginger garlic  green chilli into a paste.  Julienne ginger and chop cilantro for garnish	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1077	130	2	Boil : Add the required amount of water and salt and  boil the rajama until cooked properly.  If using a pressure cooker let it cook on slow flame	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1078	130	3	for 15 minutes after the cooker is at full pressure	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1079	130	3	Tempering : In a pan add oil.  When hot add jeera and saute until they crackle. Add coarsely ground green chilli, ginger and garlic paste and saute for a min	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1080	130	4	Saute onion with Tumeric poweder, corander poweder,  and salt  until the onions turn light brown	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1081	130	5	Saute for a few mins then add tomatoes and saute it until the mixture starts to leave oil on the sides	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1082	130	6	Drain the liquid from the cooked rajma and reserve on the side.  Add rajma (without the cooking water) and fry the beans with the masala	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1083	130	7	Then add the reserved water.  Let it simmer on low flame for 10-15 minutes. Add garam masala at the end and remove from flame.	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1084	130	8	Garnish it with Cilantro and ginger julienne	\N	f	2025-04-23 16:57:46.197	2025-04-23 16:57:46.197	\N	\N
1085	131	1	Need gloves when making salad.  Make sure gloves dont get cut when chopping by knife or food processor	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1086	131	2	Dressing: simply blend the ingredients in vitamix until smooth. Add water as needed	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1087	131	3	The dressing should be of a creamy consistency and it thickens slightly with time	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1088	131	4	Wash and drain the lettuce and let it dry.  Cut the lettuce into bite sized pieces.  Thinly slice the cabbage and onions.	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1089	131	5	Cut the tomatoes, cucumbers and bell peppers into 1 inch cubes	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1090	131	6	In a large bowl, add everything except dressing.	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1091	131	7	Just before serving drizzle the dressing over the salad bowl. Use 2 wooden spoons and toss until everything is evenly coated.	\N	f	2025-04-23 16:57:46.202	2025-04-23 16:57:46.202	\N	\N
1092	132	1	To be made in batches	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1093	132	2	Cut potatoes in 1/2 inch long wedges.  Cut the cauliflower into medium florets (1-1.5 inches).   Make a rough paste of ginger and green chillies. Slice Onion and cut in half.  Finely chopped tomatoes.	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1094	132	3	Heat the oil, once hot add jeera, turmeric.  Add ginger-chilly paste and onion and saute until onions are translucent. Add tomatoes and cook for a few mins.	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1095	132	4	Add turmeric, red chilly powder, coriander powder, salt and mix well	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1096	132	5	When tomatoes get cooked and oil seperates, dd potatoes and mix.  Cover and let it cook for a few minutes until the potatoes are about 50% done.  Add a splash of water to prevent potatoes from burning	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1097	132	6	Add cauliflower, salt and mix.  Cover and cook on medium-high flame turning it occassionally so that it doesnt burn	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1098	132	7	Add garam masala once the cauliflower and potato are cooked and give it a good mix.	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1099	132	8	Garnish with cilantro and serve	\N	f	2025-04-23 16:57:46.207	2025-04-23 16:57:46.207	\N	\N
1100	133	1	Wash and soak the dal for 2 hours.  Boil on stovetop with 3x water and half the turmeric.  Keep stirring occassionally.  Remove from heat once fully cooked.	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1101	133	1	Always use gloves when making food that will be served raw!  Wash cucumbers and dry.  Wash carrots and peel them	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1102	133	2	Finely chop the onions and tomatoes and keep aside.  Chop the cilantro.  Make green chilly-ginger paste.	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1103	133	2	Slice both through the food processor.  Add salt and pepper.  Cover and refrigerate until ready to serve	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1104	133	3	Heat the oil, add whole red chilli, green chilli jeera, bay leaf, hing.  Add ginger and then add chopped onion.	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1105	133	4	Fry onion until translucent.  Add dry spices and mix.  Add chopped tomatoes and saute until the tomatoes are cooked and the mixture starts to release oil	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1106	133	5	Add the cooked dal to it and mix properly.  Let it simmer on low heat for 15-20 minutes stirring occassionally	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1107	133	6	Switch off the flame, add lemon juice and garam masala and mix properly.  Garnish with cilantro before serving	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1108	133	7	Sliced Cucumber & Carrots	\N	f	2025-04-23 16:57:46.213	2025-04-23 16:57:46.213	\N	\N
1109	134	1	Wash Toor dal and soak for 1-2 hours	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1110	134	2	Pressure Cook dal with turmeric and a little salt (1:3 water ratio) and then whisk it to mix it well	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1111	134	3	Take about 20% of the dal aside for vegan serving	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1112	134	4	For the regular dal:  bring the dal to a boil and make a seasoning with ghee, jeera, hing, red chillies.  Add to the dal and mix	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1113	134	5	Add lemon juice and chopped cilantro and switch off the flame	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1114	134	6	For vegan dal follow the same process but make the seasoning with oil instead of ghee	\N	f	2025-04-23 16:57:46.219	2025-04-23 16:57:46.219	\N	\N
1115	135	1	Heat oil. Add hing and cumin seeds. Add chopped green chilly and potatoes. Saute on medium flame. Cover.	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1116	135	2	Add salt, and continue to saute. Add a sprinkling of water (for it to cook faster).	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1117	135	3	Continue to saute and cover and cook - stirring intermittently - all on medium flame.	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1118	135	4	When potatoes are about half cooked add Coriander powder and chilly powder.	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1119	135	5	Continue to cook and stir. Again, add a bit of water if needed.	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1120	135	6	Add chopped coriander, frozen peas, and tomato.  Cover, cook, and saute till potatoes are done (should not be mushy)	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1121	135	7	Add Roasted cumin seed powder.	\N	f	2025-04-23 16:57:46.224	2025-04-23 16:57:46.224	\N	\N
1122	136	1	Wash the rice and mung dal and leave aside	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1123	136	2	Trim off the root end of the spinach bunch.  Wash by immersing in water, and removing it in a strainer	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1124	136	3	Chop the spinach in bite sized pieces	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1125	136	4	Heat the oil.  Once warm add cloves and cinnamon and allow them to sizzle.  Add jeera, hing, red chillies, and turmeric.	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1126	136	5	Add washed dal and saute for 4-5 minutes.  Add water and let it cook on open flame on medium heat (once boiling)	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1127	136	6	Add coriander and jeera powder, and salt and mix well	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1128	136	7	Once the rice and dal are cooked the consistency should be like a thick porridge, not dry.  Add water if needed	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1129	136	8	Finally add the lemon juice concentrate and spinach.  Mix well.  Cook until the spinach wilts slightly	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1130	136	9	Spinach should be bright green and not fully cooked.  Switch off the flame.  The remaining heat will cook the spinach	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
722	97	1	In a bowl whisk together the gram flour (besan), green chilly-ginger paste, yogurt, and salt with water	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
723	97	2	Beat to a smooth mixture without any lumps.	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
724	97	3	In a saucepan heat ghee, add methi seeds, cumin seeds, cinnamon, cloves, hing, red chillies and curry leaves	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
725	97	4	Add the yogurt-water mixture which we had prepared earlier. Stir and mix well.	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
726	97	5	Bring it to a boil on medium-low to medium heat stirring occassionally so the mixture doesnt separate	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
727	97	6	Continue to simmer until the raw taste of besan is gone and the kadhi thickens.  Add sugar and mix till it dissolves	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
728	97	7	Garnish with chopped cilantro before serving	\N	f	2025-04-22 23:35:04.211	2025-04-22 23:35:04.211	\N	\N
1131	136	10	Serve with ghee on the side	\N	f	2025-04-23 16:57:46.231	2025-04-23 16:57:46.231	\N	\N
1132	137	1	Finely chop cilantro, cut tomato, and cucumber in small cubes.  Grate the carrots in the food processor	\N	f	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1133	137	2	Mix all the ingredients above, add salt, jeera powder, and lemon juice concentrate and mix well	\N	f	2025-04-23 16:57:46.342	2025-04-23 16:57:46.342	\N	\N
1134	138	1	Rinse the toor dal 2-3 times in water and soak it with 3x water and some hing and a few drops of oil for atleast 1-2 hours	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1135	138	2	Pressure cook it with turmeric.  Once the cooker is at full pressure reduce the heat and let it cook for 15 minutes	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1136	138	3	Switch off the flame and let the pressure drop naturally.  Once the pressure drops, open the lid and whisk the cooked dal together until its smooth	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1137	138	4	Soak the tamarind in hot water for an hour.  Make pulp and set aside	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1138	138	5	Chop the vegetables:  drumsticks into 2 inches long cuts, peel and cut taro root into 1 inch cubes, tomatoes into 1 inch cubes	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1139	138	6	Boil the vegetables in water with turmeric and salt.  Keet it covered and cooking at medium heat.  When half cooked add the tamarind water and half the sambar powder	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1140	138	7	Once the vegetables are soft, add the cooked dal, remaining sambar powder and salt.  Bring to a boil	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1141	138	8	Once it starts boiling lower the flame and let it simmer for 5 minutes.  You may leave the pot partially covered but stir occassionally and ensure the sambar doesnt boil over	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1142	138	9	Tempering:  Heat oil in a pan.  Once hot add mustard seeds, urad dal, jeera, methi, hing, dry red chillies and curry leaves	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1143	138	10	Add the tempering to the sambar.  Garnish with cilantro	\N	f	2025-04-23 16:57:46.347	2025-04-23 16:57:46.347	\N	\N
1144	139	1	Shred the cabbage in a food processor on the thick slice setting	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1145	139	2	Heat oil in a pot.  Add mustard seeds, urad dal, chana dal, few curry leaves and hing	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1146	139	3	Add shredded cabbage, turmeric and salt to taste.  Saute for 1-2 minutes	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1147	139	4	Cover and let it cook on low-medium heat stirring occasionally	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1148	139	5	Prepare the coconut masala by blending the coconut, kashmiri red chillies and jeera into a coarse paste (do not add any water - make this in the food processor)	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1149	139	6	if you are making the paste in the vitamix add a little water and make it in small batches	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1150	139	7	Add the coconut masala to the cabbage and mix well	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1151	139	8	Let it simmer for 2 minutes.  The cabbage should be cooked but should have a slight bite (dont overcook the cabbage)	\N	f	2025-04-23 16:57:46.352	2025-04-23 16:57:46.352	\N	\N
1152	140	1	Soak rice for 1/2 hour.  Soak the saffron in 25 ml warm water	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1153	140	2	Slice the onions, chop the tomatoes.  Cut the remaining vegetables in uniform sizes so they cook evenly.  Finely chop the herbs	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1154	140	3	Heat the oil, add whole spices and sliced onions and sautee until the onions are golden brown.  Add ginger, garlic and green chilly paste	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1155	140	4	Puree the tomato.  Add the tomato puree and half of the mint and cilantro to the onions and mix	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1156	140	5	Add kasuri methi, chopped vegetables, salt and mix. Also add the soaked saffron along with the water. Cover and let it cook on medium flame until the vegetables are about 80% cooked	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1157	140	6	Pour in 2 cans of coconut milk ( approx 4 cups) mixed with 4 cups of water, add remaining cilantro and mint and mix it well	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1158	140	7	Add soaked rice, cook on medium flame until water evaporates. Then cover with lid, lower the flame and cook for 15 minutes	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1159	140	8	Switch off the flame and let it sit for about 10 minutes before opening the lid	\N	f	2025-04-23 16:57:46.36	2025-04-23 16:57:46.36	\N	\N
1160	141	1	Finely chop onion and cilantro, cut tomato, and cucumber in small cubes	\N	f	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1161	141	2	Mix all the ingredients above, add salt and jeera powder	\N	f	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1162	141	3	Whisk yogurt and keep it on the side for people to help themselves.  Add a little salt and jeera powder to the yogurt.	\N	f	2025-04-23 16:57:46.366	2025-04-23 16:57:46.366	\N	\N
1163	143	1	Wash & soak the chane in water overnight.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1164	143	2	For the prep, add onion, garlic, ginger & green chilli in a chopper & chop it roughly, you don’t have to make it extremely fine, transfer the onion mixture into a bowl & chop the tomatoes similarly.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1165	143	3	Discard the water from soaked chane & add them into a pressure cooker and cook it so that they are soft and not mushy.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1166	143	4	Heat oil, once add the onion, garlic, ginger, green chilli chopped and saute for a bit.  Add tomato and saute until the oil starts to separate.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1167	143	5	Add turmeric, coriander and jeera powder, garam masala, red chilli powder salt and let it cook well	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1168	143	6	Add the boiled black chana along with any reserve water	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1169	143	7	Let the mixture cook and blend well. Add reserved water to desired consistency.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1170	143	8	Gravy should be thin for this recipe but you can adjust it according to your preference.	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1171	143	9	Garnish with finely chopped cilantro	\N	f	2025-04-23 16:57:46.375	2025-04-23 16:57:46.375	\N	\N
1172	144	1	Finely chop onion and cilantro.  Cut tomato, and cucumber in small cubes.	\N	f	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1173	144	2	Mix all the ingredients above, add salt and jeera powder	\N	f	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1174	144	3	Whisk yogurt and keep it on the side for people to help themselves.  Add a little salt and jeera powder to the yogurt.	\N	f	2025-04-23 16:57:46.38	2025-04-23 16:57:46.38	\N	\N
1175	145	1	For Masala Mixture:  In a bowl add water, turmeric powder, red chill powder, hing, jeera powder and mix everything properly then keep aside for further use	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1176	145	2	In a pot heat oil.  Add cumin seeds, ginger, green chillies, garlic and saute for a few seconds then add the prepared masala mixture	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1177	145	3	Saute until the oil starts separating. Add tomato and saute until cooked.  Then add cauliflower, potatoes, salt, water and mix everything properly.	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1178	145	4	Then cover and cook on low heat for 10-12 minutes.	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1179	145	5	Remove the lid and stir in the chopped coriander leaves. Switch off the flames then cover and keep aside for 2-3 minutes.	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1180	145	6	Then garnish with chopped cilantro and serve	\N	f	2025-04-23 16:57:46.383	2025-04-23 16:57:46.383	\N	\N
1181	146	1	Wash and soak the dal for 2 hours.  Boil on stovetop with 3x water and half the turmeric.  Keep stirring occassionally.  Remove from heat once fully cooked.	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1182	146	2	Finely chop the onions and tomatoes and keep aside.  Chop the cilantro.  Make green chilly-ginger-garlic paste.	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1183	146	3	Heat the oil, add whole red chilli, green chilli jeera, bay leaf, hing.  Add ginger and then add chopped onion.	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1184	146	4	Fry onion until translucent.  Add dry spices and mix.  Add chopped tomatoes and saute until the tomatoes are cooked and the mixture starts to release oil	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1185	146	5	Add the cooked dal to it and mix properly.  Let it simmer on low heat for 15-20 minutes stirring occassionally	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1186	146	6	Switch off the flame, add lemon juice, kasuri methi, and garam masala and mix properly.  Garnish with cilantro before serving	\N	f	2025-04-23 16:57:46.507	2025-04-23 16:57:46.507	\N	\N
1187	147	1	Trim the end of romaine lettuce, wash and let it drain to dry	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1188	147	1	Wash Toor dal and soak for 1-2 hours	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1189	147	1	Slice the radishes and cucumber through the thin slicer in the food processor	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1190	147	2	Need gloves when making salad.  Make sure gloves dont get cut when chopping by knife or food processor	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1191	147	2	Pressure Cook dal with turmeric and a little salt (1:3 water ratio) and then whisk it into a paste and keep it aside.	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1192	147	2	Mix all the ingredients above, add salt and lemon juice concentrate	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1193	147	3	Discard the top and bottom tip of the carrots and peel them.  Trim cucumbers and wash well.	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1194	147	3	Heat oil – add mustard seeds, cumin seeds,  cloves, cinnamon, methi seeds, dried red chillies, hing	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1195	147	3	Chill until ready to serve	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1196	147	4	Thinly slice the cucumbers and carrots in the food processor.  Finely shred the purple cabbage	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1197	147	4	Add curry leaves, ginger paste, green chilli paste and saute well	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1198	147	5	For the salad dressing:  blend all ingredients together into a smooth creamy dressing.  Add water to get the right consistency	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1199	147	5	Then add tomatoes, turmeric powder, coriander cumin powder, red chilli powder and cook till the tomatoes turn mushy	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1200	147	6	Gujarati Dal	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1201	147	6	Add jaggery and tamarind paste.  Add cooked dal to this tempering	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1202	147	7	Add 4 cups of water and adjust the dal consistency as required. Add garam masala and aachar masala.	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1203	147	8	Boil it for sometime and garnish it with chopped cilantro	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1204	147	9	Red radish, cucumber salad	\N	f	2025-04-23 16:57:46.513	2025-04-23 16:57:46.513	\N	\N
1205	148	1	Trim and discard both ends of the beans.  Chop them into small pieces (~0.50 inches).  Peel and dice potatotes into .75 inch cubes	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1206	148	2	Heat the oil in a pot.  Add mustard seeds, asafoetida.  Add the chopped vegetables.	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1207	148	3	Now add the turmeric, red chilly powder, and salt and mix well.  Cover for 5-6 minutes.  Uncover and mix well.	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1208	148	4	Add little water and let it cook on low flame until the beans and potatoes are cooked and most of the water is absorbed. This may take about 30-45 mins to cook properly. Mix gently in between	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1209	148	5	Once the green beans and potatoes are cooked and tender, add the ground cumin and ground coriander.	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1210	148	6	Mix well and cook uncovered on medium heat to burn off most of the excess remaining liquid. Allow 30-45 mins to cook properly on low flame.	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1211	148	7	Add salt to taste and a small amount of freshly squeezed lemon juice.  Add lemon juice based on taste. Mix and garnish with finely chopped fresh cilantro.	\N	f	2025-04-23 16:57:46.522	2025-04-23 16:57:46.522	\N	\N
1212	149	1	Chop the vegetables and tofu into bite sized pieces (Broccoli + cauliflower 1 inch florets, red bell pepper into 1 inch squares, tofu into 1 inch cubes)	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1213	149	2	To a large pot add the creamy part of half of the coconut milk and reduce the cocount milk until it starts to release oil	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1214	149	3	Add the curry paste and saute for a few minutes until fragrant.  Add broccoli and cauliflower and mix.	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1215	149	4	Once a bit tender, bamboo shoots and tofu.  Once cauliflower is about 70% done add the red bell pepper.	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1216	149	5	Add remaining coconut milk.  Simmer for a few minutes taking care that the red pepper is still crunchy to eat.	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1217	149	6	All vegetables should be cooked with a slight crunch and not mushy.  Switch off flame and add cilantro	\N	f	2025-04-23 16:57:46.527	2025-04-23 16:57:46.527	\N	\N
1218	150	1	Shred the cabbage into thin long pieces in the food processor.  Shred the lettuce into long thin strips	\N	f	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1219	150	2	Roughly chop the cilantro and mint	\N	f	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1220	150	3	Combine tamari, garlic, chillies, lemon, sugar, and salt and then toss well to create the dressing	\N	f	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1221	150	4	In a bowl mix all the ingredients garnish with sesame seeds, cilantro and mint	\N	f	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1222	150	5	Let it sit for about 20-30 minutes before serving	\N	f	2025-04-23 16:57:46.532	2025-04-23 16:57:46.532	\N	\N
1223	151	1	Soak toor dal for 3-4 hours in lukewarm water;  Do not over soak dal.  Pressure cook it until soft; mash / hand blend till smooth.	\N	f	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1224	151	2	Add hot water to adjust consistency as needed.  Final consistency should be like sambar	\N	f	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1225	151	3	Add turmeric powder, hing, salt and bring to a boil	\N	f	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1226	151	4	Add lemon juice just before serving.  Serve on the rice with a teaspoon of ghee	\N	f	2025-04-23 16:57:46.536	2025-04-23 16:57:46.536	\N	\N
1227	152	1	Trim the ends of the plantains, peel the green layer.  Cut vertically and slice into quarters of .5 inch thickness.	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1228	152	2	Store the cut plantains in water solution of turmeric and salt.  Cut the onions into slices	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1229	152	3	Take a large pot and add the cut plantains and some of the turmeric salt water.  Cook over low flame until about 90% done	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1230	152	4	Coarsely grind in a food processor:  Coconut, jeera, green chillies, a hand full of curry leaves and salt	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1231	152	5	In a kadhai heat the oil.  When hot add chana dal, urad dal, mustard seeds.  Once the mustard seeds crackle add red chillies, hing and curry leaves	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1232	152	6	Add sliced onions and saute until the onions are translucent	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1233	152	7	Check if the plantains are mostly cooked and the water has been mostly evaporated.  Once they are add the oil seasoning to the plantains and give it a good mix	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1234	152	8	Add the ground coconut paste.  Mix well and add lemon juice concentrate.  Saute for 3-4 minutes until all flavors are incorporated.  Adjust for salt	\N	f	2025-04-23 16:57:46.541	2025-04-23 16:57:46.541	\N	\N
1235	153	1	Wash and peel the chayote squash.  Cut lengthwise and remove the seed	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1236	153	2	Grate with a large hole grater in the food processor.  Blend the green chillies	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1237	153	3	Heat oil in a pot.  Once hot add urad dal, mustard seeds, jeera, hing, curry leaves, green chillies	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1238	153	4	Add grated chayote squash and salt to taste.  Saute and let it cook for 2-3 minutes.  It will cook quickly	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1239	153	5	Remove from heat and let it cool.	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1240	153	6	Whisk yogurt and add to the choayote squash.  Mix properly and adjust salt to taste	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1241	153	7	Finely chop the cilantro and add to garnish the raita before serving	\N	f	2025-04-23 16:57:46.548	2025-04-23 16:57:46.548	\N	\N
1242	154	1	Optional step:  boil the tomatoes and cool.  Take the peels off and use it for the salsa for more flavor.  Can also grill them instead	\N	f	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
1243	154	2	Chop the onions, garlic and jalapenos in a food processor.  Lightly pulse the tomatoes in the food processor separately.	\N	f	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
1244	154	3	Finely chop the cilantro.  Mix everything together in a bowl.  Add salt, pepper, lemon juice and mix	\N	f	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
1245	154	4	Refrigerate it for 30-45 minutes (or a few hours) before serving	\N	f	2025-04-23 16:57:46.558	2025-04-23 16:57:46.558	\N	\N
1246	155	1	Peel the beetroot and cut off the base and top.  Cut it in 4 quarters.  Now grate all through a food processor thick blade.	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1247	155	2	Keep aside.  Slice onions and keep aside.  Make a coarse paste of coconut, green chillies and jeera	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1248	155	3	Take coconut oil in a pot.  Once hot add mustard seeds, once they splutter add curry leaves and turmeric powder	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1249	155	4	Add the grated beetroot and salt and give it a good mix.  Cover and let it cook on low flame for 2-3 minutes	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1250	155	5	Uncover and mix.  Add some water to help the beetroot cook well.  Cover and cook the beetroot well.  If it needs more water add some along the way	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1251	155	6	Once the beetroot is cooked you dont want any leftover water, so be careful to not add too much water	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1252	155	7	Add the ground coconut paste and give it a good mix.  Turn off the flame and cover and let it sit for 5 minutes	\N	f	2025-04-23 16:57:46.656	2025-04-23 16:57:46.656	\N	\N
1253	156	1	Wash the rice and dal and set aside for about an hour.  In a large pot combine the rice, dal and water.  Bring it to a boil	\N	f	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
1254	156	2	Add turmeric and black peppercorns and let it cook on medium flame.  Add salt once the khichdi is almost done and mix well	\N	f	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
1255	156	3	Keep stirring and add water if needed.  The final consistency should be a thick porridge like; not dry like Pulav	\N	f	2025-04-23 16:57:46.663	2025-04-23 16:57:46.663	\N	\N
1256	157	1	This is a buffer created to finish up whatever vegetables are left in the kitchen	\N	f	2025-04-23 16:57:46.666	2025-04-23 16:57:46.666	\N	\N
1257	157	2	Make a simple stir fry by chopping the vegetables and adding it to a simple tadka of oil, jeera, hing and salt.	\N	f	2025-04-23 16:57:46.666	2025-04-23 16:57:46.666	\N	\N
1258	157	3	Add a touch of turmeric powder and red chilly powder	\N	f	2025-04-23 16:57:46.666	2025-04-23 16:57:46.666	\N	\N
1259	157	4	If vegetables lend themselves to a salad then make a quick simple salad	\N	f	2025-04-23 16:57:46.666	2025-04-23 16:57:46.666	\N	\N
1260	158	1	In a pot, heat mustard oil, add cumin seeds, fennel seeds let it splutter well.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1261	158	2	Add the asafoetida, crushed chillies & ginger saute for a minute.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1262	158	3	Add turmeric powder, red chilli powder, coriander powder saute for a minute.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1263	158	4	Add tomato and saute until fragrant. Then add the potatoes and mix it well.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1264	158	5	Add water, salt to taste, and stir it once then put the lid on and cover and let it cook on low-medium flame until the potatoes are cooked	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1265	158	6	Remove the lid and with the help of a masher mash some of the potatoes and then boil it for a minute.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1266	158	7	Finish it with little ghee and garnish with coriander leaves.	\N	f	2025-04-23 16:57:46.669	2025-04-23 16:57:46.669	\N	\N
1267	159	1	Wash the dal thoroughly with plenty of water. Soak the dal for 1 hour	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1268	159	2	Pressure cook the dal until soft and mash it until smooth. Add water to get desired consistency	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1269	159	3	Heat oil in a pan add black jeera, red chillies, green chilles, bay leaf, turmeric and add it to the whisked dal. Add salt.	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1270	159	4	Let the dal boil for 4-5 mins. Adjust dal consistency by adding more water.	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1271	159	5	Garnish with chopped cilantro	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1272	159	6	Ref: https://youtu.be/plb-4p9V6U4?si=j_b_myTlJJlObYfi	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1273	159	7	https://www.bongeats.com/recipe/plain-mosur-dal	\N	f	2025-04-23 16:57:46.672	2025-04-23 16:57:46.672	\N	\N
1274	160	1	Cut potatoes and pumpkin in 1.5 inch cubes	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1275	160	2	Cut sweet potatoes in 1 inch cubes	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1276	160	3	Cut cauliflower cabbage beans eggplant in 2 inch cubes	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1277	160	4	Heat oil and add dried red chillies, bay leaves, one green chilli, and panch phoron.	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1278	160	5	Add potatoes and sweet potatoes. Fry for 3 minutes	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1279	160	6	Next, add pumpkin. Fry for 3 minutes.	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1280	160	7	Add cauliflower and fry for 3 minutes	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1281	160	8	Then, add long beans, and fry for 3 minutes.	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1282	160	9	Add cabbage and eggplant. Keep stirring and frying	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1283	160	10	Add salt and turmeric. Cover the pan and keep cooking the vegetables on low heat, stirring occasionally (about 15 minutes or so	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1284	160	11	Add sugar, and continue cooking, covered, for another 10 minutes. The salt and sugar will draw water from the vegetables, and allow them to cook in their own juices	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1285	160	12	Finally, garnish with green chillies, chopped coriander leaves, bhaja masala. Cover and rest for a few minutes before serving.	\N	f	2025-04-23 16:57:46.679	2025-04-23 16:57:46.679	\N	\N
1286	161	1	Wash and dry cucumbers, tomatoes, lettuce and cilantro. Peel the cucumbers if they are waxy.	\N	f	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
1287	161	2	Cut cucumbers, tomatoes, lettuce into 1 inch bite sized cubes	\N	f	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
1288	161	3	Add  salt, pepper, olive oil, lemon juice and mix well	\N	f	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
1289	161	4	Garnish with cilantro and serve	\N	f	2025-04-23 16:57:46.683	2025-04-23 16:57:46.683	\N	\N
1290	162	1	Rinse and wash the basmati rice thoroughly	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1291	162	2	Cut onion and carrots into 1 inch cubes. Cut green chilies obliquely into 2 pieces.	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1292	162	3	Heat oil and add pepper, cardamom, cloves, bay leaf, tsp fennel, and cinnamon and saute spices till it turns aromatic	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1293	162	4	Add green chilli, crushed ginger garlic and saute well	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1294	162	5	Add onion and saute till the onion softens slightly	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1295	162	6	Add peas and carrots along with mint,  salt and saute till the mint shrinks slightly	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1296	162	7	Pour in 2 cans of coconut milk ( approx 4 cups) mixed with 4 cups of water and mix it well	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1297	162	8	Once the milk comes to a rolling boil add basmati rice and mix gently	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1298	162	9	Cover and simmer for 20 minutes, or until the rice is cooked well.	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1299	162	10	Fluff gently, and add cilantro. Mix gently. Let the rice sit for sometime before serving so that the flavor enhances.	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1300	162	11	Ref https://hebbarskitchen.com/coconut-milk-pulao-recipe-coconut-rice/#Recipe_Card_for_Coconut_Milk_Pulao	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1301	162	12	https://www.youtube.com/watch?v=CgJfIotmHBA	\N	f	2025-04-23 16:57:46.69	2025-04-23 16:57:46.69	\N	\N
1302	163	1	Fine chop onions and tomatoes, slit chillies, cut veggies in 1/2 inch cubes	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1303	163	2	Make a fresh paste of green chillies, fennel and coconut	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1304	163	3	Heat oil, add bay leaf, cloves, jeera, cardamom untill aromatic	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1305	163	4	Add chopped onions and fry until translucent. Add ginger garlic and saute well	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1306	163	5	Add tomatoes and saute until it gets cooked well	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1307	163	6	Add turmeric powder, salt, chilli powder, garam masala and cilantro and saute for 2-3 mins	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1308	163	7	Add veggies and cook for 3- 5 mins until veggies get cooked	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1309	163	8	Add the ground coconut fennel paste and cook for 2-3 mins until the aromatic	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1310	163	9	Garnish with cilantro	\N	f	2025-04-23 16:57:46.754	2025-04-23 16:57:46.754	\N	\N
1311	164	1	Wash the chana properly 3-4 times and soak over night for at least 8 hours.  Pressure Cook the dal with 1:3 ratio of chana: water.	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1312	164	2	The chana should not get mushy. It was be firm but soft. If you press it between thumb and finger, it should mash easily	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1313	164	3	Heat the oil in a pan on medium heat. Once hot add mustard seeds and let them splutter. Then add urad dal, hing and saute until light brown.	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1314	164	4	Add chopped green chilies, and curry leaves. Saute for 30-40 seconds	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1315	164	5	Add boiled, drained chana and salt. Mix well and cook for 2 minutes.  Add grated coconut, jeera powder and coriander powder mix and cook for a minute	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1316	164	6	Garnish with cilantro	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1317	164	7	PS: The water drained from cooked channa is very healthy. Please use it for something or share and drink as soup :-)	\N	f	2025-04-23 16:57:46.76	2025-04-23 16:57:46.76	\N	\N
1318	165	1	Cut Carrots and cucumbers in to 2 inches long strips and about half inch thick	\N	f	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
1319	165	2	Add salt, black pepper, and mix well	\N	f	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
1320	165	3	Add lemon juice concentrate	\N	f	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
1321	165	4	Garnish with cilantro	\N	f	2025-04-23 16:57:46.764	2025-04-23 16:57:46.764	\N	\N
1322	166	1	Crush the saffron lightly between your finger and soak it in milk and leave aside	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1323	166	2	In some ghee roast the cashews on medium low flame until golden brown and keep aside	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1324	166	3	Heat up some ghee in a pot and roast vermicelli on low to medium flame until golden brown.  keep aside	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1325	166	4	Bring the milk to a boil in a large pot, stirring occassionally.  Once boiling add the roasted vermicelli and mix properly	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1326	166	5	Cook on low flame until vermicelli softens	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1327	166	6	Add the sugar and mix well;  let it simmer until the payasam thickens.  Turn off the heat	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1328	166	7	Add the saffron mixture, cardamom, raosted cashews and mix	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
1329	166	8	Dates served seperately for vegans	\N	f	2025-04-23 16:57:46.767	2025-04-23 16:57:46.767	\N	\N
\.


--
-- Data for Name: ScheduledMeal; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."ScheduledMeal" (scheduled_meal_id, day_id, "time", meal_type, attendee_headcount, volunteer_headcount, menu_id, notes, created_at, updated_at, created_by, last_updated_by) FROM stdin;
14	7	12:00:00	LUNCH	100	40	\N		2025-04-13 15:35:32.83	2025-04-13 15:35:32.83	system	system
16	7	15:00:00	AFTERNOON_SNACK	100	40	\N		2025-04-13 18:56:16.363	2025-04-13 18:56:16.363	system	system
15	7	08:00:00	BREAKFAST	0	40	\N		2025-04-13 18:55:44.044	2025-04-16 02:35:21.957	system	system
\.


--
-- Data for Name: ScheduledMealRecipe; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."ScheduledMealRecipe" (scheduled_meal_recipe_id, scheduled_meal_id, recipe_id, created_at, updated_at) FROM stdin;
3	15	43	2025-04-15 18:38:57.032	2025-04-15 18:38:57.032
\.


--
-- Data for Name: UnitOfMeasure; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."UnitOfMeasure" (uom_id, uom_name, uom_abbreviation, uom_system, uom_type, uom_base_unit_id, uom_conversion_factor, uom_equivalent_id, uom_equivalent_factor, created_at, updated_at, created_by, last_updated_by) FROM stdin;
2	Teaspoon	tsp	US	VOLUME	\N	1	\N	\N	2025-03-15 23:31:14.109	2025-03-16 15:52:59.42	\N	\N
3	Gram	g	METRIC	WEIGHT	\N	1	\N	\N	2025-03-15 23:31:14.112	2025-03-16 15:52:59.422	\N	\N
4	Ounce	oz	US	WEIGHT	\N	1	\N	\N	2025-03-15 23:31:14.114	2025-03-16 15:52:59.424	\N	\N
5	Each	ea	US	COUNT	\N	1	\N	\N	2025-03-15 23:31:14.117	2025-03-16 15:52:59.426	\N	\N
13	Piece	pc	US	COUNT	\N	1	\N	\N	2025-03-16 15:52:59.428	2025-03-16 15:52:59.429	\N	\N
16	Deciliter	dl	METRIC	VOLUME	1	100	\N	\N	2025-03-16 15:52:59.435	2025-03-16 15:52:59.435	\N	\N
17	Centiliter	cl	METRIC	VOLUME	1	10	\N	\N	2025-03-16 15:52:59.437	2025-03-16 15:52:59.437	\N	\N
18	Tablespoon	tbsp	US	VOLUME	2	3	\N	\N	2025-03-16 15:52:59.438	2025-03-16 15:52:59.438	\N	\N
19	Fluid Ounce	fl oz	US	VOLUME	2	6	\N	\N	2025-03-16 15:52:59.44	2025-03-16 15:52:59.44	\N	\N
21	Pint	pt	US	VOLUME	2	96	\N	\N	2025-03-16 15:52:59.443	2025-03-16 15:52:59.443	\N	\N
22	Quart	qt	US	VOLUME	2	192	\N	\N	2025-03-16 15:52:59.444	2025-03-16 15:52:59.444	\N	\N
23	Gallon	gal	US	VOLUME	2	768	\N	\N	2025-03-16 15:52:59.446	2025-03-16 15:52:59.446	\N	\N
25	Milligram	mg	METRIC	WEIGHT	3	0.001	\N	\N	2025-03-16 15:52:59.449	2025-03-16 15:52:59.449	\N	\N
26	Pound	lb	US	WEIGHT	4	16	\N	\N	2025-03-16 15:52:59.45	2025-03-16 15:52:59.45	\N	\N
27	Dozen	doz	US	COUNT	13	12	\N	\N	2025-03-16 15:52:59.451	2025-03-16 15:52:59.451	\N	\N
28	Pair	pr	METRIC	COUNT	13	2	\N	\N	2025-03-16 15:52:59.453	2025-03-16 15:52:59.453	\N	\N
30	Head	head	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.455	2025-03-16 15:52:59.455	\N	\N
31	Clove	clove	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.456	2025-03-16 15:52:59.456	\N	\N
32	Sprig	sprig	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
20	Cup	cup	US	VOLUME	2	48	2	236.588	2025-03-16 15:52:59.441	2025-03-16 15:52:59.463	\N	\N
1	Milliliter	ml	METRIC	VOLUME	\N	1	2	0.035274	2025-03-15 23:31:14.102	2025-03-16 15:52:59.465	\N	\N
24	Kilogram	kg	METRIC	WEIGHT	3	1000	26	2.20462	2025-03-16 15:52:59.447	2025-03-16 15:52:59.466	\N	\N
15	Liter	l	METRIC	VOLUME	1	1000	22	1.05669	2025-03-16 15:52:59.431	2025-03-16 15:52:59.462	\N	\N
33	Packets	packets	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
34	Pieces	pieces	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
35	Loaves	loaves	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
36	Biscuits	biscuits	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
37	Bags	bags	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
29	Bunches	bunches	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.454	2025-03-16 15:52:59.454	\N	\N
38	To Taste	to taste	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
40	As Needed	as needed	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
41	Cans	cans	US	COUNT	13	1	\N	\N	2025-03-16 15:52:59.458	2025-03-16 15:52:59.458	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
feead5e5-d185-40f8-8b7d-83b27a4a7c71	0d12c47455c7989d483dc334a64ba3431264783ee8d140dccf2bdc73c067fb74	2025-03-15 15:52:48.056383-07	20250315225248_update_ingredient_schema_to_int_ids	\N	\N	2025-03-15 15:52:48.005667-07	1
c349f908-1e87-4174-b0c1-a4198e63b159	8fb38ead6bfdbcb02d5764befcbdc7d3dc48c09f14825464c0d5e02cef72dc48	2025-03-18 21:52:39.402648-07	20250319045239_add_recipe_models	\N	\N	2025-03-18 21:52:39.36856-07	1
26579b8d-8cfd-4aed-9f6c-7f090e9e4ad2	765b5debcabf1be3b77c224ee7938142e780890139dc36bd414bba8c421322d3	2025-03-26 22:03:18.773411-07	20250327050318_add_unique_recipe_ingredient_names	\N	\N	2025-03-26 22:03:18.767605-07	1
877c97e5-7656-4eea-a831-18d0519bba03	ec92efbc2e9c797e1babc3f3b12ab8ac8e77474c4d8bbe652cbd9570b1504d1f	2025-03-29 15:37:57.648551-07	20250329223757_add_event	\N	\N	2025-03-29 15:37:57.578543-07	1
cd94e5b0-b73a-46f3-b7f8-dab120bfa6f4	2308a0776af6a76f0866d6673b61c652de949c59029ccb240fd1dbc61e176b30	2025-03-31 17:17:00.526913-07	20250401001700_final_event_planning_models	\N	\N	2025-03-31 17:17:00.521491-07	1
773bc2f3-0a94-498c-836d-922df990c882	eafc25f3a49d8aaaf02e93eb0ae922db17303c61cb4787c194a792e9a02f1eab	2025-04-16 17:20:54.395731-07	20250417002054_add_shopping_status_enums	\N	\N	2025-04-16 17:20:54.312457-07	1
361cd050-5789-47bb-a801-29cf41d83ea9	ed546d33dc000afc904c77406e84e505aa3666a59a73419ccdfd50dd2e08cd94	2025-04-17 22:24:34.173732-07	20250418052434_add_shopping_list_item_order_fields	\N	\N	2025-04-17 22:24:34.170279-07	1
e2218180-404b-4d92-a43a-4652dc96fcaf	f1298d065c9ca5b93a94ae89940e6fed4e8a0253d3a8a734f7c2049c1dd4e2ae	2025-04-24 16:46:38.154773-07	20250424234638_add_auth	\N	\N	2025-04-24 16:46:38.132795-07	1
\.


--
-- Data for Name: password_reset_token; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public.password_reset_token (reset_token_id, user_id, token, expires_at, used_at, created_by, created_at, last_updated_by, updated_at) FROM stdin;
3	1	c6e3fc43a78d5ec72a86b6e24a4d2313f3d9cf4b2078b92803a06121b738887d	2025-04-27 08:35:51.602-07	\N	forgot-password	2025-04-27 07:35:51.605-07	forgot-password	2025-04-27 07:35:51.605-07
4	2	6e93eeaafa85d5547a98025d87ffe925832dd9b5ba4a11f90218de8e64d3514c	2025-05-03 21:11:50.629-07	\N	register	2025-05-02 21:11:50.63-07	register	2025-05-02 21:11:50.63-07
5	3	c60d9535dd4932d0fed341b981851a79322280a7fed6a43a51fef7a44c3c2a70	2025-05-24 14:39:43.037-07	\N	register	2025-05-23 14:39:43.038-07	register	2025-05-23 14:39:43.038-07
6	4	8d69e125ae26e81ccb09849cbbb17b6be202c307c671f219ecd6f8a8ba742631	2025-05-25 10:36:34.796-07	\N	register	2025-05-24 10:36:34.799-07	register	2025-05-24 10:36:34.799-07
\.


--
-- Data for Name: shopping_list; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public.shopping_list (shopping_list_id, event_id, status, generated_at, notes, created_by, created_at, last_updated_by, updated_at) FROM stdin;
1	5	GENERATED	2025-04-24 16:01:01.942-07	\N	system	2025-04-20 09:36:14.479-07	system	2025-04-24 16:01:01.943-07
\.


--
-- Data for Name: shopping_list_item; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public.shopping_list_item (shopping_list_item_id, shopping_list_id, ingredient_id, unit_id, ingredient_name, unit_abbreviation, category_id, category_name, calculated_quantity, purchased_quantity, status, notes, created_by, created_at, last_updated_by, updated_at, "orderPickupDate", "orderedFrom") FROM stdin;
18	1	176	34	Biscuits	pieces	7	Ready to Eat	350	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
19	1	36	20	Rolled Oats	cup	1	Grains & Dry Goods	7.5	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
20	1	190	20	Water	cup	16	Uncategorized	23	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
21	1	3	3	Almonds	g	1	Grains & Dry Goods	250	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
22	1	31	3	Pecans	g	1	Grains & Dry Goods	250	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
23	1	33	3	Raisins	g	1	Grains & Dry Goods	250	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
24	1	181	1	Maple syrup	ml	7	Ready to Eat	125	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
25	1	160	18	Ghee	tbsp	7	Ready to Eat	10	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
26	1	60	3	Chutney podi	g	3	Spices (Dry)	100	\N	NEEDED	\N	system	2025-04-24 16:01:01.947-07	system	2025-04-24 16:01:01.947-07	\N	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: recipe
--

COPY public."user" (user_id, email, name, password, email_verified, status, last_login_at, created_by, created_at, last_updated_by, updated_at) FROM stdin;
1	test.user.1745764547692@example.com	Test User 1745764547692	$2b$10$qBclOgrt3velOQQdTAUZ9e6BHKf1YEjJ/t2M2yyhyWFgowNoJ1sdG	t	ACTIVE	\N	register	2025-04-27 07:35:47.887-07	register	2025-04-27 07:35:47.887-07
3	anita@gmail.com	Anita Sathe	$2b$10$4vHY0wv1W4k/gZ9CEhqXZup0Ay0rZ3AW.hY3kWFSVQZ182e/.u7Aq	t	ACTIVE	2025-05-23 14:48:57.94-07	register	2025-05-23 14:39:43.03-07	login	2025-05-23 14:48:57.94-07
4	anitasathe@gmail.com	Anita Sathe	$2b$10$BN9WtINfZ/PH3RcfsW2cEe7mWAwuvtZ9W5oqY2IU0Ov0Bsn93/rhS	t	ACTIVE	2025-05-24 10:37:20.677-07	register	2025-05-24 10:36:34.793-07	login	2025-05-24 10:37:20.678-07
2	ajay.godbole@hey.com	AJAY GODBOLE	$2b$10$i29IATEAa/Qvf1hj2ZsYAOqWPrxug1oWS/wKaU3t009D7.cjcr3ri	t	ACTIVE	2025-05-25 10:22:27.629-07	register	2025-05-02 21:11:50.621-07	login	2025-05-25 10:22:27.632-07
\.


--
-- Name: EventDayConsumable_event_day_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."EventDayConsumable_event_day_consumable_id_seq"', 4, true);


--
-- Name: EventDay_event_day_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."EventDay_event_day_id_seq"', 9, true);


--
-- Name: Event_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."Event_event_id_seq"', 7, true);


--
-- Name: IngredientAllergen_allergen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientAllergen_allergen_id_seq"', 1, false);


--
-- Name: IngredientCategory_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientCategory_category_id_seq"', 16, true);


--
-- Name: IngredientDensity_density_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientDensity_density_id_seq"', 1, false);


--
-- Name: IngredientDietaryFlag_dietary_flag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientDietaryFlag_dietary_flag_id_seq"', 1, false);


--
-- Name: IngredientSubcategory_subcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientSubcategory_subcategory_id_seq"', 61, true);


--
-- Name: IngredientSubstitute_substitute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."IngredientSubstitute_substitute_id_seq"', 1, false);


--
-- Name: Ingredient_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."Ingredient_ingredient_id_seq"', 239, true);


--
-- Name: MenuRecipe_menu_recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."MenuRecipe_menu_recipe_id_seq"', 6, true);


--
-- Name: Menu_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."Menu_menu_id_seq"', 4, true);


--
-- Name: RecipeIngredient_recipe_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."RecipeIngredient_recipe_ingredient_id_seq"', 2133, true);


--
-- Name: RecipeStep_recipe_step_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."RecipeStep_recipe_step_id_seq"', 1330, true);


--
-- Name: Recipe_recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."Recipe_recipe_id_seq"', 167, true);


--
-- Name: ScheduledMealRecipe_scheduled_meal_recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."ScheduledMealRecipe_scheduled_meal_recipe_id_seq"', 4, true);


--
-- Name: ScheduledMeal_scheduled_meal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."ScheduledMeal_scheduled_meal_id_seq"', 18, true);


--
-- Name: UnitOfMeasure_uom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public."UnitOfMeasure_uom_id_seq"', 41, true);


--
-- Name: password_reset_token_reset_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public.password_reset_token_reset_token_id_seq', 6, true);


--
-- Name: shopping_list_item_shopping_list_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public.shopping_list_item_shopping_list_item_id_seq', 26, true);


--
-- Name: shopping_list_shopping_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public.shopping_list_shopping_list_id_seq', 3, true);


--
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: recipe
--

SELECT pg_catalog.setval('public.user_user_id_seq', 4, true);


--
-- Name: EventDayConsumable EventDayConsumable_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDayConsumable"
    ADD CONSTRAINT "EventDayConsumable_pkey" PRIMARY KEY (event_day_consumable_id);


--
-- Name: EventDay EventDay_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDay"
    ADD CONSTRAINT "EventDay_pkey" PRIMARY KEY (event_day_id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (event_id);


--
-- Name: IngredientAllergen IngredientAllergen_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientAllergen"
    ADD CONSTRAINT "IngredientAllergen_pkey" PRIMARY KEY (allergen_id);


--
-- Name: IngredientCategory IngredientCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientCategory"
    ADD CONSTRAINT "IngredientCategory_pkey" PRIMARY KEY (category_id);


--
-- Name: IngredientDensity IngredientDensity_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDensity"
    ADD CONSTRAINT "IngredientDensity_pkey" PRIMARY KEY (density_id);


--
-- Name: IngredientDietaryFlag IngredientDietaryFlag_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDietaryFlag"
    ADD CONSTRAINT "IngredientDietaryFlag_pkey" PRIMARY KEY (dietary_flag_id);


--
-- Name: IngredientSubcategory IngredientSubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubcategory"
    ADD CONSTRAINT "IngredientSubcategory_pkey" PRIMARY KEY (subcategory_id);


--
-- Name: IngredientSubstitute IngredientSubstitute_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubstitute"
    ADD CONSTRAINT "IngredientSubstitute_pkey" PRIMARY KEY (substitute_id);


--
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (ingredient_id);


--
-- Name: MenuRecipe MenuRecipe_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."MenuRecipe"
    ADD CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY (menu_recipe_id);


--
-- Name: Menu Menu_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_pkey" PRIMARY KEY (menu_id);


--
-- Name: RecipeIngredient RecipeIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY (recipe_ingredient_id);


--
-- Name: RecipeStep RecipeStep_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeStep"
    ADD CONSTRAINT "RecipeStep_pkey" PRIMARY KEY (recipe_step_id);


--
-- Name: Recipe Recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY (recipe_id);


--
-- Name: ScheduledMealRecipe ScheduledMealRecipe_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMealRecipe"
    ADD CONSTRAINT "ScheduledMealRecipe_pkey" PRIMARY KEY (scheduled_meal_recipe_id);


--
-- Name: ScheduledMeal ScheduledMeal_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMeal"
    ADD CONSTRAINT "ScheduledMeal_pkey" PRIMARY KEY (scheduled_meal_id);


--
-- Name: UnitOfMeasure UnitOfMeasure_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."UnitOfMeasure"
    ADD CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY (uom_id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_token password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_pkey PRIMARY KEY (reset_token_id);


--
-- Name: shopping_list_item shopping_list_item_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list_item
    ADD CONSTRAINT shopping_list_item_pkey PRIMARY KEY (shopping_list_item_id);


--
-- Name: shopping_list shopping_list_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list
    ADD CONSTRAINT shopping_list_pkey PRIMARY KEY (shopping_list_id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- Name: EventDayConsumable_day_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDayConsumable_day_id_idx" ON public."EventDayConsumable" USING btree (day_id);


--
-- Name: EventDayConsumable_day_id_ingredient_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "EventDayConsumable_day_id_ingredient_id_key" ON public."EventDayConsumable" USING btree (day_id, ingredient_id);


--
-- Name: EventDayConsumable_ingredient_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDayConsumable_ingredient_id_idx" ON public."EventDayConsumable" USING btree (ingredient_id);


--
-- Name: EventDayConsumable_unit_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDayConsumable_unit_id_idx" ON public."EventDayConsumable" USING btree (unit_id);


--
-- Name: EventDay_date_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDay_date_idx" ON public."EventDay" USING btree (date);


--
-- Name: EventDay_event_id_date_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "EventDay_event_id_date_key" ON public."EventDay" USING btree (event_id, date);


--
-- Name: EventDay_event_id_day_number_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "EventDay_event_id_day_number_key" ON public."EventDay" USING btree (event_id, day_number);


--
-- Name: EventDay_event_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDay_event_id_idx" ON public."EventDay" USING btree (event_id);


--
-- Name: EventDay_phase_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "EventDay_phase_idx" ON public."EventDay" USING btree (phase);


--
-- Name: Event_eventName_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Event_eventName_idx" ON public."Event" USING btree ("eventName");


--
-- Name: Event_eventName_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "Event_eventName_key" ON public."Event" USING btree ("eventName");


--
-- Name: Event_eventType_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Event_eventType_idx" ON public."Event" USING btree ("eventType");


--
-- Name: Event_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Event_start_date_end_date_idx" ON public."Event" USING btree (start_date, end_date);


--
-- Name: Event_status_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Event_status_idx" ON public."Event" USING btree (status);


--
-- Name: IngredientAllergen_ingredient_id_allergen_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientAllergen_ingredient_id_allergen_name_key" ON public."IngredientAllergen" USING btree (ingredient_id, allergen_name);


--
-- Name: IngredientCategory_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientCategory_name_key" ON public."IngredientCategory" USING btree (name);


--
-- Name: IngredientDensity_ingredient_id_volume_unit_id_weight_unit__key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientDensity_ingredient_id_volume_unit_id_weight_unit__key" ON public."IngredientDensity" USING btree (ingredient_id, volume_unit_id, weight_unit_id);


--
-- Name: IngredientDietaryFlag_ingredient_id_flag_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientDietaryFlag_ingredient_id_flag_key" ON public."IngredientDietaryFlag" USING btree (ingredient_id, flag);


--
-- Name: IngredientSubcategory_category_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "IngredientSubcategory_category_id_idx" ON public."IngredientSubcategory" USING btree (category_id);


--
-- Name: IngredientSubcategory_name_category_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientSubcategory_name_category_id_key" ON public."IngredientSubcategory" USING btree (name, category_id);


--
-- Name: IngredientSubstitute_ingredient_id_substitute_ingredient_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "IngredientSubstitute_ingredient_id_substitute_ingredient_id_key" ON public."IngredientSubstitute" USING btree (ingredient_id, substitute_ingredient_id);


--
-- Name: Ingredient_category_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Ingredient_category_id_idx" ON public."Ingredient" USING btree (category_id);


--
-- Name: Ingredient_is_perishable_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Ingredient_is_perishable_idx" ON public."Ingredient" USING btree (is_perishable);


--
-- Name: Ingredient_name_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Ingredient_name_idx" ON public."Ingredient" USING btree (name);


--
-- Name: Ingredient_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "Ingredient_name_key" ON public."Ingredient" USING btree (name);


--
-- Name: Ingredient_storage_type_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Ingredient_storage_type_idx" ON public."Ingredient" USING btree (storage_type);


--
-- Name: Ingredient_subcategory_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Ingredient_subcategory_id_idx" ON public."Ingredient" USING btree (subcategory_id);


--
-- Name: MenuRecipe_menu_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "MenuRecipe_menu_id_idx" ON public."MenuRecipe" USING btree (menu_id);


--
-- Name: MenuRecipe_menu_id_recipe_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "MenuRecipe_menu_id_recipe_id_key" ON public."MenuRecipe" USING btree (menu_id, recipe_id);


--
-- Name: MenuRecipe_recipe_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "MenuRecipe_recipe_id_idx" ON public."MenuRecipe" USING btree (recipe_id);


--
-- Name: Menu_meal_type_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Menu_meal_type_idx" ON public."Menu" USING btree (meal_type);


--
-- Name: Menu_name_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Menu_name_idx" ON public."Menu" USING btree (name);


--
-- Name: Menu_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "Menu_name_key" ON public."Menu" USING btree (name);


--
-- Name: RecipeIngredient_alternate_ingredient_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "RecipeIngredient_alternate_ingredient_id_idx" ON public."RecipeIngredient" USING btree (alternate_ingredient_id);


--
-- Name: RecipeIngredient_ingredient_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "RecipeIngredient_ingredient_id_idx" ON public."RecipeIngredient" USING btree (ingredient_id);


--
-- Name: RecipeIngredient_recipe_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "RecipeIngredient_recipe_id_idx" ON public."RecipeIngredient" USING btree (recipe_id);


--
-- Name: RecipeIngredient_recipe_id_ingredient_id_unit_id_preparatio_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "RecipeIngredient_recipe_id_ingredient_id_unit_id_preparatio_key" ON public."RecipeIngredient" USING btree (recipe_id, ingredient_id, unit_id, preparation);


--
-- Name: RecipeStep_recipe_id_step_number_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "RecipeStep_recipe_id_step_number_idx" ON public."RecipeStep" USING btree (recipe_id, step_number);


--
-- Name: Recipe_course_type_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Recipe_course_type_idx" ON public."Recipe" USING btree (course_type);


--
-- Name: Recipe_has_onion_garlic_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Recipe_has_onion_garlic_idx" ON public."Recipe" USING btree (has_onion_garlic);


--
-- Name: Recipe_is_gluten_free_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Recipe_is_gluten_free_idx" ON public."Recipe" USING btree (is_gluten_free);


--
-- Name: Recipe_is_vegan_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Recipe_is_vegan_idx" ON public."Recipe" USING btree (is_vegan);


--
-- Name: Recipe_name_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "Recipe_name_idx" ON public."Recipe" USING btree (name);


--
-- Name: Recipe_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "Recipe_name_key" ON public."Recipe" USING btree (name);


--
-- Name: ScheduledMealRecipe_recipe_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "ScheduledMealRecipe_recipe_id_idx" ON public."ScheduledMealRecipe" USING btree (recipe_id);


--
-- Name: ScheduledMealRecipe_scheduled_meal_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "ScheduledMealRecipe_scheduled_meal_id_idx" ON public."ScheduledMealRecipe" USING btree (scheduled_meal_id);


--
-- Name: ScheduledMealRecipe_scheduled_meal_id_recipe_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "ScheduledMealRecipe_scheduled_meal_id_recipe_id_key" ON public."ScheduledMealRecipe" USING btree (scheduled_meal_id, recipe_id);


--
-- Name: ScheduledMeal_day_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "ScheduledMeal_day_id_idx" ON public."ScheduledMeal" USING btree (day_id);


--
-- Name: ScheduledMeal_meal_type_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "ScheduledMeal_meal_type_idx" ON public."ScheduledMeal" USING btree (meal_type);


--
-- Name: ScheduledMeal_menu_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "ScheduledMeal_menu_id_idx" ON public."ScheduledMeal" USING btree (menu_id);


--
-- Name: UnitOfMeasure_uom_abbreviation_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "UnitOfMeasure_uom_abbreviation_key" ON public."UnitOfMeasure" USING btree (uom_abbreviation);


--
-- Name: UnitOfMeasure_uom_base_unit_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "UnitOfMeasure_uom_base_unit_id_idx" ON public."UnitOfMeasure" USING btree (uom_base_unit_id);


--
-- Name: UnitOfMeasure_uom_equivalent_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "UnitOfMeasure_uom_equivalent_id_idx" ON public."UnitOfMeasure" USING btree (uom_equivalent_id);


--
-- Name: UnitOfMeasure_uom_name_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX "UnitOfMeasure_uom_name_key" ON public."UnitOfMeasure" USING btree (uom_name);


--
-- Name: UnitOfMeasure_uom_system_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "UnitOfMeasure_uom_system_idx" ON public."UnitOfMeasure" USING btree (uom_system);


--
-- Name: UnitOfMeasure_uom_type_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX "UnitOfMeasure_uom_type_idx" ON public."UnitOfMeasure" USING btree (uom_type);


--
-- Name: password_reset_token_expires_at_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX password_reset_token_expires_at_idx ON public.password_reset_token USING btree (expires_at);


--
-- Name: password_reset_token_token_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX password_reset_token_token_idx ON public.password_reset_token USING btree (token);


--
-- Name: password_reset_token_token_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX password_reset_token_token_key ON public.password_reset_token USING btree (token);


--
-- Name: password_reset_token_user_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX password_reset_token_user_id_idx ON public.password_reset_token USING btree (user_id);


--
-- Name: shopping_list_event_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX shopping_list_event_id_idx ON public.shopping_list USING btree (event_id);


--
-- Name: shopping_list_event_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX shopping_list_event_id_key ON public.shopping_list USING btree (event_id);


--
-- Name: shopping_list_item_category_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX shopping_list_item_category_id_idx ON public.shopping_list_item USING btree (category_id);


--
-- Name: shopping_list_item_ingredient_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX shopping_list_item_ingredient_id_idx ON public.shopping_list_item USING btree (ingredient_id);


--
-- Name: shopping_list_item_shopping_list_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX shopping_list_item_shopping_list_id_idx ON public.shopping_list_item USING btree (shopping_list_id);


--
-- Name: shopping_list_item_shopping_list_id_ingredient_id_unit_id_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX shopping_list_item_shopping_list_id_ingredient_id_unit_id_key ON public.shopping_list_item USING btree (shopping_list_id, ingredient_id, unit_id);


--
-- Name: shopping_list_item_unit_id_idx; Type: INDEX; Schema: public; Owner: recipe
--

CREATE INDEX shopping_list_item_unit_id_idx ON public.shopping_list_item USING btree (unit_id);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: recipe
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: EventDayConsumable EventDayConsumable_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDayConsumable"
    ADD CONSTRAINT "EventDayConsumable_day_id_fkey" FOREIGN KEY (day_id) REFERENCES public."EventDay"(event_day_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventDayConsumable EventDayConsumable_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDayConsumable"
    ADD CONSTRAINT "EventDayConsumable_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventDayConsumable EventDayConsumable_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDayConsumable"
    ADD CONSTRAINT "EventDayConsumable_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventDay EventDay_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."EventDay"
    ADD CONSTRAINT "EventDay_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public."Event"(event_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IngredientAllergen IngredientAllergen_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientAllergen"
    ADD CONSTRAINT "IngredientAllergen_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IngredientDensity IngredientDensity_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDensity"
    ADD CONSTRAINT "IngredientDensity_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientDensity IngredientDensity_volume_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDensity"
    ADD CONSTRAINT "IngredientDensity_volume_unit_id_fkey" FOREIGN KEY (volume_unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientDensity IngredientDensity_weight_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDensity"
    ADD CONSTRAINT "IngredientDensity_weight_unit_id_fkey" FOREIGN KEY (weight_unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientDietaryFlag IngredientDietaryFlag_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientDietaryFlag"
    ADD CONSTRAINT "IngredientDietaryFlag_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IngredientSubcategory IngredientSubcategory_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubcategory"
    ADD CONSTRAINT "IngredientSubcategory_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."IngredientCategory"(category_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientSubstitute IngredientSubstitute_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubstitute"
    ADD CONSTRAINT "IngredientSubstitute_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientSubstitute IngredientSubstitute_substitute_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."IngredientSubstitute"
    ADD CONSTRAINT "IngredientSubstitute_substitute_ingredient_id_fkey" FOREIGN KEY (substitute_ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ingredient Ingredient_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."IngredientCategory"(category_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ingredient Ingredient_default_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_default_unit_id_fkey" FOREIGN KEY (default_unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ingredient Ingredient_package_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_package_unit_id_fkey" FOREIGN KEY (package_unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ingredient Ingredient_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_subcategory_id_fkey" FOREIGN KEY (subcategory_id) REFERENCES public."IngredientSubcategory"(subcategory_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MenuRecipe MenuRecipe_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."MenuRecipe"
    ADD CONSTRAINT "MenuRecipe_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public."Menu"(menu_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MenuRecipe MenuRecipe_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."MenuRecipe"
    ADD CONSTRAINT "MenuRecipe_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES public."Recipe"(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecipeIngredient RecipeIngredient_alternate_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_alternate_ingredient_id_fkey" FOREIGN KEY (alternate_ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RecipeIngredient RecipeIngredient_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RecipeIngredient RecipeIngredient_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES public."Recipe"(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecipeIngredient RecipeIngredient_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RecipeStep RecipeStep_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."RecipeStep"
    ADD CONSTRAINT "RecipeStep_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES public."Recipe"(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduledMealRecipe ScheduledMealRecipe_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMealRecipe"
    ADD CONSTRAINT "ScheduledMealRecipe_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES public."Recipe"(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduledMealRecipe ScheduledMealRecipe_scheduled_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMealRecipe"
    ADD CONSTRAINT "ScheduledMealRecipe_scheduled_meal_id_fkey" FOREIGN KEY (scheduled_meal_id) REFERENCES public."ScheduledMeal"(scheduled_meal_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduledMeal ScheduledMeal_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMeal"
    ADD CONSTRAINT "ScheduledMeal_day_id_fkey" FOREIGN KEY (day_id) REFERENCES public."EventDay"(event_day_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduledMeal ScheduledMeal_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."ScheduledMeal"
    ADD CONSTRAINT "ScheduledMeal_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public."Menu"(menu_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnitOfMeasure UnitOfMeasure_uom_base_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."UnitOfMeasure"
    ADD CONSTRAINT "UnitOfMeasure_uom_base_unit_id_fkey" FOREIGN KEY (uom_base_unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnitOfMeasure UnitOfMeasure_uom_equivalent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public."UnitOfMeasure"
    ADD CONSTRAINT "UnitOfMeasure_uom_equivalent_id_fkey" FOREIGN KEY (uom_equivalent_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: password_reset_token password_reset_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shopping_list shopping_list_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list
    ADD CONSTRAINT shopping_list_event_id_fkey FOREIGN KEY (event_id) REFERENCES public."Event"(event_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shopping_list_item shopping_list_item_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list_item
    ADD CONSTRAINT shopping_list_item_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public."Ingredient"(ingredient_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shopping_list_item shopping_list_item_shopping_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list_item
    ADD CONSTRAINT shopping_list_item_shopping_list_id_fkey FOREIGN KEY (shopping_list_id) REFERENCES public.shopping_list(shopping_list_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shopping_list_item shopping_list_item_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: recipe
--

ALTER TABLE ONLY public.shopping_list_item
    ADD CONSTRAINT shopping_list_item_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public."UnitOfMeasure"(uom_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: recipe
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

