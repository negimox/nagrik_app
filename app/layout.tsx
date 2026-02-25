import type React from "react";
import type { Metadata } from "next";
import {  Public_Sans, Source_Serif_4  } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import { LoadingProvider } from "@/contexts/LoadingContext";

const outfit = Public_Sans({ subsets: ["latin"], display: 'swap', variable: "--font-sans"});
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"], display: 'swap', variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Nagrik",
  description: "Report and track infrastructure issues in your city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.variable + " " + sourceSerif4.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <UserProvider>{children}</UserProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
