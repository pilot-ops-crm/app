import { LinkAttachment } from "./link-attachment";

interface FileAttachmentProps {
  url: string;
  title?: string;
  type: string;
}

export const FileAttachment = ({ url, title, type }: FileAttachmentProps) => {
  return (
    <LinkAttachment 
      url={url} 
      title={title || type || "Attachment"} 
      type={type} 
    />
  );
}; 