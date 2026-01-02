import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MoneyLoop | Financial Command Center",
  description:
    "Finally understand your money. A premium financial platform that connects to all your accounts and gives you complete visibility into your financial life.",
  keywords: [
    "money management",
    "financial platform",
    "budgeting",
    "expense tracking",
    "investment tracking",
    "subscription management",
    "personal finance",
    "business finance",
  ],
  openGraph: {
    title: "MoneyLoop | Financial Command Center",
    description: "Finally understand your money.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
