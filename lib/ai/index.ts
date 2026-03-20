import { GeminiAudioGenerator, GeminiTranslator } from "./gemini";
import { AudioGenerator, Extractor, Translator } from "./interfaces";
import { OpenAiAudioGenerator, OpenAiExtractor, OpenAiTranslator } from "./openai";

export function newExtractor(provider: string, customApiKey?: string): Extractor {
  switch (provider) {
    case "openai":
      return new OpenAiExtractor(customApiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function newTranslator(provider: string, customApiKey?: string): Translator {
  switch (provider) {
    case "gemini":
      return new GeminiTranslator(customApiKey);
    case "openai":
      return new OpenAiTranslator(customApiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function newAudioGenerator(provider: string, customApiKey?: string): AudioGenerator {
  switch (provider) {
    case "gemini":
      return new GeminiAudioGenerator(customApiKey);
    case "openai":
      return new OpenAiAudioGenerator(customApiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
