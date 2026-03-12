import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const resources = pgTable("resources", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar("title", { length: 255 }).notNull(),
  pdfUrl: varchar("pdf_url", { length: 512 }).notNull(),
  coverUrl: varchar("cover_url", { length: 512 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
