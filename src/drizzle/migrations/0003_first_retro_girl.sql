CREATE TYPE "public"."billing_cycle" AS ENUM('Per Month', 'Per Semester');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('Available', 'Full', 'Maintenance');--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."room_type";--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('Single', 'Bedsitter', 'One Bedroom', 'Two Bedroom');--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "type" SET DATA TYPE "public"."room_type" USING "type"::"public"."room_type";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "floor" varchar(20);--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "block" varchar(50);--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "billingCycle" "billing_cycle" DEFAULT 'Per Semester' NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "status" "room_status" DEFAULT 'Available';