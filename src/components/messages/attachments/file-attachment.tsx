import Link from "next/link";
import { File } from "lucide-react";

interface FileAttachmentProps {
  url: string;
  title?: string;
  type?: string;
}

export const FileAttachment = ({ url, title, type }: FileAttachmentProps) => {
  if (!url || typeof url !== 'string') {
    return <div className="text-red-500 text-xs">[Invalid file URL]</div>;
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
    >
      <div className="bg-primary/10 rounded-full p-2">
        <File className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="font-medium text-sm truncate">
          {title || type || "File"}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {new URL(url).hostname}
        </span>
      </div>
    </Link>
  );
}; 