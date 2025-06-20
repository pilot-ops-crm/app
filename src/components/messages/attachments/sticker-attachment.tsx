import { useState } from "react";
import Image from "next/image";
import { isValidURL } from "@/lib/utils";

interface StickerAttachmentProps {
  url: string;
  title: string;
}

export const StickerAttachment = ({ url, title }: StickerAttachmentProps) => {
  const [error, setError] = useState(false);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid sticker URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Image src="/file.svg" alt="File" width={32} height={32} className="w-8 h-8" />
        <span>{title || "Sticker"}</span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <Image
        src={url}
        alt={title || "Sticker"}
        width={150}
        height={150}
        className="object-contain"
        onError={() => {
          console.error("Sticker failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
}; 