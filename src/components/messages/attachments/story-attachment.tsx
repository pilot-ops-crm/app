import { useState } from "react";
import Image from "next/image";
import { isValidURL } from "@/lib/utils";
import { History } from "lucide-react";
import Link from "next/link";

interface StoryAttachmentProps {
  url: string;
  title?: string;
  username?: string;
  width?: number;
  height?: number;
}

export const StoryAttachment = ({
  url,
  title,
  username,
  width = 200,
  height = 350
}: StoryAttachmentProps) => {
  const [error, setError] = useState(false);
  const [expired, setExpired] = useState(false);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid story URL]</div>;
  }

  if (error || expired) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-1 text-sm text-neutral-500">Instagram Story</div>
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <History className="h-6 w-6 text-neutral-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {username ? `@${username}'s story` : "Instagram Story"}
            </span>
            <span className="text-xs text-muted-foreground">
              This story has expired or is no longer available
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-sm text-neutral-500">Instagram Story</div>
      <div className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <Image
          src={url}
          alt={title || "Story"}
          width={width}
          height={height}
          className="object-cover max-h-[350px]"
          onError={(e) => {
            console.error("Story image failed to load:", url);
            if ((e.target as HTMLImageElement).src.includes("expired")) {
              setExpired(true);
            } else {
              setError(true);
            }
          }}
        />
        {username && (
          <Link
            href={`https://www.instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
          >
            @{username}
          </Link>
        )}
      </div>
    </div>
  );
};