import { isValidURL } from "@/lib/utils";
import { useState } from "react";
import { Disc3 } from "lucide-react";

interface AudioAttachmentProps {
  url: string;
  title?: string;
}

export const AudioAttachment = ({ url, title }: AudioAttachmentProps) => {
  const [error, setError] = useState(false);
  
  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid audio URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-blue-500 p-2 bg-background/10 rounded-lg">
        <Disc3 className="h-5 w-5" />
        <span>{title || "Audio Message"}</span>
      </div>
    );
  }
  
  return (
    <div className="max-w-full w-[250px] bg-background/10 rounded-lg p-2">
      <div className="flex items-center gap-2 mb-1">
        <Disc3 className="h-4 w-4" />
        <span className="text-sm font-medium">{title || "Audio Message"}</span>
      </div>
      <audio
        src={url}
        controls
        className="w-full"
        controlsList="nodownload"
        onError={() => {
          console.error("Audio failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
}; 