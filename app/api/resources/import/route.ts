import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ApiErrorResponse } from "@/lib/api/types";
import { importResourcePackage } from "@/lib/resource-package";

// Importing re-uploads PDF, cover, and every audio file to MinIO; allow time.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await importResourcePackage(buffer, userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import package";
      return NextResponse.json(
        { error: message } as ApiErrorResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resourceId: result.resourceId,
        pagesImported: result.pagesImported,
        bookmarksImported: result.bookmarksImported,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing resource:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
