import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Movie Insight Builder',
  description: 'Analyze movie sentiment using AI and audience reviews',
  keywords: 'movies, sentiment analysis, AI, reviews, IMDb',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'AI Movie Insight Builder',
    description: 'Analyze movie sentiment using AI and audience reviews',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
