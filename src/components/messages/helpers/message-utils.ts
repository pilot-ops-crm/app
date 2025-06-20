import { Chat, Message } from "@/types";

interface MessageSuccessResult {
  id: string;
  timestamp: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
      title: string;
    }
  }>;
}

interface MessageErrorResult {
  error: string;
  errorCode?: string;
}

type MessageResult = MessageSuccessResult | MessageErrorResult;

export const createOptimisticMessage = (url: string, type: string, currentUser: string): Message => {
  return {
    id: `temp-${Date.now()}`,
    sender: currentUser,
    timestamp: new Date().toISOString(),
    attachments: [
      {
        type,
        payload: { 
          url,
          title: type.charAt(0).toUpperCase() + type.slice(1)
        }
      }
    ]
  };
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
      attachments: result.attachments || [
        {
          type: mediaType,
          payload: { 
            url: mediaUrl,
            title: mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
          }
        }
      ]
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