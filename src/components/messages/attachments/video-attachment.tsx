import { isValidURL } from "@/lib/utils";
import { useState } from "react";
import { Video } from "lucide-react";

interface VideoAttachmentProps {
  url: string;
  title?: string;
  width?: number;
  height?: number;
}

export const VideoAttachment = ({ 
  url, 
  title,
  width = 1080, 
  height = 1920 
}: VideoAttachmentProps) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid video URL]</div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-blue-500 p-2 bg-background/10 rounded-lg">
        <Video className="h-5 w-5" />
        <span>{title || "Video"}</span>
      </div>
    );
  }
  
  const aspectRatio = height && width ? height / width : 16 / 9;
  const maxWidth = Math.min(300, width);
  const calculatedHeight = maxWidth * aspectRatio;
  
  return (
    <div className="relative max-w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 rounded-lg z-10">
          <div className="animate-pulse">Loading video...</div>
        </div>
      )}
      <video
        src={url}
        controls
        className="rounded-lg max-w-[300px] w-full object-contain"
        style={{
          aspectRatio: `${width} / ${height}`,
          maxHeight: `${calculatedHeight}px`
        }}
        onError={() => {
          console.error("Video failed to load:", url);
          setError(true);
        }}
        onLoadedData={() => setLoading(false)}
      />
    </div>
  );
};