ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_hostelId_hostels_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "ownerReply" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "repliedAt" timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "isVerified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "helpfulCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hostelId_hostels_id_fk" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_hostelId_unique" UNIQUE("userId","hostelId");