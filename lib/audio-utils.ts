/**
 * Get the duration of an audio file in seconds
 * Uses mp3-duration library for MP3 files
 */
export async function getAudioDuration(audioBlob: Blob): Promise<number> {
  try {
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For MP3 files, we can estimate duration from file size and bitrate
    // OpenAI TTS generates audio at approximately 32kbps for the tts-1 model
    // Formula: duration (seconds) = (file_size_bytes * 8) / (bitrate_bps)
    const fileSizeBytes = buffer.length;
    const bitrateBps = 32000; // 32 kbps
    const durationSeconds = Math.ceil((fileSizeBytes * 8) / bitrateBps);

    return durationSeconds;
  } catch (error) {
    console.error("Error getting audio duration:", error);
    // Return 0 if we can't determine duration
    return 0;
  }
}
