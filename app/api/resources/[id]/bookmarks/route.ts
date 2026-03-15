import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { bookmarks, resources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ApiErrorResponse } from "@/lib/api/types";

// GET: Get all bookmarks for a resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify the resource belongs to the user
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" } as ApiErrorResponse,
        { status: 404 }
      );
    }

    if (resource.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 403 }
      );
    }

    // Get all bookmarks for this resource
    const resourceBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.resourceId, id));

    return NextResponse.json(
      {
        bookmarks: resourceBookmarks.map((b) => ({
          id: b.id,
          resourceId: b.resourceId,
          name: b.name,
          page: b.page,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

// POST: Create a new bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify the resource belongs to the user
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" } as ApiErrorResponse,
        { status: 404 }
      );
    }

    if (resource.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { page, name } = body;

    if (!page || typeof page !== "number") {
      return NextResponse.json(
        { error: "Page is required and must be a number" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Check if bookmark already exists for this page
    const [existingBookmark] = await db
      .select()
      .from(bookmarks)
      .where(
        and(eq(bookmarks.resourceId, id), eq(bookmarks.page, page))
      )
      .limit(1);

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark already exists for this page" } as ApiErrorResponse,
        { status: 409 }
      );
    }

    // Create bookmark
    const [newBookmark] = await db
      .insert(bookmarks)
      .values({
        resourceId: id,
        page,
        name,
      })
      .returning();

    return NextResponse.json(
      {
        bookmark: {
          id: newBookmark.id,
          resourceId: newBookmark.resourceId,
          name: newBookmark.name,
          page: newBookmark.page,
          createdAt: newBookmark.createdAt.toISOString(),
          updatedAt: newBookmark.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
