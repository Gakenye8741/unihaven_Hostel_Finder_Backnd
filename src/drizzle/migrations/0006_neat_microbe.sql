ALTER TABLE "users" ADD COLUMN "passport_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "managed_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_managed_by_users_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;