ALTER TABLE "reviews" ADD COLUMN "isFlagged" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "reportReason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "rating_check" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5);