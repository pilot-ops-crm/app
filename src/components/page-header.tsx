"use client";

import { usePathname } from "next/navigation";
import { navbarData } from "@/lib/sidebar-data";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

export function PageHeader() {
  const pathname = usePathname();

  const currentRoute = navbarData.find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
  );

  const title = currentRoute?.title || "Inbox";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-6"
        />
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
    </header>
  );
}