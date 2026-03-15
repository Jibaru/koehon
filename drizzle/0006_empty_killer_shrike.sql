CREATE TABLE "user_api_keys" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"provider" varchar(50) DEFAULT 'openai' NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_api_keys_user_id_provider_unique" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys" USING btree ("user_id");