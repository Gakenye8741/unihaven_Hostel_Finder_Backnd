CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed');--> statement-breakpoint
CREATE TYPE "public"."gender_policy" AS ENUM('Male Only', 'Female Only', 'Mixed');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('Image', 'Video');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('Single', 'Bedsitter', 'One Bedroom', 'Double');--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(50),
	CONSTRAINT "amenities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studentId" uuid NOT NULL,
	"roomId" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'Pending',
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hostelAmenities" (
	"hostelId" uuid NOT NULL,
	"amenity_id" uuid NOT NULL,
	CONSTRAINT "hostelAmenities_hostelId_amenity_id_pk" PRIMARY KEY("hostelId","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "hostelMedia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostelId" uuid NOT NULL,
	"url" text NOT NULL,
	"type" "media_type" DEFAULT 'Image',
	"isThumbnail" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hostels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"campus" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"description" text,
	"policy" "gender_policy" DEFAULT 'Mixed' NOT NULL,
	"isVerified" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bookingId" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"mpesaCode" varchar(50),
	"status" "payment_status" DEFAULT 'Pending',
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "payments_mpesaCode_unique" UNIQUE("mpesaCode")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"hostelId" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostelId" uuid NOT NULL,
	"label" varchar(50) NOT NULL,
	"type" "room_type" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"totalSlots" integer NOT NULL,
	"occupiedSlots" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "meetingAttendees" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meetings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "signatures" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "topics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "meetingAttendees" CASCADE;--> statement-breakpoint
DROP TABLE "meetings" CASCADE;--> statement-breakpoint
DROP TABLE "signatures" CASCADE;--> statement-breakpoint
DROP TABLE "topics" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Student'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Student', 'Owner', 'Admin', 'Caretaker');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Student'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "confirmation_code" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "confirmation_code_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "visibility" varchar(50) DEFAULT 'PUBLIC';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studentId_users_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostelAmenities" ADD CONSTRAINT "hostelAmenities_hostelId_hostels_id_fk" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostelAmenities" ADD CONSTRAINT "hostelAmenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostelMedia" ADD CONSTRAINT "hostelMedia_hostelId_hostels_id_fk" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hostelId_hostels_id_fk" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hostelId_hostels_id_fk" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "fullName";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "isActive";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "createdAt";--> statement-breakpoint
DROP TYPE "public"."attendance_status";