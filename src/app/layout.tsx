import React from "react";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return React.createElement(
    'html',
    { lang: "en", suppressHydrationWarning: true },
    React.createElement(
      'body',
      { className: `${geist.variable} antialiased`, suppressHydrationWarning: true },
      React.createElement(
        ThemeProvider,
        {
          attribute: "class",
          defaultTheme: "system",
          enableSystem: true,
          disableTransitionOnChange: true
        },
        React.createElement(Providers, null, children)
      )
    )
  );
}