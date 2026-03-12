import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type {
  CreateResourceResponse,
  ResourceResponse,
  ApiErrorResponse,
} from "@/lib/api/types";
import { uploadFile, generateObjectName } from "@/lib/storage/minio";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized",
      } as ApiErrorResponse, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const language = formData.get("language") as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "File is required" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Language is required" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Generate unique object name for the file
    const objectName = generateObjectName(userId, file.name);

    // Upload file to MinIO
    const { url, etag } = await uploadFile(file, objectName);

    console.log("File uploaded to MinIO:", {
      name: file.name,
      objectName,
      url,
      etag,
      language,
      userId,
    });

    // Save resource to database
    const [dbResource] = await db
      .insert(resources)
      .values({
        title: file.name.replace(".pdf", ""),
        pdfUrl: url,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        userId,
        language,
      })
      .returning();

    // Create typed resource response
    const resource: ResourceResponse = {
      id: dbResource.id,
      title: dbResource.title,
      pdfUrl: dbResource.pdfUrl,
      coverUrl: dbResource.coverUrl,
      language: dbResource.language,
      userId: dbResource.userId,
      createdAt: dbResource.createdAt.toISOString(),
      updatedAt: dbResource.updatedAt.toISOString(),
    };

    // Return typed success response
    const response: CreateResourceResponse = {
      success: true,
      resource,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
