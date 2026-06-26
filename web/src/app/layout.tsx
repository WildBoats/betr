import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Bettrr — Bet on yourself',
  description: 'Join real-life challenges, put skin in the game, and win your share of the pot.',
};

export const viewport: Viewport = {
  themeColor: '#060807',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="bg-bg">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
