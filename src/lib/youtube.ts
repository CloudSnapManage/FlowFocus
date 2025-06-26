'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extracts the video ID from a YouTube URL.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
function getYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        // Standard youtube.com?v=...
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) return videoId;
        }
        // Shortened youtu.be/...
        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.slice(1);
            if (videoId) return videoId;
        }
        // Shorts URL youtube.com/shorts/...
        if (urlObj.pathname.includes('/shorts/')) {
            const videoId = urlObj.pathname.split('/shorts/')[1];
            if (videoId) return videoId;
        }
        return null;
    } catch (e) {
        console.error("URL parsing failed:", e);
        return null; // Invalid URL
    }
}


/**
 * Fetches the transcript for a given YouTube video URL.
 * @param url The URL of the YouTube video.
 * @returns The full transcript as a single string.
 * @throws An error if the transcript cannot be fetched.
 */
export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
      throw new Error("Failed to process YouTube URL. Please ensure it's a valid video link.");
  }
  
  try {
    // Fetch without language constraints to be more flexible
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript content found for this video. The creator may have disabled them.");
    }
    
    return transcript.map(item => item.text).join(' ');

  } catch (error: any) {
    console.error(`[Transcript Fetch Error] for videoId ${videoId}:`, error.message);

    // Provide a more specific error based on common failure modes from the library.
    if (error.message.includes('subtitles are disabled')) {
         throw new Error('Could not fetch transcript because subtitles are disabled for this video.');
    }
    if (error.message.includes('No transcripts')) {
        throw new Error('No transcripts are available for this video. This can happen with very new videos or if they are not in a supported language.');
    }

    // A general fallback error
    throw new Error(
        "Failed to fetch transcript. The video might be private, very new, or have transcripts disabled."
    );
  }
}
