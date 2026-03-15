import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userApiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ApiErrorResponse } from "@/lib/api/types";
import { encrypt, decrypt } from "@/lib/encryption";

// GET - Retrieve user's API keys (masked)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const apiKeys = await db
      .select({
        id: userApiKeys.id,
        provider: userApiKeys.provider,
        apiKey: userApiKeys.apiKey,
        createdAt: userApiKeys.createdAt,
        updatedAt: userApiKeys.updatedAt,
      })
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId));

    // Decrypt and mask API keys for security (show only last 4 characters)
    const maskedKeys = apiKeys.map((key) => {
      try {
        const decryptedKey = decrypt(key.apiKey);
        return {
          ...key,
          apiKey: `sk-...${decryptedKey.slice(-4)}`,
          apiKeyMasked: true,
        };
      } catch (error) {
        console.error("Error decrypting API key:", error);
        return {
          ...key,
          apiKey: "sk-...****",
          apiKeyMasked: true,
        };
      }
    });

    return NextResponse.json({ apiKeys: maskedKeys }, { status: 200 });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

// POST - Create or update API key
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    const { apiKey, provider = "openai" } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Validate OpenAI API key format
    if (provider === "openai" && !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format" } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(apiKey);

    // Check if user already has an API key for this provider
    const [existingKey] = await db
      .select()
      .from(userApiKeys)
      .where(and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)))
      .limit(1);

    if (existingKey) {
      // Update existing key
      const [updatedKey] = await db
        .update(userApiKeys)
        .set({
          apiKey: encryptedApiKey,
          updatedAt: new Date(),
        })
        .where(eq(userApiKeys.id, existingKey.id))
        .returning();

      return NextResponse.json(
        {
          message: "API key updated successfully",
          apiKey: {
            id: updatedKey.id,
            provider: updatedKey.provider,
            apiKey: `sk-...${apiKey.slice(-4)}`,
            apiKeyMasked: true,
            createdAt: updatedKey.createdAt.toISOString(),
            updatedAt: updatedKey.updatedAt.toISOString(),
          },
        },
        { status: 200 }
      );
    } else {
      // Create new key
      const [newKey] = await db
        .insert(userApiKeys)
        .values({
          userId,
          apiKey: encryptedApiKey,
          provider,
        })
        .returning();

      return NextResponse.json(
        {
          message: "API key created successfully",
          apiKey: {
            id: newKey.id,
            provider: newKey.provider,
            apiKey: `sk-...${apiKey.slice(-4)}`,
            apiKeyMasked: true,
            createdAt: newKey.createdAt.toISOString(),
            updatedAt: newKey.updatedAt.toISOString(),
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating/updating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

// DELETE - Remove API key
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "openai";

    const deleted = await db
      .delete(userApiKeys)
      .where(and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "API key not found" } as ApiErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "API key deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
