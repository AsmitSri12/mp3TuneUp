import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mp3TuneUp — YouTube to MP3 Converter',
  description:
    'Convert YouTube videos to high-quality MP3 files instantly. Paste a URL, fetch video info, and download your audio — free and fast.',
  keywords: ['youtube to mp3', 'youtube converter', 'mp3 downloader', 'audio converter'],
  authors: [{ name: 'mp3TuneUp' }],
  robots: 'index, follow',
  openGraph: {
    title: 'mp3TuneUp — YouTube to MP3 Converter',
    description: 'Convert YouTube videos to MP3 instantly. Free, fast, and high quality.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080a14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Animated background */}
        <div className="bg-mesh" aria-hidden="true" />
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <div className="bg-orb bg-orb-2" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
