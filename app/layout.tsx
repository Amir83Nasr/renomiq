import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppWrapper } from '@/features/renamer/stores/AppContext';
import { I18nProvider } from '@/components/common/I18nProvider';
import { DirectionHandler } from '@/components/common/DirectionHandler';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Local Persian font
const iranYekanX = localFont({
  src: [
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-UltraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-DemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Heavy.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/IRAN YEKAN X/IRANYekanX-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-iran-yekan-x',
});

export const metadata: Metadata = {
  title: 'Renomiq Renamer',
  description: 'A powerful desktop batch file renaming tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${iranYekanX.variable} ${geistSans.variable} ${geistMono.variable} font-english antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AppWrapper>
              <DirectionHandler />
              <ErrorBoundary>{children}</ErrorBoundary>
            </AppWrapper>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
