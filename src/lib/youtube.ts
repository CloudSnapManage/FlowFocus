
'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetches the transcript for a given YouTube video URL.
 * @param url The URL of the YouTube video.
 * @returns The full transcript as a single string.
 * @throws An error if the transcript cannot be fetched.
 */
export async function getYouTubeTranscript(url: string): Promise<string> {
  try {
    // Explicitly request the English ('en') transcript.
    // This helps ensure that we get a transcript even if it's auto-generated,
    // and avoids issues with server-side locale detection.
    const transcript = await YoutubeTranscript.fetchTranscript(url, {
      lang: 'en',
      country: 'US',
    });
    
    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript content found for this video.");
    }
    
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error("Failed to fetch YouTube transcript:", error);

    if (error instanceof Error) {
      // This handles cases where subtitles are explicitly disabled.
      if (error.message.includes('subtitles are disabled')) {
         throw new Error("Could not retrieve transcript because subtitles are disabled for this video.");
      }
      // This handles cases where the library can't find a transcript at all or it's empty.
      if (error.message.includes('Could not find a transcript') || error.message.includes('No transcript content found')) {
          throw new Error("No English transcript could be found for this video. The creator may have disabled them.");
      }
    }
    
    // A more informative fallback error for other network or unexpected issues.
    throw new Error("Failed to process the YouTube URL. The video might be private, unavailable, or have been deleted.");
  }
}
