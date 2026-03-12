CREATE TABLE "resources" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"pdf_url" varchar(512) NOT NULL,
	"cover_url" varchar(512) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"language" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
