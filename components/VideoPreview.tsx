'use client';

import Image from 'next/image';
import { Clock, Eye, User, Music2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDuration, formatViews } from '@/lib/validators';
import type { VideoMetadata } from '@/lib/api';

interface VideoPreviewProps {
  metadata: VideoMetadata;
  onConvert: () => void;
  isConverting: boolean;
  quality: '128k' | '192k' | '320k';
  onQualityChange: (q: '128k' | '192k' | '320k') => void;
}

export function VideoPreview({
  metadata,
  onConvert,
  isConverting,
  quality,
  onQualityChange,
}: VideoPreviewProps) {
  const qualities: Array<'128k' | '192k' | '320k'> = ['128k', '192k', '320k'];

  return (
    <Card className="w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden">
        {metadata.thumbnail ? (
          <Image
            src={metadata.thumbnail}
            alt={metadata.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Music2 className="h-16 w-16 text-white/20" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-black/70 border-white/10 backdrop-blur-sm font-mono">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(metadata.duration)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h2 className="font-bold text-white text-lg leading-snug line-clamp-2">
            {metadata.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {metadata.uploader}
            </span>
            {metadata.viewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {formatViews(metadata.viewCount)}
              </span>
            )}
          </div>
        </div>

        {/* Quality selector */}
        <div>
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Audio Quality</p>
          <div className="flex gap-2">
            {qualities.map((q) => (
              <button
                key={q}
                id={`quality-${q}`}
                onClick={() => onQualityChange(q)}
                disabled={isConverting}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all duration-200
                  ${quality === q
                    ? 'bg-violet-600/30 border-violet-500/60 text-violet-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Convert button */}
        <Button
          id="convert-btn"
          onClick={onConvert}
          disabled={isConverting}
          size="xl"
          className="w-full"
        >
          {isConverting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Converting to MP3…
            </>
          ) : (
            <>
              <Music2 className="h-5 w-5" />
              Convert to MP3
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function VideoPreviewSkeleton() {
  return (
    <Card className="w-full overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <CardContent className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-14 w-full" />
      </CardContent>
    </Card>
  );
}
