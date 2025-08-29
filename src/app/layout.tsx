import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TestModeProvider } from "@/contexts/TestModeContext";
import { RandomizationProvider } from "@/contexts/RandomizationContext";
import { SessionStatsProvider } from "@/contexts/SessionStatsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leben In Deutschland",
  description: "Questions and Answers for the 'Life in Germany' test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <TestModeProvider>
                <SessionStatsProvider>
                  <RandomizationProvider>
                    {children}
                  </RandomizationProvider>
                </SessionStatsProvider>
              </TestModeProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
