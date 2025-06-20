import { useState } from "react";
import Image from "next/image";
import { isValidURL } from "@/lib/utils";

interface ImageAttachmentProps {
  url: string;
  title: string;
}

export const ImageAttachment = ({ url, title }: ImageAttachmentProps) => {
  const [error, setError] = useState(false);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid image URL]</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Image
          src="/file.svg"
          alt="File"
          width={32}
          height={32}
          className="w-8 h-8"
        />{" "}
        <span>{title || "Image"}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        src={url}
        alt={title || "Image"}
        width={300}
        height={300}
        className="rounded-lg object-contain max-w-[300px]"
        onError={() => {
          console.error("Image failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
};