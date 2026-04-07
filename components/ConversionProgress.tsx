'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ConversionProgressProps {
  phase: 'requesting' | 'downloading' | 'processing';
}

const PHASES: Record<
  ConversionProgressProps['phase'],
  { label: string; sublabel: string; progress: number }
> = {
  requesting: {
    label: 'Preparing Conversion',
    sublabel: 'Contacting server and validating video…',
    progress: 15,
  },
  processing: {
    label: 'Converting to MP3',
    sublabel: 'Extracting audio with yt-dlp and encoding via ffmpeg…',
    progress: 60,
  },
  downloading: {
    label: 'Downloading',
    sublabel: 'Receiving your MP3 file…',
    progress: 90,
  },
};

export function ConversionProgress({ phase }: ConversionProgressProps) {
  const { label, sublabel, progress } = PHASES[phase];

  return (
    <div className="w-full space-y-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Animated waveform */}
      <div className="flex justify-center items-end gap-1 h-10">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 rounded-full bg-gradient-to-t from-violet-600 to-indigo-400',
              'animate-bounce'
            )}
            style={{
              height: `${20 + Math.sin(i * 0.8) * 14}px`,
              animationDelay: `${i * 80}ms`,
              animationDuration: '900ms',
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="text-center space-y-1">
        <p className="font-bold text-white text-base">{label}</p>
        <p className="text-sm text-white/50">{sublabel}</p>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5" />

      <p className="text-center text-xs text-white/30">
        This may take a moment for longer videos. Please keep this tab open.
      </p>
    </div>
  );
}
