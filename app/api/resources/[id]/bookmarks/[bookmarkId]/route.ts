import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { bookmarks, resources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ApiErrorResponse } from "@/lib/api/types";

// DELETE: Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookmarkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { id, bookmarkId } = await params;

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

    // Delete the bookmark
    const deleted = await db
      .delete(bookmarks)
      .where(
        and(eq(bookmarks.id, bookmarkId), eq(bookmarks.resourceId, id))
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" } as ApiErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
