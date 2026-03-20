import { createOpenAI } from "@ai-sdk/openai";
import { experimental_generateSpeech, generateText } from "ai";
import { OpenAI } from "openai";
import { extractPage } from "@/lib/pdf-utils.server";
import { AudioGenerator, Extractor, Translator } from "./interfaces";

/**
 * Create an OpenAI client instance
 * Uses custom API key if provided, otherwise falls back to default
 */
function getOpenAIClient(customApiKey?: string): OpenAI {
  return new OpenAI({
    apiKey: customApiKey || process.env.OPENAI_API_KEY,
  });
}

/**
 * Create an AI SDK OpenAI provider instance
 * Uses custom API key if provided, otherwise falls back to default
 */
function getAISDKProvider(customApiKey?: string) {
  return createOpenAI({
    apiKey: customApiKey || process.env.OPENAI_API_KEY,
  });
}

export class OpenAiExtractor implements Extractor {
  constructor(private customApiKey?: string) { }

  async extractPageTextWithImages(
    pdfFile: File,
    pageNumber: number,
  ): Promise<string> {
    const client = getOpenAIClient(this.customApiKey);
    const pageBlob = await extractPage(pdfFile, pageNumber);
    const buffer = Buffer.from(await pageBlob.arrayBuffer());
    const base64Pdf = buffer.toString("base64");

    const response = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `<role>You are an expert PDF text extraction assistant</role>
  <task>
  Extract all content from this PDF page while preserving the exact order and structure as it appears.
  </task>
  <instructions>
  1. Process the page from top to bottom, left to right, exactly as it appears
  2. For text content: Extract the exact text maintaining original formatting
  3. For non-text elements (figures, charts, diagrams, images): Describe them using the format: [IMAGE: detailed description]
  4. Maintain the sequential order of all elements
  5. Do not include headers or footer elements
  </instructions>
  <output_format>
  Return the content in the exact order it appears, with text as-is and non-text elements described as [IMAGE: description].
  </output_format>`,
            },
            {
              type: "input_file",
              filename: `page-${pageNumber}.pdf`,
              file_data: `data:application/pdf;base64,${base64Pdf}`,
            },
          ],
        },
      ],
    });

    return response.output
      .filter((item) => item.type === "message")
      .map((item) => {
        return item.content
          .map((content) => {
            if (content.type === "output_text") {
              return content.text;
            }
            return "";
          })
          .join("\n");
      })
      .join("\n");
  }
}

export class OpenAiTranslator implements Translator {
  constructor(private customApiKey?: string) { }

  async translateText(
    text: string,
    targetLanguage: string,
  ): Promise<string> {
    if (!text) throw new Error("No text provided for translation.");

    const openaiProvider = getAISDKProvider(this.customApiKey);

    const { text: translated } = await generateText({
      model: openaiProvider("gpt-4o-mini"),
      prompt: `<role>You are an expert translator</role>
  <task>Translate the input text to ${targetLanguage} language.</task>
  <input>${text}</input>
  <output>Only retrieve the translated text. Preserve [IMAGE: ...] descriptions as-is.</output>`,
    });

    return translated.trim();
  }
}

export class OpenAiAudioGenerator implements AudioGenerator {
  constructor(private customApiKey?: string) { }

  async generateAudio(
    text: string,
  ): Promise<Blob> {
    const openaiProvider = getAISDKProvider(this.customApiKey);

    const audio = await experimental_generateSpeech({
      model: openaiProvider.speech("gpt-4o-mini-tts"),
      text: text,
      voice: "alloy",
    });

    const uint8Array = await audio.audio.uint8Array;
    return new Blob([new Uint8Array(uint8Array)], { type: "audio/mpeg" });
  }
}
