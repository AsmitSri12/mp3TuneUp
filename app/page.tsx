'use client';

import { useState, useCallback } from 'react';
import { Music2, ExternalLink, Zap, Shield, Download } from 'lucide-react';
import { UrlInput } from '@/components/UrlInput';
import { VideoPreview, VideoPreviewSkeleton } from '@/components/VideoPreview';
import { DownloadCard } from '@/components/DownloadCard';
import { ConversionProgress } from '@/components/ConversionProgress';
import { fetchMetadata, convertAndDownload, type VideoMetadata } from '@/lib/api';

// ── App UI States ───────────────────────────────────────────────────────────
type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'preview'; metadata: VideoMetadata; url: string }
  | { status: 'processing'; phase: 'requesting' | 'processing' | 'downloading'; metadata: VideoMetadata; url: string }
  | { status: 'success'; filename: string; size: number; metadata: VideoMetadata; url: string }
  | { status: 'error'; message: string };

// ── Feature Highlights ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Stream-based conversion, no waiting for uploads' },
  { icon: Shield, title: 'Secure', desc: 'Input sanitization, rate limiting, safe processing' },
  { icon: Download, title: 'High Quality', desc: 'Up to 320kbps MP3, powered by yt-dlp + ffmpeg' },
];

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>({ status: 'idle' });
  const [quality, setQuality] = useState<'128k' | '192k' | '320k'>('192k');
  const [errorBanner, setErrorBanner] = useState('');

  // ── Fetch metadata ─────────────────────────────────────────────────────
  const handleFetch = useCallback(async (url: string) => {
    setAppState({ status: 'loading' });
    setErrorBanner('');
    try {
      const metadata = await fetchMetadata(url);
      setAppState({ status: 'preview', metadata, url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch video info.';
      setAppState({ status: 'error', message });
    }
  }, []);

  // ── Convert & Download ─────────────────────────────────────────────────
  const handleConvert = useCallback(
    async (url: string, metadata: VideoMetadata, isRetry = false) => {
      if (!isRetry) {
        setAppState({ status: 'processing', phase: 'requesting', metadata, url });
      } else {
        setAppState((prev) => ({ ...prev, status: 'processing', phase: 'requesting' } as AppState));
      }
      setErrorBanner('');

      try {
        const result = await convertAndDownload({ url, quality }, (phase) => {
          if (phase === 'downloading') {
            setAppState({ status: 'processing', phase: 'downloading', metadata, url });
          } else if (phase === 'requesting') {
            // Small delay to show "processing" state so user sees the animation
            setTimeout(() => {
              setAppState({ status: 'processing', phase: 'processing', metadata, url });
            }, 800);
          }
        });

        setAppState({
          status: 'success',
          filename: result.filename,
          size: result.size,
          metadata,
          url,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Conversion failed. Please try again.';
        setErrorBanner(message);
        // Revert to preview state so user can retry
        setAppState({ status: 'preview', metadata, url });
      }
    },
    [quality]
  );

  // ── Reset to idle ──────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setAppState({ status: 'idle' });
    setErrorBanner('');
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (appState.status) {
      case 'idle':
        return (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            <UrlInput
              onSubmit={handleFetch}
              isLoading={false}
              disabled={false}
            />
            {/* Feature grid */}
            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 border border-white/5 text-center"
                >
                  <div className="h-8 w-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <p className="text-xs font-semibold text-white/80">{title}</p>
                  <p className="text-xs text-white/40 leading-relaxed hidden sm:block">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="w-full space-y-6">
            <UrlInput onSubmit={handleFetch} isLoading={true} disabled={true} />
            <VideoPreviewSkeleton />
          </div>
        );

      case 'preview':
        return (
          <div className="w-full space-y-4">
            <UrlInput
              onSubmit={handleFetch}
              isLoading={false}
              disabled={false}
            />
            {errorBanner && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-in fade-in duration-300"
              >
                <span className="font-medium">⚠ {errorBanner}</span>
              </div>
            )}
            <VideoPreview
              metadata={appState.metadata}
              onConvert={() => handleConvert(appState.url, appState.metadata)}
              isConverting={false}
              quality={quality}
              onQualityChange={setQuality}
            />
          </div>
        );

      case 'processing':
        return (
          <div className="w-full space-y-4">
            <ConversionProgress phase={appState.phase} />
            <VideoPreview
              metadata={appState.metadata}
              onConvert={() => {}}
              isConverting={true}
              quality={quality}
              onQualityChange={setQuality}
            />
          </div>
        );

      case 'success':
        return (
          <div className="w-full space-y-4">
            <DownloadCard
              filename={appState.filename}
              fileSize={appState.size}
              onReset={handleReset}
              onDownloadAgain={() => handleConvert(appState.url, appState.metadata, true)}
              isDownloadingAgain={false}
            />
          </div>
        );

      case 'error':
        return (
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            <div
              role="alert"
              className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3"
            >
              <p className="text-4xl">⚠️</p>
              <p className="font-bold text-white">Something went wrong</p>
              <p className="text-sm text-red-300">{appState.message}</p>
            </div>
            <UrlInput onSubmit={handleFetch} isLoading={false} />
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 sm:py-16">
      {/* ── Header ── */}
      <header className="w-full max-w-md mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-white tracking-tight">mp3TuneUp</h1>
            <p className="text-xs text-white/40 font-medium">YouTube → MP3 Converter</p>
          </div>
        </div>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Paste a YouTube link, preview the video, and download it as a high-quality MP3 — in seconds.
        </p>
      </header>

      {/* ── Main Content ── */}
      <div className="w-full max-w-md">
        {renderContent()}
      </div>

      {/* ── Footer ── */}
      <footer className="mt-12 text-center space-y-2">
        <p className="text-xs text-white/20">
          For personal, non-commercial use only. Respect copyright.
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on GitHub
        </a>
      </footer>
    </main>
  );
}
