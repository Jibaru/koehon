CREATE TABLE "resource_pages" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"resource_id" varchar(21) NOT NULL,
	"page" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"audio_url" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource_pages" ADD CONSTRAINT "resource_pages_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;