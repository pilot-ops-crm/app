import { isValidURL } from "@/lib/utils";
import { useState } from "react";

interface VideoAttachmentProps {
  url: string;
  title: string;
}

export const VideoAttachment = ({ url, title }: VideoAttachmentProps) => {
  const [error, setError] = useState(false); 

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid video URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
        <span>{title || "Video"}</span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <video
        src={url}
        controls
        className="rounded-lg max-w-[250px]"
        onError={() => {
          console.error("Video failed to load:", url);
          setError(true);
        }}
      />
    </div>
  );
}; 