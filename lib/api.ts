export interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  viewCount: number;
  description: string;
}

export interface MetadataResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: string;
}

export interface ConvertOptions {
  url: string;
  quality?: '128k' | '192k' | '320k';
}

/**
 * Fetches video metadata from our Next.js API gateway.
 */
export async function fetchMetadata(url: string): Promise<VideoMetadata> {
  const params = new URLSearchParams({ url });
  const response = await fetch(`/api/metadata?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data: MetadataResponse = await response.json();

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch video metadata.');
  }

  return data.data;
}

/**
 * Triggers MP3 conversion and initiates browser download.
 * Uses fetch + blob URL to programmatically download the streamed file.
 */
export async function convertAndDownload(
  options: ConvertOptions,
  onProgress?: (phase: 'requesting' | 'downloading' | 'done') => void
): Promise<{ filename: string; size: number }> {
  onProgress?.('requesting');

  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: options.url, quality: options.quality || '192k' }),
  });

  if (!response.ok) {
    let errorMsg = 'Conversion failed.';
    try {
      const err = await response.json();
      errorMsg = err.error || errorMsg;
    } catch {
      // Non-JSON error body
    }
    throw new Error(errorMsg);
  }

  onProgress?.('downloading');

  const blob = await response.blob();
  const size = blob.size;

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || 'audio.mp3';

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  onProgress?.('done');
  return { filename, size };
}
