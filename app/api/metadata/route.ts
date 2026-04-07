import { NextRequest, NextResponse } from 'next/server';
import { isValidYouTubeUrl } from '@/lib/validators';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ success: false, error: 'URL parameter is required.' }, { status: 400 });
  }

  if (!isValidYouTubeUrl(url)) {
    return NextResponse.json(
      { success: false, error: 'Invalid YouTube URL. Please use a youtube.com or youtu.be link.' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({ url });
    const response = await fetch(`${BACKEND_URL}/metadata?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'mp3TuneUp/1.0' },
      signal: AbortSignal.timeout(35_000),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Backend metadata fetch failed.' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to contact backend.';
    const isTimeout = message.includes('abort') || message.includes('timeout');
    console.error('[api/metadata] Error:', message);
    return NextResponse.json(
      { success: false, error: isTimeout ? 'Request timed out. Please try again.' : 'Backend service unavailable.' },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
