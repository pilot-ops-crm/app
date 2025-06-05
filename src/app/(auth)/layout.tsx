import type { Metadata } from "next";
import '../globals.css'

export const metadata: Metadata = {
  title: "Auth | Pilot - AI DM Assistant",
  description: "Simulate your DMs with AI",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}