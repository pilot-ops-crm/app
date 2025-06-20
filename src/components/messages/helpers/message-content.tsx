import { Message } from "@/types";
import { Instagram } from "lucide-react";
import {
  ImageAttachment,
  VideoAttachment,
  AudioAttachment,
  StickerAttachment,
  StoryAttachment,
  LinkAttachment,
  FileAttachment
} from "../attachments";

export const getMessageContent = (message: Message) => {
  if (!message) {
    return "[Invalid message]";
  }

  if (message.text) {
    return message.text;
  }
  
  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    
    if (!attachment.payload.url) {
      console.warn("Missing URL for attachment:", attachment);
      return `[${attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)}]`;
    }
    
    switch (attachment.type) {
      case "image":
        return <ImageAttachment url={attachment.payload.url} title={attachment.payload.title || "Image"} />;
      case "video":
        return <VideoAttachment url={attachment.payload.url} title={attachment.payload.title || "Video"} />;
      case "audio":
        return <AudioAttachment url={attachment.payload.url} title={attachment.payload.title || "Audio"} />;
      case "sticker":
        return <StickerAttachment url={attachment.payload.url} title={attachment.payload.title || "Sticker"} />;
      case "story":
        return <StoryAttachment url={attachment.payload.url} title={attachment.payload.title || "Story"} />;
      case "post":
        return <LinkAttachment url={attachment.payload.url} title={attachment.payload.title || "Instagram Post"} type="Post" Icon={Instagram} />;
      case "template":
        return <LinkAttachment url={attachment.payload.url} title={attachment.payload.title || "Instagram Content"} type="Content" Icon={Instagram} />;
      default:
        return <FileAttachment url={attachment.payload.url} title={attachment.payload.title} type={attachment.type} />;
    }
  }

  return "[Message content unavailable]";
}; 