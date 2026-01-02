import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08080c",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://moneyloop.ai"),
  title: {
    default: "MoneyLoop - Track All Your Wealth in One Place",
    template: "%s | MoneyLoop",
  },
  description:
    "Track every asset—bank accounts, investments, real estate, gold, and income streams. See your complete financial picture and discover savings opportunities.",
  keywords: [
    "wealth tracking",
    "net worth tracker",
    "personal finance app",
    "investment tracker",
    "money management",
    "budget tracker",
    "financial dashboard",
    "expense tracker",
    "real estate tracking",
    "gold investment tracking",
    "income tracking",
    "subscription manager",
    "tax optimization",
    "healthcare spending tracker",
    "HSA tracker",
    "financial planning",
  ],
  authors: [{ name: "MoneyLoop" }],
  creator: "MoneyLoop",
  publisher: "MoneyLoop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moneyloop.ai",
    siteName: "MoneyLoop",
    title: "MoneyLoop - Track All Your Wealth in One Place",
    description:
      "Track every asset—bank accounts, investments, real estate, gold, and income streams. See your complete financial picture.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MoneyLoop - Wealth Tracking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyLoop - Track All Your Wealth in One Place",
    description:
      "Track every asset—bank accounts, investments, real estate, gold, and income streams.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://moneyloop.ai",
  },
  category: "Finance",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MoneyLoop",
  description:
    "Track every asset—bank accounts, investments, real estate, gold, and income streams. See your complete financial picture.",
  url: "https://moneyloop.ai",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "10000",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Bank account tracking",
    "Investment portfolio tracking",
    "Real estate value tracking",
    "Gold and silver tracking",
    "Income stream tracking",
    "Healthcare expense tracking",
    "Tax optimization",
    "Subscription management",
    "Financial goal tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
