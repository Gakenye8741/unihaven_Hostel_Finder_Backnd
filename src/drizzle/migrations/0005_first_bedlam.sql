CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whatsapp_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_identity_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id_front_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id_back_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_verification_status" "verification_status" DEFAULT 'NOT_SUBMITTED';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_remarks" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id_number" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL;