import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

// Load your three professional fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Australian Cannabis News & Industry Directory | Cannaus",
  description: "Your trusted source for Australian cannabis news, industry updates, comprehensive company directory, and regulatory information across all states and territories.",
  keywords: "cannabis, australia, news, industry, companies, medical cannabis, hemp, legislation",
  authors: [{ name: "Cannaus" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Cannaus - Australian Cannabis News",
    description: "Your trusted source for Australian cannabis news and industry updates",
    type: "website",
    locale: "en_AU",
  },
  // Favicon configuration
  icons: {
    icon: [
      {
        url: '/images/logo/cannaus-icon.png',
        sizes: 'any',
      },
      {
        url: '/images/logo/cannaus-icon.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/images/logo/cannaus-icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/images/logo/cannaus-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/images/logo/cannaus-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en-AU" 
      className={`${playfairDisplay.variable} ${inter.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}