import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { isValidURL } from "@/lib/utils";
import Link from "next/link";

interface LinkAttachmentProps {
  url: string;
  title: string;
  type: string;
  Icon?: LucideIcon;
}

export const LinkAttachment = ({
  url,
  title,
  type,
  Icon,
}: LinkAttachmentProps) => {
  if (!isValidURL(url)) {
    return <div className="text-red-500 text-xs">[Invalid {type} URL]</div>;
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline flex items-center gap-2"
    >
      {Icon ? (
        <Icon className="h-4 w-4" />
      ) : (
        <Image
          src="/file.svg"
          alt="File"
          width={16}
          height={16}
          className="w-4 h-4 mr-1"
        />
      )}
      {title || type}
    </Link>
  );
};