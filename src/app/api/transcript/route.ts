
import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

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
        return null;
    }
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return NextResponse.json({ error: "Failed to process YouTube URL. Please ensure it's a valid video link." }, { status: 400 });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript content found for this video. The creator may have disabled them." }, { status: 404 });
    }
    
    const transcriptText = transcript.map(item => item.text).join(' ');
    return NextResponse.json({ transcript: transcriptText });

  } catch (error: any) {
    console.error(`[API Transcript Error] for videoId ${videoId}:`, error.message);
    
    if (error.message.includes('subtitles are disabled')) {
         return NextResponse.json({ error: 'Could not fetch transcript because subtitles are disabled for this video.' }, { status: 404 });
    }
    if (error.message.includes('No transcripts')) {
        return NextResponse.json({ error: 'No transcripts are available for this video. This can happen with very new videos or if they are not in a supported language.' }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to fetch transcript. The video might be private, very new, or have transcripts disabled." }, { status: 500 });
  }
}
