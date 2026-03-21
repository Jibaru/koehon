import { GoogleGenAI, Modality } from "@google/genai";
import { AudioGenerator, Translator } from "./interfaces";

export class GeminiTranslator extends Translator {
  constructor(private customApiKey?: string) {
    super();
  }

  async translateText(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    if (!text) throw new Error("No text provided for translation.");

    const ai = new GoogleGenAI({ apiKey: this.customApiKey || process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: this.instructions(text, targetLanguage),
        }]
      },
    });

    const translated = response.text;
    if (!translated) {
      throw new Error("No translation received from Gemini");
    }

    return translated.trim();
  }
}

export class GeminiAudioGenerator extends AudioGenerator {
  constructor(private customApiKey?: string) {
    super();
  }

  async generateAudio(
    text: string,
    _: string,
  ): Promise<Blob> {
    const ai = new GoogleGenAI({ apiKey: this.customApiKey || process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error("No audio data received from Gemini");
    }

    const rawBytes = this.decodeBase64(audioData);
    const blob = new Blob([rawBytes], { type: 'audio/mpeg' });

    return blob;
  }

  decodeBase64(base64: string): Uint8Array<ArrayBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
