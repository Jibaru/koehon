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
  abstract generateAudio(text: string): Promise<Blob>;
}
