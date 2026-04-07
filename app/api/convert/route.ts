import { NextRequest, NextResponse } from 'next/server';
import { isValidYouTubeUrl } from '@/lib/validators';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  let body: { url?: string; quality?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { url, quality } = body;

  if (!url) {
    return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
  }

  if (!isValidYouTubeUrl(url)) {
    return NextResponse.json(
      { success: false, error: 'Invalid YouTube URL.' },
      { status: 400 }
    );
  }

  const allowedQualities = ['128k', '192k', '320k'];
  const safeQuality = allowedQualities.includes(quality || '') ? quality : '192k';

  try {
    const response = await fetch(`${BACKEND_URL}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'mp3TuneUp/1.0' },
      body: JSON.stringify({ url, quality: safeQuality }),
      // Long timeout — conversion can take time for larger videos
      signal: AbortSignal.timeout(130_000),
    });

    if (!response.ok) {
      let errorMsg = 'Conversion failed on backend.';
      try {
        const errData = await response.json();
        errorMsg = errData.error || errorMsg;
      } catch {
        // Non-JSON error
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status: response.status });
    }

    // Stream the MP3 response directly to the client
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="audio.mp3"';

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('abort') || message.includes('timeout');
    console.error('[api/convert] Error:', message);
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Conversion timed out. Try a shorter video.'
          : 'Backend service unavailable.',
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
