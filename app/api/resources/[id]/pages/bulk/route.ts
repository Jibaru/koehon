import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resourcePages, resources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ApiErrorResponse, BulkGeneratePagesResponse } from "@/lib/api/types";
import {
  extractPageTextWithImages,
  translateText,
  generateAudio,
} from "@/lib/openai";
import { fetchPdfAsFile } from "@/lib/pdf-utils.server";
import { uploadFile, generateObjectName } from "@/lib/storage/minio";

interface BulkPageRequest {
  pages: Array<{
    page: number;
    language: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
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
    const body = (await request.json()) as BulkPageRequest;

    if (!body.pages || !Array.isArray(body.pages) || body.pages.length === 0) {
      return NextResponse.json(
        { error: "Pages array is required" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Fetch PDF file
    const pdfFile = await fetchPdfAsFile(resource.pdfUrl);

    // Fetch all existing pages for this resource in one query
    const existingPages = await db
      .select({
        page: resourcePages.page,
        language: resourcePages.language,
      })
      .from(resourcePages)
      .where(eq(resourcePages.resourceId, id));

    // Create a map for quick lookup: "page-language" -> true
    const existingPagesMap = new Map(
      existingPages.map((p) => [`${p.page}-${p.language}`, true])
    );

    const createdPages = [];
    const errors: Array<{ page: number; language: string; error: string }> = [];

    for (const pageRequest of body.pages) {
      const { page, language } = pageRequest;

      // Check if page already exists using the map
      if (existingPagesMap.has(`${page}-${language}`)) {
        console.log(
          `Page ${page} with language ${language} already exists, skipping`
        );
        continue;
      }

      try {
        // 1. Extract text from PDF page using OpenAI (with image descriptions)
        const extractedText = await extractPageTextWithImages(pdfFile, page);

        // 2. Translate text to target language
        const translatedText = await translateText(extractedText, language);

        // 3. Convert translated text to audio using OpenAI TTS
        const audioBlob = await generateAudio(translatedText);

        // 4. Upload audio to MinIO
        const audioFile = new File(
          [audioBlob],
          `${resource.id}-page-${page}-${language}.mp3`,
          { type: "audio/mpeg" }
        );
        const audioObjectName = generateObjectName(userId, audioFile.name);
        const { url: audioUrl } = await uploadFile(audioFile, audioObjectName);

        // 5. Store resource page in database
        const [newPage] = await db
          .insert(resourcePages)
          .values({
            resourceId: id,
            page,
            language,
            content: translatedText,
            audioUrl,
          })
          .returning();

        createdPages.push({
          id: newPage.id,
          resourceId: newPage.resourceId,
          page: newPage.page,
          language: newPage.language,
          content: newPage.content,
          audioUrl: newPage.audioUrl,
          createdAt: newPage.createdAt.toISOString(),
          updatedAt: newPage.updatedAt.toISOString(),
        });

        console.log(`Created page ${page} with language ${language}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Error processing page ${page} with language ${language}:`,
          error
        );
        errors.push({ page, language, error: errorMessage });
      }
    }

    return NextResponse.json(
      {
        success: true,
        pages: createdPages,
        errors: errors.length > 0 ? errors : undefined,
      } as BulkGeneratePagesResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error bulk creating resource pages:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
