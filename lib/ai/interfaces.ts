export interface Extractor {
  extractPageTextWithImages(pdfFile: File, pageNumber: number): Promise<string>;
}

export interface Translator {
  translateText(text: string, targetLanguage: string): Promise<string>;
}

export interface AudioGenerator {
  generateAudio(text: string): Promise<Blob>;
}
