import { LANGUAGES } from "../config/languages";

export abstract class Extractor {
  abstract extractPageTextWithImages(pdfFile: File, pageNumber: number): Promise<string>;

  instructions(): string {
    return `<role>You are an expert PDF text extraction assistant</role>
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
</output_format>`;
  }
}

export abstract class Translator {
  abstract translateText(text: string, targetLanguage: string): Promise<string>;

  instructions(text: string, targetLanguage: string): string {
    return `<role>You are an expert translator</role>
<task>Translate the input text to ${targetLanguage} language.</task>
<input>${text}</input>
<output>Only retrieve the translated text. Preserve [IMAGE: ...] descriptions as-is.</output>`;
  }
}

export abstract class AudioGenerator {
  abstract generateAudio(text: string, targetLanguage: string): Promise<Blob>;

  instructions(targetLanguage: string): string {
    switch (targetLanguage) {
      case LANGUAGES.ENGLISH:
        return `Speak in a calm, warm, and engaging audiobook narration style.
Use a steady, natural pace—not too fast, allowing the listener to follow comfortably.
Add subtle pauses between sentences and slightly longer pauses between paragraphs.
Emphasize important words gently, without sounding exaggerated.
Maintain a smooth and expressive tone, conveying emotion where appropriate.
Avoid sounding robotic or overly energetic; keep it relaxed and immersive.
Pronounce words clearly and articulate each sentence carefully.`;
      case LANGUAGES.SPANISH:
        return `Narra el audiolibro con un estilo tranquilo, cálido y cautivador.
Utiliza un ritmo constante y natural, sin acelerar demasiado, para que el oyente pueda seguir la narración cómodamente.
Incluye pausas sutiles entre oraciones y pausas ligeramente más largas entre párrafos.
Enfatiza las palabras importantes con delicadeza, sin exagerar.
Mantén un tono suave y expresivo, transmitiendo emoción cuando sea apropiado.
Evita sonar robótico o demasiado enérgico; mantén un tono relajado y envolvente.
Pronuncia las palabras con claridad y articula cada oración con precisión.`;
      default:
        throw new Error(`Unsupported target language: ${targetLanguage}`);
    }
  }
}
