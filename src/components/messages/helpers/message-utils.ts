import { Chat, Message, MessageAttachment } from "@/types";

interface MessageSuccessResult {
  id: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

interface MessageErrorResult {
  error: string;
  errorCode?: string;
}

type MessageResult = MessageSuccessResult | MessageErrorResult;

export const createOptimisticMessage = (url: string, type: string, currentUser: string): Message => {
  const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    sender: currentUser,
    timestamp: new Date().toISOString(),
  };
  
  switch (type) {
    case "image":
      optimisticMessage.attachments = [{
        image_data: {
          url: url,
          preview_url: url,
          width: 300,
          height: 300
        }
      }];
      break;
    case "video":
      optimisticMessage.attachments = [{
        video_data: {
          url: url,
          preview_url: url,
          width: 300,
          height: 300
        }
      }];
      break;
    case "audio":
      optimisticMessage.attachments = [{
        audio_data: {
          url: url,
          preview_url: url
        }
      }];
      break;
    case "sticker":
      optimisticMessage.attachments = [{
        image_data: {
          url: url,
          preview_url: url,
          width: 150,
          height: 150,
          render_as_sticker: true
        }
      }];
      break;
    case "post":
      optimisticMessage.text = url;
      break;
    default:
      optimisticMessage.text = url;
  }
  
  return optimisticMessage;
};

export const updateMessagesAfterSend = (
  result: MessageResult,
  tempMessage: Message,
  mediaType: string,
  mediaUrl: string,
  currentUser: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  selectedChat: string
) => {
  if ("id" in result) {
    const serverMessage: Message = {
      id: result.id,
      sender: currentUser,
      timestamp: result.timestamp || new Date().toISOString(),
      attachments: result.attachments || tempMessage.attachments
    };

    setMessages((prev) =>
      prev.map((msg) => (msg.id === tempMessage.id ? serverMessage : msg))
    );

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, lastMessage: `[${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}]` }
          : chat
      )
    );
    
    return { success: true };
  } else if ("error" in result) {
    setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    return { error: result.error };
  }
  
  return { success: true };
};