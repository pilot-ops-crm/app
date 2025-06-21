import { useState } from "react";
import Image from "next/image";
import { isValidURL } from "@/lib/utils";
import { Sticker } from "lucide-react";

interface StickerAttachmentProps {
  url: string;
  title?: string;
  width?: number;
  height?: number;
}

export const StickerAttachment = ({ 
  url, 
  title,
  width = 150,
  height = 150
}: StickerAttachmentProps) => {
  const [error, setError] = useState(false);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid sticker URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 bg-background/10 rounded-lg">
        <Sticker className="h-5 w-5 text-blue-500" />
        <span>{title || "Sticker"}</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-xs text-neutral-500">Sticker</div>
      <Image
        src={url}
        alt={title || "Sticker"}
        width={width}
        height={height}
        className="object-contain max-w-[150px]"
        onError={() => {
          console.error("Sticker failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
};