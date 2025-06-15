import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Direct Messages - Pilot",
  description: "Manage your Instagram direct messages",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      {children}
    </div>
  );
} 