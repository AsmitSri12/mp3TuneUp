'use client';

import { Download, CheckCircle2, Music2, FileAudio, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DownloadCardProps {
  filename: string;
  fileSize: number;
  onReset: () => void;
  onDownloadAgain: () => void;
  isDownloadingAgain: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function DownloadCard({
  filename,
  fileSize,
  onReset,
  onDownloadAgain,
  isDownloadingAgain,
}: DownloadCardProps) {
  return (
    <Card className="w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Success header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Conversion Complete!</h3>
            <p className="text-sm text-white/50">Your MP3 file is ready to download</p>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* File info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="h-12 w-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <FileAudio className="h-6 w-6 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold text-white truncate"
              title={filename}
            >
              {filename}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">MP3</Badge>
              {fileSize > 0 && (
                <span className="text-xs text-white/40">{formatFileSize(fileSize)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            id="download-again-btn"
            onClick={onDownloadAgain}
            disabled={isDownloadingAgain}
            variant="success"
            size="lg"
            className="flex-1"
          >
            {isDownloadingAgain ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Downloading…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Again
              </>
            )}
          </Button>

          <Button
            id="convert-another-btn"
            onClick={onReset}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Convert Another
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-white/25 text-center leading-relaxed">
          For personal use only. Respect copyright and YouTube&apos;s Terms of Service.
        </p>
      </CardContent>
    </Card>
  );
}
