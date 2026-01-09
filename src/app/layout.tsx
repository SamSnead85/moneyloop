import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
    default: "MoneyLoop - #1 Personal Finance & Budget Tracker App | Free Net Worth Tracker",
    template: "%s | MoneyLoop - Personal Finance App",
  },
  description:
    "The best personal finance app to track your entire financial life. Connect bank accounts, investments, real estate, and gold. Free net worth tracker with AI insights. Alternative to Mint & YNAB.",
  keywords: [
    // Primary keywords
    "personal finance app",
    "budget tracker",
    "expense tracker",
    "net worth tracker",
    "money management app",
    "wealth tracking app",
    "financial planning app",
    "investment tracker",
    "savings tracker",
    // Competitor alternatives
    "mint alternative",
    "ynab alternative",
    "personal capital alternative",
    "monarch money alternative",
    // Feature keywords
    "automatic expense categorization",
    "bank account aggregation",
    "portfolio tracker",
    "subscription tracker",
    "bill tracker app",
    "spending tracker",
    "budget planner",
    "financial dashboard",
    // Long-tail keywords
    "best budgeting app 2026",
    "free budget app",
    "track spending app",
    "how to track net worth",
    "best app to track investments",
    "track all bank accounts in one place",
    "real time net worth tracker",
    // Asset tracking
    "real estate tracking",
    "gold investment tracking",
    "income tracking",
    "healthcare spending tracker",
    "HSA tracker",
    "tax optimization app",
    "debt payoff tracker",
    "financial goal tracker",
    "cash flow analysis app",
  ],
  authors: [{ name: "MoneyLoop", url: "https://moneyloop.ai" }],
  creator: "MoneyLoop",
  publisher: "MoneyLoop",
  applicationName: "MoneyLoop",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    title: "MoneyLoop - Your Complete Wealth Picture | Free Personal Finance App",
    description:
      "Track every asset in one place—bank accounts, investments, real estate, gold. The #1 personal finance app with AI-powered savings insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MoneyLoop - Personal Finance & Net Worth Tracker",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@moneyloopai",
    creator: "@moneyloopai",
    title: "MoneyLoop - #1 Personal Finance App | Free Net Worth Tracker",
    description:
      "Track bank accounts, investments, real estate & more in one app. Free budget tracker with AI insights.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://moneyloop.ai",
    languages: {
      "en-US": "https://moneyloop.ai",
      "x-default": "https://moneyloop.ai",
    },
  },
  category: "Finance",
  classification: "Personal Finance Software",
  verification: {
    google: "google-site-verification-code",
  },
};

// JSON-LD Structured Data - Multi-schema for rich search results
const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MoneyLoop",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web, iOS, Android",
  description:
    "The best personal finance app to track net worth, budgets, investments, and discover savings opportunities. Free tier available.",
  url: "https://moneyloop.ai",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier with premium upgrades available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "15000",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Net worth tracking",
    "Automatic bank sync",
    "Investment portfolio tracking",
    "Budget planning and tracking",
    "Bill reminders and management",
    "Subscription tracking",
    "AI-powered financial insights",
    "Spending categorization",
    "Financial goal tracking",
    "Real estate value tracking",
    "Healthcare expense tracking",
    "Tax optimization",
  ],
  screenshot: "https://moneyloop.ai/screenshots/dashboard.png",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MoneyLoop",
  url: "https://moneyloop.ai",
  logo: "https://moneyloop.ai/logo.png",
  description: "Personal finance and wealth tracking platform",
  foundingDate: "2025",
  sameAs: [
    "https://twitter.com/moneyloopai",
    "https://linkedin.com/company/moneyloop",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@moneyloop.ai",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is MoneyLoop free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! MoneyLoop offers a free tier that includes 3 connected accounts, basic net worth tracking, and monthly insights. Premium features are available for $39/month.",
      },
    },
    {
      "@type": "Question",
      name: "Is my financial data secure with MoneyLoop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. MoneyLoop uses 256-bit bank-level encryption, read-only access to your accounts (we can never move money), and is SOC 2 Type II certified.",
      },
    },
    {
      "@type": "Question",
      name: "How does MoneyLoop track my net worth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MoneyLoop automatically syncs with your bank accounts, investment accounts, real estate values, and other assets to calculate your real-time net worth.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track investments and stocks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! MoneyLoop tracks stocks, ETFs, mutual funds, 401(k)s, IRAs, and other investment accounts with real-time pricing and performance analytics.",
      },
    },
    {
      "@type": "Question",
      name: "How is MoneyLoop different from Mint or YNAB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MoneyLoop offers true wealth tracking including real estate, gold, and alternative assets - not just bank accounts. Plus, our AI-powered insights actively find savings opportunities.",
      },
    },
  ],
};

const jsonLdSchemas = [webApplicationSchema, organizationSchema, faqSchema];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
