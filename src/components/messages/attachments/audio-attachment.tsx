import { isValidURL } from "@/lib/utils";
import { useState } from "react";

interface AudioAttachmentProps {
  url: string;
  title: string;
}

export const AudioAttachment = ({ url, title }: AudioAttachmentProps) => {
  const [error, setError] = useState(false);
  
  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid audio URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <span>{title || "Audio"}</span>
      </div>
    );
  }
  
  return (
    <audio
      src={url}
      controls
      className="rounded-lg max-w-[250px]"
      onError={() => {
        console.error("Audio failed to load:", url);
        setError(true);
      }}
    />
  );
}; 