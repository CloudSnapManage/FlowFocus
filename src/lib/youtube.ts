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
    // Attempt to fetch the transcript, explicitly asking for English.
    const transcript = await YoutubeTranscript.fetchTranscript(url, {
      lang: 'en',
      country: 'US',
    });
    
    // If the library returns an empty array, it means no content was found.
    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript content found for this video.");
    }
    
    // Join the text segments into a single string.
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    // Log the actual technical error for debugging purposes.
    console.error("Failed to fetch YouTube transcript:", error);

    // Provide a single, more helpful error message to the user that covers the most likely scenarios.
    // This is more reliable than trying to parse specific error messages from the library, which can be inconsistent.
    throw new Error(
        "Could not fetch transcript. The video may be private, have captions disabled, or a transcript in English may not be available."
    );
  }
}
