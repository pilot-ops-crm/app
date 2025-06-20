import { Message } from "@/types";
import { Instagram, ExternalLink } from "lucide-react";
import {
  ImageAttachment,
  VideoAttachment,
  AudioAttachment,
  StickerAttachment,
  StoryAttachment,
  FileAttachment
} from "../attachments";
import Link from "next/link";
import { isValidURL } from "@/lib/utils";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const isInstagramPostUrl = (text: string) => {
  if (!text) return false;
  return text.match(/https?:\/\/(www\.)?instagram\.com\/p\/[^\/]+\/?/i) !== null;
};

const processTextWithLinks = (text: string) => {
  if (!text) return "";
  
  if (isInstagramPostUrl(text)) {
    return (
      <Link 
        href={text} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
      >
        <Instagram className="h-5 w-5 text-pink-500" />
        <span>Instagram Post</span>
        <ExternalLink className="h-4 w-4 ml-auto" />
      </Link>
    );
  }
  
  const parts = text.split(URL_REGEX);
  const matches = text.match(URL_REGEX) || [];
  
  if (matches.length === 0) return text;
  
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        
        const url = matches[Math.floor(i / 2)];
        return (
          <Link 
            key={i} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            {url} <ExternalLink className="inline h-4 w-4 mb-1" />
          </Link>
        );
      })}
    </>
  );
};

export const getMessageContent = (message: Message) => {
  if (!message) {
    return "[Invalid message]";
  }

  if (message.text) {
    return processTextWithLinks(message.text);
  }
  
  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    
    try {
      if (attachment.image_data) {
        const url = attachment.image_data.url || attachment.image_data.preview_url || '';
        if (!isValidURL(url)) {
          return "[Invalid image URL]";
        }
        
        const isAnimatedGif = Boolean(attachment.image_data.animated_gif_url);
        
        return (
          <ImageAttachment 
            url={url} 
            width={attachment.image_data.width}
            height={attachment.image_data.height}
            isAnimatedGif={isAnimatedGif}
            animatedGifUrl={attachment.image_data.animated_gif_url}
            title="Image" 
          />
        );
      }
      
      if (attachment.video_data) {
        const url = attachment.video_data.url || attachment.video_data.preview_url || '';
        if (!isValidURL(url)) {
          return "[Invalid video URL]";
        }
        
        return (
          <VideoAttachment 
            url={url} 
            width={attachment.video_data.width}
            height={attachment.video_data.height}
            title="Video" 
          />
        );
      }
      
      if (attachment.audio_data) {
        const url = attachment.audio_data.url || attachment.audio_data.preview_url || '';
        if (!isValidURL(url)) {
          return "[Invalid audio URL]";
        }
        
        return (
          <AudioAttachment 
            url={url} 
            title="Audio" 
          />
        );
      }
      
      if (attachment.type && attachment.payload) {
        if (!attachment.payload.url || !isValidURL(attachment.payload.url)) {
          return `[Invalid ${attachment.type} URL]`;
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
            return (
              <Link 
                href={attachment.payload.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
              >
                <Instagram className="h-5 w-5 text-pink-500" />
                <span>{attachment.payload.title || "Instagram Post"}</span>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Link>
            );
          default:
            return <FileAttachment url={attachment.payload.url} title={attachment.payload.title} type={attachment.type} />;
        }
      }
    } catch (error) {
      console.error("Error rendering attachment:", error);
      return "[Error displaying attachment]";
    }
    
    return "[Unsupported attachment type]";
  }

  return "[Message content unavailable]";
}; 