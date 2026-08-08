import type { Metadata, Viewport } from 'next';
import './global.css';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eigu.site';

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EIGU Platform - Giải Pháp Tự Động Hóa Video AI & MMO Reup Hàng Đầu',
    template: '%s | EIGU Platform',
  },
  description: 'EIGU Platform là giải pháp tự động hóa video ngắn đa nền tảng (TikTok, YouTube Shorts, Reels). Tích hợp 6 mô-đun AI Video Studio, Auto Clipper, Puppeteer Anti-Detect và Niche Finder giúp bứt phá doanh số MMO.',
  keywords: [
    'EIGU Platform',
    'Tự động hóa TikTok',
    'AI Video Generator',
    'Auto Clipper',
    'MMO Reup',
    'Puppeteer Anti-Detect',
    'Video Shorts',
    'Reels Automation',
    'SaaS MMO',
    'Anti-Detect Engine'
  ],
  authors: [{ name: 'EIGU Platform Team', url: siteUrl }],
  creator: 'EIGU Platform',
  publisher: 'EIGU Platform',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName: 'EIGU Platform',
    title: 'EIGU Platform - Giải Pháp Tự Động Hóa Video AI & MMO Reup Hàng Đầu',
    description: 'Nền tảng tự động hóa video ngắn AI chuyên sâu dành riêng cho Creator & Reuper tại Châu Âu, Mỹ và Châu Á.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'EIGU Platform - MMO Automation Engine OG Banner',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EIGU Platform - MMO Automation Engine',
    description: 'AI-driven Video Automation & Anti-detect Stealth Engine for TikTok, YouTube Shorts, and Reels.',
    images: ['/og_image.png'],
    creator: '@eiguplatform',
  },
};

const themeScript = `
(function(){try{
  var t=localStorage.getItem('eigu_theme')||'system';
  var e=t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;
  document.documentElement.setAttribute('data-theme',e);
  var season=localStorage.getItem('eigu_season');
  if(season) document.documentElement.setAttribute('data-season',season);
  var accent=localStorage.getItem('eigu_accent');
  var accentHover=localStorage.getItem('eigu_accent_hover');
  var accentGlow=localStorage.getItem('eigu_accent_glow');
  if(accent) document.documentElement.style.setProperty('--accent',accent);
  if(accentHover) document.documentElement.style.setProperty('--accent-hover',accentHover);
  if(accentGlow) document.documentElement.style.setProperty('--accent-glow',accentGlow);
}catch(e){}})()
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
