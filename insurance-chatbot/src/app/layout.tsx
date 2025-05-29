import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConversationProvider } from "@/contexts/ConversationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insurance Advisor AI - Get Personalized Insurance Recommendations",
  description:
    "AI-powered insurance advisor that helps you find the right insurance coverage through natural conversation. Get personalized recommendations for auto, home, life, and health insurance.",
  keywords:
    "insurance, AI advisor, insurance recommendations, auto insurance, home insurance, life insurance, health insurance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ErrorBoundary showDetails={process.env.NODE_ENV === "development"}>
          <ConversationProvider>
            {children}
            <OfflineIndicator
              showDetails={process.env.NODE_ENV === "development"}
            />
          </ConversationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
