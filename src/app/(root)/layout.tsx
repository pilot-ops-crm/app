import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthCheck } from "@/components/auth-check";
import "../globals.css";

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
      <AuthCheck>
        <section className="flex h-screen w-full overflow-hidden" suppressHydrationWarning>
          <AppSidebar />
          <SidebarInset className="border">
            <PageHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </SidebarInset>
        </section>
      </AuthCheck>
    </SidebarProvider>
  );
}