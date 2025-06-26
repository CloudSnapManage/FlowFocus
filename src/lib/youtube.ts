
'use server';

import { YouTubeTranscript } from 'youtube-transcript';

/**
 * Fetches the transcript for a given YouTube video URL.
 * @param url The URL of the YouTube video.
 * @returns The full transcript as a single string.
 * @throws An error if the transcript cannot be fetched.
 */
export async function getYouTubeTranscript(url: string): Promise<string> {
  try {
    const transcript = await YouTubeTranscript.fetchTranscript(url);
    
    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript found for this video.");
    }
    
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error("Failed to fetch YouTube transcript:", error);

    if (error instanceof Error && error.message.includes('subtitles are disabled')) {
         throw new Error("Could not retrieve transcript. Subtitles may be disabled for this video.");
    }
    
    throw new Error("Failed to process YouTube URL. Please ensure it's a valid video link.");
  }
}
