import type React from "react";
import type { Metadata } from "next";
import {  Public_Sans  } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import { LoadingProvider } from "@/contexts/LoadingContext";

const outfit = Public_Sans({ subsets: ["latin"], display: 'swap', });
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
      <body className={outfit.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
