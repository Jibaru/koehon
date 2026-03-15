CREATE TABLE "bookmarks" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"resource_id" varchar(21) NOT NULL,
	"name" varchar(255) NOT NULL,
	"page" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmarks_resource_id_idx" ON "bookmarks" USING btree ("resource_id");