import { useState } from "react";
import Image from "next/image";
import { isValidURL } from "@/lib/utils";

interface StoryAttachmentProps {
  url: string;
  title: string;
}

export const StoryAttachment = ({ url, title }: StoryAttachmentProps) => {
  const [error, setError] = useState(false);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid story URL]</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-1 text-sm text-neutral-500">Instagram Story</div>
        <div className="flex items-center gap-2">
          <Image
            src="/file.svg"
            alt="File"
            width={32}
            height={32}
            className="w-8 h-8"
          />{" "}
          <span>{title || "Story"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-sm text-neutral-500">Instagram Story</div>
      <Image
        src={url}
        alt={title || "Story"}
        width={200}
        height={200}
        className="rounded-lg object-cover max-w-[250px]"
        onError={() => {
          console.error("Story image failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
};