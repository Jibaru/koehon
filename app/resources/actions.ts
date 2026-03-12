"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";

export interface GetResourcesResult {
  resources: Array<{
    id: string;
    title: string;
    coverUrl: string;
    pdfUrl: string;
    language: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  totalPages: number;
}

export async function getResources(
  page: number = 1
): Promise<GetResourcesResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const limit = 10;
  const offset = (page - 1) * limit;

  // Get total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(resources)
    .where(eq(resources.userId, userId));

  // Get paginated resources
  const userResources = await db
    .select()
    .from(resources)
    .where(eq(resources.userId, userId))
    .orderBy(desc(resources.createdAt))
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    resources: userResources,
    total,
    totalPages,
  };
}
