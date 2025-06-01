import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App | Pilot - AI DM Assistant",
  description: "Simulate your DMs with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <html lang="en">
        <body className={`${geist.variable} antialiased`}>
          <section className="flex h-screen w-full">
            <AppSidebar />
            <SidebarInset>
              <PageHeader />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </SidebarInset>
          </section>
        </body>
      </html>
    </SidebarProvider>
  );
}