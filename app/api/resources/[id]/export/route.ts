import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ApiErrorResponse } from "@/lib/api/types";
import { buildResourcePackage } from "@/lib/resource-package";

// Building a resource package fetches every page audio from MinIO and zips
// them in-memory; give it room.
export const maxDuration = 300;

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

    let pkg;
    try {
      pkg = await buildResourcePackage(id, userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Resource not found") {
        return NextResponse.json(
          { error: message } as ApiErrorResponse,
          { status: 404 }
        );
      }
      if (message === "Forbidden") {
        return NextResponse.json(
          { error: message } as ApiErrorResponse,
          { status: 403 }
        );
      }
      throw error;
    }

    const ab = pkg.buffer.buffer.slice(
      pkg.buffer.byteOffset,
      pkg.buffer.byteOffset + pkg.buffer.byteLength
    ) as ArrayBuffer;

    return new NextResponse(ab, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(pkg.buffer.byteLength),
        "Content-Disposition": `attachment; filename="${pkg.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error exporting resource:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
