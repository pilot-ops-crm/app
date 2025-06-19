import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthCheck } from "@/components/auth-check";
import '../globals.css'

export const metadata: Metadata = {
  title: "App | Pilot - AI DM Assistant",
  description: "Simulate your DMs with AI",
};

/**
 * Defines the root layout for the application, providing sidebar navigation, authentication gating, and structured page content.
 *
 * Wraps the app in a sidebar context and applies global layout styles, including sidebar and header sizing. Renders the sidebar, page header, and main content area, displaying children only when the user is authenticated.
 *
 * @param children - The page content to render within the main layout
 */
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
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <AuthCheck>
            <section className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <SidebarInset className="border">
                <PageHeader />
                <main className="flex-1 overflow-y-auto">{children}</main>
              </SidebarInset>
            </section>
          </AuthCheck>
        </body>
      </html>
    </SidebarProvider>
  );
}